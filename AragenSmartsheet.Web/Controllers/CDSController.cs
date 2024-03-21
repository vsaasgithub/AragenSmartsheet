using AragenSmartsheet.Data.IRepository;
using AragenSmartsheet.Entities.CDS;
using AragenSmartsheet.Web.Helper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using NLog.Fluent;
using Smartsheet.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Resources;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;

namespace AragenSmartsheet.Web.Controllers
{
    [SessionTimeout]
    public class CDSController : Controller
    {
        private readonly ILogger<CDSController> _logger;
        private readonly ICDSRepository cdsRepo;

        public CDSController(ICDSRepository _cdsRepo, ILogger<CDSController> logger)
        {
            cdsRepo = _cdsRepo;
            _logger = logger;
        }

        /// <summary>
        /// Default Method which returns list of all Project Folders created so far
        /// </summary>
        /// <returns></returns>
        public IActionResult Index()
        {
            var FolderList = cdsRepo.GetProjectsList();
            HttpContext.Session.SetString("CDSFolderList", JsonConvert.SerializeObject(FolderList));
            return View(FolderList);
        }




        /// <summary>
        /// Insert and update ganttchart functionalities
        /// </summary>       
        /// <param name="datalists">ganttchart push the list of data get for datalist in json</param> 
        /// <returns></returns>        
        public IActionResult GanttChartUpdate(string datalists)
        {
            try
            {
                List<MCDSTasks> datalist = JsonConvert.DeserializeObject<List<MCDSTasks>>(datalists);
                if (HttpContext.Session.GetString("SelectedFolderID") != null)
                {
                    string FolderID = HttpContext.Session.GetString("SelectedFolderID");
                    var InsertData = cdsRepo.GanttChartUpdate(datalist, FolderID);
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
            return Json("");
        }

        /// <summary>
        /// delete the selected row in smartsheet
        /// </summary>
        /// <param name="DeleteIds">delete for the row id passed  </param> 
        /// <returns></returns>
        public IActionResult ProjectPlanDeleteRows([FromBody] List<long> DeleteIds)
        {
            try
            {
                if (HttpContext.Session.GetString("SelectedFolderID") != null)
                {
                    string FolderID = HttpContext.Session.GetString("SelectedFolderID");

                    var Delete = cdsRepo.ProjectPlanDeleteRow(DeleteIds, FolderID);
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
            return Json("Success");
        }

        /// <summary>
        /// Session using set and get the smartsheet FoldeId and Foldername 
        /// </summary>
        /// <param name="FolderName">smarsheet Folder Name get   </param> 
        /// //<param name="FolderID">FolderID param use with Get the smarsheet Folder Access sheet id  </param>
        /// <returns></returns>
        public IActionResult GanttChart(string FolderID, string FolderName, string FolderLink)
        {
            List<MCDSFolderSheets> folderSheets = new();
            List<MCDSFolder> FolderList;
            try

            {
                if (FolderID == null)
                {
                    var data = TempData["FolderId"];
                    if (data != null)
                    {
                        FolderID = TempData["FolderId"] as string;

                    }
                }
                if (FolderName == null)
                {
                    FolderName = TempData["ProjectName"] as string;
                    ViewBag.ProjectName = FolderName;
                }
                else { ViewBag.ProjectName = FolderName; }
                HttpContext.Session.SetString("SelectedFolderID", FolderID);
                HttpContext.Session.SetString("FolderName", FolderName);
                var check = HttpContext.Session.GetString("CDSFolderList");
                if (check != null)
                {
                    FolderList = JsonConvert.DeserializeObject<List<MCDSFolder>>(HttpContext.Session.GetString("CDSFolderList"));
                }
                else
                {
                    FolderList = cdsRepo.GetProjectsList();
                }

                //if(folderSheets!=null&& check != null)
                //    {
                //        var FolderList = JsonConvert.DeserializeObject<List<MCDSFolder>>(HttpContext.Session.GetString("CDSFolderList"));
                //        folderSheets = FolderList.Where(x => x.FolderID == Convert.ToInt64(FolderID)).Select(y => y.FolderSheets).FirstOrDefault();
                //       // folderSheets = FolderList.Where(x => x.FolderID == Convert.ToInt64(FolderID)).Select(y => y.FolderSheets).FirstOrDefault();
                //      //  var Name = FolderList.Where(x => x.FolderID == Convert.ToInt64(FolderID)).Select(y => y.FolderName).FirstOrDefault();
                //        ViewBag.ProjectName = Name;
                //}
                //else
                //{

                folderSheets = FolderList.Where(x => x.FolderID == Convert.ToInt64(FolderID)).Select(y => y.FolderSheets).FirstOrDefault();
                var Name = FolderList.Where(x => x.FolderID == Convert.ToInt64(FolderID)).Select(y => y.FolderName).FirstOrDefault();
                ViewBag.ProjectName = Name;
                //ViewBag.ProjectPlanSheet = folderSheets.Where(x => x.SheetName == "Project Plan").Select(y => y.SheetLink).FirstOrDefault();
                //ViewBag.ProjectMetaDataSheet = folderSheets.Where(x => x.SheetName == "Project Metadata").Select(y => y.SheetLink).FirstOrDefault();
                //ViewBag.ProjectResources = folderSheets.Where(x => x.SheetName == "Project Resources").Select(y => y.SheetLink).FirstOrDefault();
                ViewBag.ProjectFolderLink = FolderLink;
                var ResourceSheetID = Convert.ToString(folderSheets.Where(x => x.SheetName == "Project Resources").Select(y => y.SheetID).FirstOrDefault());
                if (ResourceSheetID != null && Convert.ToInt64(ResourceSheetID) > 0)
                {
                    List<string> ListofValues = new List<string>();
                    List<string> ListofKey = new List<string>();

                    var ResourceList = cdsRepo.GetProjectResources(ResourceSheetID);
                    HttpContext.Session.SetString("ProjectResources", JsonConvert.SerializeObject(ResourceList));


                    foreach (var item in ResourceList)
                    {

                        ListofValues.Add(item.Value);
                        ListofKey.Add(item.Key);
                    }


                    ViewBag.TaskList = JsonConvert.SerializeObject(ListofValues);
                    ViewBag.ListofKey = JsonConvert.SerializeObject(ListofKey);
                }

                ViewBag.FolderId = FolderID;


            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
            return View("~/Views/CDS/GanttChart.cshtml", folderSheets);
        }

        public IActionResult GanttMetaChart()
        {
            List<MCDSFolderSheets> folderSheets = new();
            List<MetaDataTask> MetaDataTask = new();
            try
            {

                var FolderID = HttpContext.Session.GetString("SelectedFolderID");
                var FolderList = JsonConvert.DeserializeObject<List<MCDSFolder>>(HttpContext.Session.GetString("CDSFolderList"));
                folderSheets = FolderList.Where(x => x.FolderID == Convert.ToInt64(FolderID)).Select(y => y.FolderSheets).FirstOrDefault();

                var lstTask = cdsRepo.ProjectMetatData(FolderID);
                MetaDataTask = lstTask.ToList();
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
            return View("~/Views/CDS/GanttMetaChart.cshtml", MetaDataTask);
        }

        /// <summary>
        ///  get the all current data from the smartsheet
        /// </summary>
        /// <returns></returns>
        public IActionResult GetChartData()
        {
            try
            {
                string strFolderID = string.Empty;
                string FolderName = string.Empty;
                if (HttpContext.Session.GetString("SelectedFolderID") != null)
                {
                    strFolderID = HttpContext.Session.GetString("SelectedFolderID");
                    FolderName = HttpContext.Session.GetString("FolderName");
                    TempData["FolderId"] = strFolderID;
                    TempData["ProjectName"] = FolderName;
                }
                var lstTask = cdsRepo.GetProjectPlans(strFolderID);
                var datacheck = lstTask.GroupBy(x => x.ParentId).Take(1).ToList();
                return Json(lstTask.GroupBy(x => x.ParentId).Take(1).ToList());
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return Json(null);
            }
        }

        public IActionResult ProjectMetaData()
        {
            try
            {
                string strFolderID = string.Empty;
                if (HttpContext.Session.GetString("SelectedFolderID") != null)
                {
                    strFolderID = HttpContext.Session.GetString("SelectedFolderID");
                }
                var lstTask = cdsRepo.ProjectMetatData(strFolderID);
                //var datacheck = lstTask.GroupBy(x => x.ParentId).Take(1).ToList();
                return Json(lstTask.ToList());
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return Json(null);
            }
        }





        // // // // // // ///////////////////////////////////////
        //New Code

        public IActionResult GanttView(string FolderID, string FolderName, string FolderLink)
        {
            List<MCDSFolderSheets> folderSheets = new();
            List<MCDSFolder> FolderList;
            try
            {
                if (FolderID == null)
                {
                    var data = TempData["FolderId"];
                    if (data != null)
                    {
                        FolderID = TempData["FolderId"] as string;
                    }
                }
                if (FolderName == null)
                {
                    FolderName = TempData["ProjectName"] as string;
                    ViewBag.ProjectName = FolderName;
                }
                else { ViewBag.ProjectName = FolderName; }
                HttpContext.Session.SetString("SelectedFolderID", FolderID);
                HttpContext.Session.SetString("FolderName", FolderName);
                var check = HttpContext.Session.GetString("CDSFolderList");
                if (check != null)
                {
                    FolderList = JsonConvert.DeserializeObject<List<MCDSFolder>>(HttpContext.Session.GetString("CDSFolderList"));
                }
                else
                {
                    FolderList = cdsRepo.GetProjectList();
                }

                folderSheets = FolderList.Where(x => x.FolderID == Convert.ToInt64(FolderID)).Select(y => y.FolderSheets).FirstOrDefault();
                if (folderSheets == null)
                {
                    FolderList = cdsRepo.GetProjectList();
                    folderSheets = FolderList.Where(x => x.FolderID == Convert.ToInt64(FolderID)).Select(y => y.FolderSheets).FirstOrDefault();
                }
                var Name = FolderList.Where(x => x.FolderID == Convert.ToInt64(FolderID)).Select(y => y.FolderName).FirstOrDefault();
                ViewBag.ProjectName = Name;
                ViewBag.FolderID = FolderID;
                ViewBag.ProjectFolderLink = FolderLink;
                ViewBag.ProjectResources = folderSheets.Where(x => x.SheetName == "Project Resources").Select(y => y.SheetLink).FirstOrDefault();
                //ViewBag.ProjectDashboard = folderSheets.Where(x => x.SheetName == "Project Dashboard").Select(y => y.SheetLink).FirstOrDefault();

                var ProjPlanSheetID = folderSheets.Where(x => x.SheetName == "Project Plan").Select(y => y.SheetID).FirstOrDefault();
                var ProjResourcesSheetID = folderSheets.Where(x => x.SheetName == "Project Resources").Select(y => y.SheetID).FirstOrDefault();
                var GanttResourceAssignmentsSheetID = folderSheets.Where(x => x.SheetName == "Gantt Resource Assignments").Select(y => y.SheetID).FirstOrDefault();
                var GanttDependenciesSheetID = folderSheets.Where(x => x.SheetName == "Gantt Dependencies").Select(y => y.SheetID).FirstOrDefault();



                HttpContext.Session.SetString("ProjPlanSheetID", JsonConvert.SerializeObject(ProjPlanSheetID));
                HttpContext.Session.SetString("ProjResourcesSheetID", JsonConvert.SerializeObject(ProjResourcesSheetID));
                HttpContext.Session.SetString("GanttResourceAssignmentsSheetID", JsonConvert.SerializeObject(GanttResourceAssignmentsSheetID));
                HttpContext.Session.SetString("GanttDependenciesSheetID", JsonConvert.SerializeObject(GanttDependenciesSheetID));

                return View("~/Views/CDS/GanttView.cshtml");
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        public IActionResult GanttView_PDF(string FolderID, string FolderName, string FolderLink)
        {
            List<MCDSFolderSheets> folderSheets = new();
            List<MCDSFolder> FolderList;
            try
            {
                if (FolderID == null)
                {
                    var data = TempData["FolderId"];
                    if (data != null)
                    {
                        FolderID = TempData["FolderId"] as string;

                    }
                }
                if (FolderName == null)
                {
                    FolderName = TempData["ProjectName"] as string;
                    ViewBag.ProjectName = FolderName;
                }
                else { ViewBag.ProjectName = FolderName; }
                HttpContext.Session.SetString("SelectedFolderID", FolderID);
                HttpContext.Session.SetString("FolderName", FolderName);
                var check = HttpContext.Session.GetString("CDSFolderList");
                if (check != null)
                {
                    FolderList = JsonConvert.DeserializeObject<List<MCDSFolder>>(HttpContext.Session.GetString("CDSFolderList"));
                }
                else
                {
                    FolderList = cdsRepo.GetProjectList();
                }

                folderSheets = FolderList.Where(x => x.FolderID == Convert.ToInt64(FolderID)).Select(y => y.FolderSheets).FirstOrDefault();
                if (folderSheets == null)
                {
                    FolderList = cdsRepo.GetProjectList();
                    folderSheets = FolderList.Where(x => x.FolderID == Convert.ToInt64(FolderID)).Select(y => y.FolderSheets).FirstOrDefault();
                }
                var Name = FolderList.Where(x => x.FolderID == Convert.ToInt64(FolderID)).Select(y => y.FolderName).FirstOrDefault();
                ViewBag.ProjectName = Name;
                ViewBag.ProjectFolderLink = FolderLink;
                ViewBag.ProjectResources = folderSheets.Where(x => x.SheetName == "Project Resources").Select(y => y.SheetLink).FirstOrDefault();

                var ProjPlanSheetID = folderSheets.Where(x => x.SheetName == "Project Plan").Select(y => y.SheetID).FirstOrDefault();
                var ProjResourcesSheetID = folderSheets.Where(x => x.SheetName == "Project Resources").Select(y => y.SheetID).FirstOrDefault();
                var GanttResourceAssignmentsSheetID = folderSheets.Where(x => x.SheetName == "Gantt Resource Assignments").Select(y => y.SheetID).FirstOrDefault();
                var GanttDependenciesSheetID = folderSheets.Where(x => x.SheetName == "Gantt Dependencies").Select(y => y.SheetID).FirstOrDefault();



                HttpContext.Session.SetString("ProjPlanSheetID", JsonConvert.SerializeObject(ProjPlanSheetID));
                HttpContext.Session.SetString("ProjResourcesSheetID", JsonConvert.SerializeObject(ProjResourcesSheetID));
                HttpContext.Session.SetString("GanttResourceAssignmentsSheetID", JsonConvert.SerializeObject(GanttResourceAssignmentsSheetID));
                HttpContext.Session.SetString("GanttDependenciesSheetID", JsonConvert.SerializeObject(GanttDependenciesSheetID));

                return View("~/Views/CDS/GanttView_PDF.cshtml");
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        //Gantt Tasks Methods
        public IActionResult GanttTasks()
        {
            try
            {
                var ProjPlanSheetID = HttpContext.Session.GetString("ProjPlanSheetID");
                if (!string.IsNullOrEmpty(ProjPlanSheetID))
                {
                    var tasks = cdsRepo.GetAllTasks(ProjPlanSheetID);

                    HttpContext.Session.SetString("GanttTasks", JsonConvert.SerializeObject(tasks));
                    return new JsonResult(tasks);
                }
                else
                {
                    return RedirectToAction("Index", "Home");
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        //[Route("CDS/GanttTasks/Update")]       
        //public IActionResult GanttTasksUpdate([FromQuery] string models){
        //    try
        //    {
        //        if (models != null)
        //        {
        //            var TasksToUpdate = JsonConvert.DeserializeObject<IEnumerable<MCDSTask>>(models);

        //            //var tasks = HttpContext.Session.GetString("GanttTasks");
        //            var ProjPlanSheetID = HttpContext.Session.GetString("ProjPlanSheetID");
        //            if (!string.IsNullOrEmpty(ProjPlanSheetID))
        //            {
        //                //var GanttTasks = JsonConvert.DeserializeObject<List<MCDSTask>>(tasks);
        //                cdsRepo.UpdateTask(TasksToUpdate.ToList(), ProjPlanSheetID);
        //            }
        //            else
        //            {
        //                return RedirectToAction("Index", "Home");
        //            }                    
        //        }
        //        return new JsonResult(models);
        //    }
        //    catch (Exception ex)
        //    {
        //        Log.Error(ex.Message);
        //        Log.Error(ex.StackTrace);
        //        return null;
        //    }            
        //}

        [HttpPost]
        [Route("CDS/GanttTasks/Update")]
        public IActionResult GanttTasksUpdate(string models)
        {
            try
            {
                if (models != null)
                {
                    var GanttDependenciesSheetID = HttpContext.Session.GetString("GanttDependenciesSheetID");

                    var TasksToUpdate = JsonConvert.DeserializeObject<IEnumerable<MCDSTask>>(models);

                    //var tasks = HttpContext.Session.GetString("GanttTasks");
                    var ProjPlanSheetID = HttpContext.Session.GetString("ProjPlanSheetID");
                    if (!string.IsNullOrEmpty(ProjPlanSheetID))
                    {
                        //var GanttTasks = JsonConvert.DeserializeObject<List<MCDSTask>>(tasks);
                        cdsRepo.UpdateTask(TasksToUpdate.ToList(), ProjPlanSheetID, GanttDependenciesSheetID, true);
                    }
                    else
                    {
                        return RedirectToAction("Index", "Home");
                    }
                }
                // Important Note: Return null in the response body here so that data is not corrupted on the client side.
                // return new JsonResult(models);
                return new JsonResult(null);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        public void Baseline(string baselineSet)
        {
            var ProjPlanSheetID = HttpContext.Session.GetString("ProjPlanSheetID");
            cdsRepo.BaselineSet(baselineSet, ProjPlanSheetID);
        }

        [Route("CDS/GanttTasks/Destroy")]
        public IActionResult GanttTasksDestroy([FromQuery] string models)
        {
            try
            {
                if (models != null)
                {
                    var TasksToDelete = JsonConvert.DeserializeObject<IEnumerable<MCDSTask>>(models);

                    //var tasks = HttpContext.Session.GetString("GanttTasks");
                    var ProjPlanSheetID = HttpContext.Session.GetString("ProjPlanSheetID");
                    var GanttDependenciesSheetID = HttpContext.Session.GetString("GanttDependenciesSheetID");
                    if (!string.IsNullOrEmpty(ProjPlanSheetID))
                    {
                        //var GanttTasks = JsonConvert.DeserializeObject<List<MCDSTask>>(tasks);
                        cdsRepo.DeleteTask(TasksToDelete.ToList(), ProjPlanSheetID, GanttDependenciesSheetID);
                    }
                    else
                    {
                        return RedirectToAction("Index", "Home");
                    }
                }
                return new JsonResult(models);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        //[Route("CDS/GanttTasks/Create")]
        //public IActionResult GanttTasksCreate([FromQuery] string models)
        //{
        //    try
        //    {
        //        if (models != null)
        //        {
        //            var TasksToCreate = JsonConvert.DeserializeObject<IEnumerable<MCDSTask>>(models);

        //            //var tasks = HttpContext.Session.GetString("GanttTasks");
        //            var ProjPlanSheetID = HttpContext.Session.GetString("ProjPlanSheetID");
        //            if (!string.IsNullOrEmpty(ProjPlanSheetID))
        //            {
        //                //var GanttTasks = JsonConvert.DeserializeObject<List<MCDSTask>>(tasks);
        //                cdsRepo.CreateTask(TasksToCreate.ToList(), ProjPlanSheetID);
        //            }
        //            else
        //            {
        //                return RedirectToAction("Index", "Home");
        //            }
        //        }
        //        return new JsonResult(models);
        //    }
        //    catch (Exception ex)
        //    {
        //        Log.Error(ex.Message);
        //        Log.Error(ex.StackTrace);
        //        return null;
        //    }
        //}

        [HttpPost]
        [Route("CDS/GanttTasks/Create")]
        public IActionResult GanttTasksCreate(string models)
        {
            try
            {
                if (models != null)
                {
                    var TasksToCreate = JsonConvert.DeserializeObject<IEnumerable<MCDSTask>>(models);

                    //var tasks = HttpContext.Session.GetString("GanttTasks");
                    var ProjPlanSheetID = HttpContext.Session.GetString("ProjPlanSheetID");
                    if (!string.IsNullOrEmpty(ProjPlanSheetID))
                    {
                        //var GanttTasks = JsonConvert.DeserializeObject<List<MCDSTask>>(tasks);
                        cdsRepo.CreateTask(TasksToCreate.ToList(), ProjPlanSheetID);
                    }
                    else
                    {
                        return RedirectToAction("Index", "Home");
                    }
                }
                return new JsonResult(models);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        //Gantt Dependencies                
        public IActionResult GanttDependencies()
        {
            try
            {
                var GanttDependenciesSheetID = HttpContext.Session.GetString("GanttDependenciesSheetID");
                if (!string.IsNullOrEmpty(GanttDependenciesSheetID))
                {
                    var dependencies = cdsRepo.GetGanttDependencies(GanttDependenciesSheetID);
                    return new JsonResult(dependencies);
                }
                else
                {
                    return RedirectToAction("Index", "Home");
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        [HttpPost]
        [Route("CDS/GanttDependencies/Update")]
        public IActionResult GanttDependenciesUpdate(string models)
        {
            try
            {
                if (models != null)
                {
                    var DependencyToUpdate = JsonConvert.DeserializeObject<IEnumerable<MCDSDependency>>(models);

                    var GanttDependenciesSheetID = HttpContext.Session.GetString("GanttDependenciesSheetID");
                    if (!string.IsNullOrEmpty(GanttDependenciesSheetID))
                    {
                        cdsRepo.UpdateGanttDependencies(DependencyToUpdate.ToList(), GanttDependenciesSheetID);
                    }
                    else
                    {
                        return RedirectToAction("Index", "Home");
                    }
                }
                // Important Note: Return null in the response body here so that data is not corrupted on the client side.
                //return new JsonResult(models);
                return new JsonResult(null);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        [Route("CDS/GanttDependencies/Destroy")]
        public IActionResult GanttDependenciesDestroy([FromQuery] string models)
        {
            try
            {
                if (models != null)
                {
                    var DependenciesToDelete = JsonConvert.DeserializeObject<IEnumerable<MCDSDependency>>(models);

                    var GanttDependenciesSheetID = HttpContext.Session.GetString("GanttDependenciesSheetID");
                    if (!string.IsNullOrEmpty(GanttDependenciesSheetID))
                    {
                        cdsRepo.DeleteGanttDependencies(DependenciesToDelete.ToList(), GanttDependenciesSheetID);
                    }
                    else
                    {
                        return RedirectToAction("Index", "Home");
                    }
                }
                return new JsonResult(models);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        [Route("CDS/GanttDependencies/Create")]
        public IActionResult GanttDependenciesCreate([FromQuery] string models)
        {
            try
            {
                if (models != null)
                {
                    var DependenciesToCreate = JsonConvert.DeserializeObject<IEnumerable<MCDSDependency>>(models);

                    var GanttDependenciesSheetID = HttpContext.Session.GetString("GanttDependenciesSheetID");
                    if (!string.IsNullOrEmpty(GanttDependenciesSheetID))
                    {
                        cdsRepo.CreateGanttDependencies(DependenciesToCreate.ToList(), GanttDependenciesSheetID);
                    }
                    else
                    {
                        return RedirectToAction("Index", "Home");
                    }
                }
                // Important Note: Return null in the response body here so that data is not corrupted on the client side.
                return new JsonResult(null);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        //Gantt Resources
        public IActionResult GanttResources(string callback)
        {
            try
            {
                var ProjResourcesSheetID = HttpContext.Session.GetString("ProjResourcesSheetID");
                if (!string.IsNullOrEmpty(ProjResourcesSheetID))
                {
                    var resources = cdsRepo.GetGanttResources(ProjResourcesSheetID);
                    return new JsonResult(resources);
                }
                else
                {
                    return RedirectToAction("Index", "Home");
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        //Gantt Resource Assignments                
        public IActionResult GanttResourceAssignments()
        {
            try
            {
                var GanttResourceAssignmentsSheetID = HttpContext.Session.GetString("GanttResourceAssignmentsSheetID");
                if (!string.IsNullOrEmpty(GanttResourceAssignmentsSheetID))
                {
                    var resourceAssignment = cdsRepo.GetGanttResourceAssignments(GanttResourceAssignmentsSheetID);
                    return new JsonResult(resourceAssignment);
                }
                else
                {
                    return RedirectToAction("Index", "Home");
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        [Route("CDS/GanttResourceAssignments/Update")]
        public IActionResult GanttResourceAssignmentsUpdate([FromQuery] string models)
        {
            try
            {
                if (models != null)
                {
                    var ResourceAssignmentsToUpdate = JsonConvert.DeserializeObject<IEnumerable<MCDSResourceAssignment>>(models);

                    var GanttResourceAssignmentsSheetID = HttpContext.Session.GetString("GanttResourceAssignmentsSheetID");
                    if (!string.IsNullOrEmpty(GanttResourceAssignmentsSheetID))
                    {
                        cdsRepo.UpdateGanttResourceAssignments(ResourceAssignmentsToUpdate.ToList(), GanttResourceAssignmentsSheetID);
                    }
                    else
                    {
                        return RedirectToAction("Index", "Home");
                    }
                }
                // Important Note: Return null in the response body here so that data is not corrupted on the client side.
                //return new JsonResult(models);
                return new JsonResult(null);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        [Route("CDS/GanttResourceAssignments/Destroy")]
        public IActionResult GanttResourceAssignmentsDestroy([FromQuery] string models)
        {
            try
            {
                if (models != null)
                {
                    var ResourceAssignmentsToUpdate = JsonConvert.DeserializeObject<IEnumerable<MCDSResourceAssignment>>(models);

                    var GanttResourceAssignmentsSheetID = HttpContext.Session.GetString("GanttResourceAssignmentsSheetID");
                    if (!string.IsNullOrEmpty(GanttResourceAssignmentsSheetID))
                    {
                        cdsRepo.DeleteGanttResourceAssignments(ResourceAssignmentsToUpdate.ToList(), GanttResourceAssignmentsSheetID);
                    }
                    else
                    {
                        return RedirectToAction("Index", "Home");
                    }
                }
                return new JsonResult(models);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        [Route("CDS/GanttResourceAssignments/Create")]
        public IActionResult GanttResourceAssignmentsCreate([FromQuery] string models)
        {
            try
            {
                if (models != null)
                {
                    var ResourceAssignmentsToUpdate = JsonConvert.DeserializeObject<IEnumerable<MCDSResourceAssignment>>(models);

                    var GanttResourceAssignmentsSheetID = HttpContext.Session.GetString("GanttResourceAssignmentsSheetID");
                    if (!string.IsNullOrEmpty(GanttResourceAssignmentsSheetID))
                    {
                        cdsRepo.CreateGanttResourceAssignments(ResourceAssignmentsToUpdate.ToList(), GanttResourceAssignmentsSheetID);
                    }
                    else
                    {
                        return RedirectToAction("Index", "Home");
                    }
                }
                return new JsonResult(models);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }
        public bool CodeCheck(string Code)
        {
            var FolderList = cdsRepo.GetProjectsList_ToCheckName();
            foreach (var item in FolderList)
            {
                if (item.FolderName.Split('_')[0] == Code)
                {
                    return false;
                }

            }
            return true;
        }

    }

}
