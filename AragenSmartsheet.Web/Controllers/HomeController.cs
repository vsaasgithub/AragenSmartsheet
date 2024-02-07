using AragenSmartsheet.Data.IRepository;
using AragenSmartsheet.Entities.Biology;
using AragenSmartsheet.Entities.CDS;
using AragenSmartsheet.Entities.Client;
using AragenSmartsheet.Entities.Common;
using AragenSmartsheet.Entities.Home;
using AragenSmartsheet.Entities.User;
using AragenSmartsheet.Web.Helper;
using AragenSmartsheet.Web.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Serilog;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;


namespace AragenSmartsheet.Web.Controllers
{
   [SessionTimeout]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> logger;
        private readonly IHomeRepository homeRepo;

        public HomeController(IHomeRepository _homeRepo, ILogger<HomeController> _logger)
        {
            homeRepo = _homeRepo;
            logger = _logger;
        }       

        /// <summary>
        /// Action Method to return Project View which helps to create new project
        /// </summary>
        /// <returns></returns>
        public IActionResult Project()
        {
            try
            {
                FillData();
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
            return View("~/views/home/project.cshtml");
        }

        /// <summary>
        /// Index View which is the main page of the application
        /// </summary>
        /// <returns></returns>
        public IActionResult Index()
        {            
            return View();
        }

        /// <summary>
        /// To Get data for the prefilled dropdowns on Index page
        /// </summary>
        private void FillData()
        {
            var client = homeRepo.GetClients();
            HttpContext.Session.SetString("ClientList", JsonConvert.SerializeObject(client));
            GetRegionAndCountry();
        }

        /// <summary>
        /// Get Region and Country list to show in dropdown in view
        /// </summary>
        private void GetRegionAndCountry()
        {
            RegionCountry regionCountry = new();
            using StreamReader r = new("RegionAndCountry.json");
            string json = r.ReadToEnd();
            var obj = JsonConvert.DeserializeObject<List<RegionCountry>>(json);
            HttpContext.Session.SetString("RegionCountryList", JsonConvert.SerializeObject(obj));

            var RegionList = obj.Select(x => x.Continent).Distinct();

            HttpContext.Session.SetString("RegionList", JsonConvert.SerializeObject(RegionList));
        }

        /// <summary>
        /// Ajax method to get Country based on Region selection
        /// </summary>
        /// <param name="selRegion"></param>
        /// <returns></returns>
        public JsonResult GetCountry(string selRegion)
        {
            try
            {
                var RegionCountry = HttpContext.Session.GetString("RegionCountryList");
                var RegionCountryList = JsonConvert.DeserializeObject<List<RegionCountry>>(RegionCountry);

                var CountryList = RegionCountryList.Where(x => x.Continent.ToLower() == selRegion.ToLower()).Select(y => y.Country).Distinct().OrderBy(x => x);
                var selectlist = new SelectList(CountryList, "country", "country");

                return Json(new SelectList(CountryList));
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return Json(null);
            }
        }

        /// <summary>
        /// Ajax method to get Client Details like city on CLient Name selection
        /// </summary>
        /// <param name="selClient"></param>
        /// <returns></returns>
        public JsonResult GetClientDetails(string selClient)
        {
            try
            {
                var client = HttpContext.Session.GetString("ClientList");
                var clientList = JsonConvert.DeserializeObject<List<MClient>>(client);
                var clientData = clientList.Where(x => x.ClientID == selClient).Select(y => y).FirstOrDefault();

                return Json(clientData);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return Json(null);
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        /// <summary>
        /// Created project in Smartsheet based on Business Unit
        /// </summary>
        /// <param name="form"></param>
        /// <returns></returns>
        public IActionResult CreateProject(IFormCollection form)
        {
            try
            {
                MProjectIntake projectIntake = new();
                 var data = homeRepo.GetClients();
                var client = JsonConvert.SerializeObject(data);
                //var client = HttpContext.Sess(ion.GetString("ClientList");               
                var clientList = JsonConvert.DeserializeObject<List<MClient>>(client);
                var clientData = clientList.Where(x => x.ClientID == Convert.ToString(form["Client"])).Select(y => y).FirstOrDefault();
             var submitter = (JsonConvert.DeserializeObject<MUser>(HttpContext.Session.GetString("UserInfo"))).Email;

                //string wwwPath = Environment.WebRootPath;
                //string contentPath = Environment.ContentRootPath;

                //string path = Path.Combine(this.Environment.WebRootPath, "Uploads");
                //if (!Directory.Exists(path))
                //{
                //    Directory.CreateDirectory(path);
                //}

                //List<string> uploadedFiles = new List<string>();
                //string strCombinePath = string.Empty;
                //foreach (IFormFile postedFile in files)
                //{
                //    string fileName = Path.GetFileName(postedFile.FileName);
                //    strCombinePath = Path.Combine(path, fileName);
                //    using (FileStream stream = new FileStream(strCombinePath, FileMode.Create))
                //    {
                //        postedFile.CopyTo(stream);
                //        uploadedFiles.Add(fileName);
                //    }
                //}


                projectIntake.BusinessUnit = form["BusinessUnit"];
                //projectIntake.FileUpload = strCombinePath;
                if (form["BusinessUnit"] == AragenSmartsheet.Entities.Common.BusinessUnit.CDS)
                {
                    projectIntake.CDSProject = new MCDSProject();
                    if (form["ProjectCategoryCDS"] == "CCS" || form["ProjectCategoryCDS"] == "CM New")
                    {
                        projectIntake.CDSProject.CCS = new MCDSCCS
                        {
                            Client = clientData.Name1,
                            ProposalCode = form["ProposalCode"],
                            ProjectCode = form["ProjectCode"],
                            ProjectName = form["ProjectName"],
                            ProjectType = form["ProjectType"],
                            GMPOrNonGMP = form["GMPOrNonGMP"],
                            Molecules = form["Molecules"],
                            Phase = form["Phase"],
                            Qty = form["Qty"],
                            ProjectCategory = form["ProjectCategoryCDS"],
                            Deliverable = form["Deliverable"],
                            StartDate = form["StartDate"],
                            EndDate = form["EndDate"],
                            ProjectValue = form["ProjectValue"],
                            Region = form["Region"],
                            BDName = form["BDName"],
                            ProjectManager = form["ProjectManager"],
                        };
                         //response = new ProjectPlan();
                        var response = homeRepo.CreateCDSCCSProject(projectIntake, submitter);
                        if (!String.IsNullOrEmpty(response))
                        {
                            ViewBag.Success = "true";                           
                            string[] e = response.Split("+");
                            ViewBag.FolderId = e[0];
                            ViewBag.Name = e[1];
                            ViewBag.FolderLink = e[2];
                        }
                        else
                        {
                            ViewBag.Success = "false";
                        }
                    }
                    else if (form["ProjectCategoryCDS"] == "FC")
                    {
                        projectIntake.CDSProject.FC = new MCDSFC
                        {
                            Client = clientData.Name1,
                            ProposalCode = form["ProposalCode"],
                            ProjectCode = form["ProjectCode"],
                            ProjectName = form["ProjectName"],
                            ProjectType = form["ProjectType"],
                            GMPOrNonGMP = form["GMPOrNonGMP"],
                            Molecules = form["Molecules"],
                            Phase = form["Phase"],
                            Qty = form["Qty"],
                            ProjectCategory = form["ProjectCategoryCDS"],
                            Deliverable = form["Deliverable"],
                            StartDate = form["StartDate"],
                            EndDate = form["EndDate"],
                            ProjectValue = form["ProjectValue"],
                            Region = form["Region"],
                            BDName = form["BDName"],
                            ProjectManager = form["ProjectManager"],
                        };
                       
                        var response = homeRepo.CreateCDSFCProject(projectIntake, submitter);
                        if (!String.IsNullOrEmpty(response))
                        {
                            ViewBag.Success = "true";
                            string[] e = response.Split("+");
                            ViewBag.FolderId = e[0];
                            ViewBag.Name = e[1];
                        }
                        else
                        {
                            ViewBag.Success = "false";
                        }
                    }
                    else if (form["ProjectCategoryCDS"] == "PRD")
                    {
                        projectIntake.CDSProject.PRD = new MCDSPRD
                        {
                            Client = clientData.Name1,
                            ProposalCode = form["ProposalCode"],
                            ProjectCode = form["ProjectCode"],
                            ProjectName = form["ProjectName"],
                            ProjectType = form["ProjectType"],
                            PlannedStartDate = form["PlannedStartDate"],
                            PlannedEndDate = form["PlannedEndDate"],
                            Scientist = form["Scientist"],
                            ProjectManager = form["ProjectManager"],
                            NoOfFTE = form["NoOfFTE"],
                            ProjectValue = form["ProjectValue"],
                            Region = form["Region"],
                            SONumber = form["SONumber"],
                            PONumber = form["PONumber"],
                            BDName = form["BDName"]
                        };
                        var response = homeRepo.CreateCDSPRDProject(projectIntake, submitter);
                        if (!String.IsNullOrEmpty(response))
                        {
                            ViewBag.Success = "smartsheet";
                            ViewBag.FolderId = response;
                            ViewBag.Name = response;

                        }
                        else
                        {
                            ViewBag.Success = "false";
                        }
                    }


                    //projectIntake.CDSProject.Country = form["Country"];

                    //var response = homeRepo.CreateCDSProject(projectIntake);
                    //if (!String.IsNullOrEmpty(response))
                    //{
                    //    ViewBag.Success = "true";
                    //    ViewBag.FolderURL = response;
                    //}
                    //else
                    //{
                    //    ViewBag.Success = "false";
                    //}
                }

                else if (form["BusinessUnit"] == AragenSmartsheet.Entities.Common.BusinessUnit.DiscoveryBiology)
                {
                    projectIntake.BiologyProject = new MBiologyProject();
                    if (form["ProjectTypeBIO"] == "Single PO")
                    {
                        projectIntake.BiologyProject.SinglePO = new MSinglePO
                        {
                            Client = clientData.Name1,
                            Region = form["Region"],
                            Country = form["Country"],
                            ProjectType = form["ProjectTypeBIO"],
                            Location = form["Location"],
                            ProposalCode = form["ProposalCodePO"],
                            SaleOrder = form["SaleOrderPO"],
                            WBSCode = form["WBSCodePO"],
                            PONo = form["PONo"],
                            Service = form["POService"],
                            ProposalApprovalDate = form["ProposalApprovalDate"],
                            CompoundReceiptDate = form["CompoundReceiptDate"],
                            StudyInitiationDate = form["StudyInitiationDate"],
                            StudyDetails = form["StudyDetails"],
                            SalesTeam = form["SalesTeam"],
                            ProjectLead = form["ProjectLead"],
                            NoOfUnits = form["NoOfUnits"],
                            ActualPOValue = form["ActualPOValue"],
                            NoOfDays = form["NoOfDays"]// Convert.ToString(DaysIgnoreWeekends(Convert.ToDateTime(projectIntake.BiologyProject.SinglePO.CompoundReceiptDate).Date, Convert.ToDateTime(projectIntake.BiologyProject.SinglePO.EstimatedEndDate).Date));
                        };


                        var response = homeRepo.CreateBiologySPOProject(projectIntake, submitter);
                        if (!String.IsNullOrEmpty(response))
                        {
                            ViewBag.Success = "smartsheet";                          
                            ViewBag.FolderId = response;
                            ViewBag.Name = response;
                        }
                        else
                        {
                            ViewBag.Success = "false";
                        }
                    }

                    else if (form["ProjectTypeBIO"] == "Open PO")
                    {
                        projectIntake.BiologyProject.OpenPO = new MOpenPO
                        {
                            Client = clientData.Name1,
                            Region = form["Region"],
                            Country = form["Country"],
                            ProjectType = form["ProjectTypeBIO"],
                            Location = form["Location"],
                            ProposalCode = form["ProposalCodePO"],
                            SaleOrder = form["SaleOrderPO"],
                            WBSCode = form["WBSCodePO"],
                            PONo = form["PONo"],
                            Service = form["POService"],
                            ProposalApprovalDate = form["ProposalApprovalDate"],
                            CompoundReceiptDate = form["CompoundReceiptDate"],
                            StudyInitiationDate = form["StudyInitiationDate"],
                            StudyDetails = form["StudyDetails"],
                            SalesTeam = form["SalesTeam"],
                            ProjectLead = form["ProjectLead"],
                            NoOfUnits = form["NoOfUnits"],
                            ActualPOValue = form["ActualPOValue"],
                            NoOfDays = form["NoOfDays"]//Convert.ToString(DaysIgnoreWeekends(Convert.ToDateTime(projectIntake.BiologyProject.OpenPO.CompoundReceiptDate).Date, Convert.ToDateTime(projectIntake.BiologyProject.OpenPO.EstimatedEndDate).Date));
                        };


                        var response = homeRepo.CreateBiologyOPOProject(projectIntake, submitter);
                        if (!String.IsNullOrEmpty(response))
                        {
                            ViewBag.Success = "true";
                            string[] e = response.Split("+");
                            ViewBag.FolderId = e[0];
                            ViewBag.Name = e[1];
                        }
                        else
                        {
                            ViewBag.Success = "false";
                        }
                    }

                    else if (form["ProjectTypeBIO"] == "FTE")
                    {
                        projectIntake.BiologyProject.FTE = new MFTE
                        {
                            Client = clientData.Name1,
                            Region = form["Region"],
                            Country = form["Country"],
                            ProjectType = form["ProjectTypeBIO"],
                            SaleOrder = form["SaleOrder"],
                            PONo = form["PONoFTE"],
                            WBSCode = form["WBSCode"],
                            ProposalCode = form["ProposalCode"],
                            IDD = Convert.ToString(form["IDD"]) ?? string.Empty,
                            Service = form["Service"],
                            NoOfFTE = form["NoOfFTE"],
                            StartDate = form["ContractStartDate"],
                            FTEContractEndDate = form["ContractEndDate"],
                            //RenewalDate = form["RenewalDate"],
                            //projectIntake.BiologyProject.FTE.Status = form["Status"];
                            PMPOC = form["PMPOC"],
                            BD = form["BD"],
                            TotalPOValues = form["TotalPOValues"],
                            FTECost = form["FTECost"],
                            PassthroughValue = form["PassthroughValue"]
                        };


                        var response = homeRepo.CreateBiologyFTEProject(projectIntake, submitter);
                        if (!String.IsNullOrEmpty(response))
                        {
                            ViewBag.Success = "true";
                            string[] e = response.Split("+");
                            ViewBag.FolderId = e[0];
                            ViewBag.Name = e[1];
                        }
                        else
                        {
                            ViewBag.Success = "false";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
            FillData();
            return View("~/views/home/project.cshtml");
        }

        /// <summary>
        /// Return number of days in a week ignoring weekends
        /// </summary>
        /// <param name="dtst"></param>
        /// <param name="dtend"></param>
        /// <returns></returns>
        private static int DaysIgnoreWeekends(DateTime dtst, DateTime dtend)
        {
            TimeSpan days = dtend.Subtract(dtst);
            int count = 0;
            for (int a = 0; a < days.Days + 1; a++)
            {
                if (dtst.DayOfWeek != DayOfWeek.Saturday && dtst.DayOfWeek != DayOfWeek.Sunday)
                {
                    count++;
                }
                dtst = dtst.AddDays(1.0);
            }
            return count;
        }

    }
}
