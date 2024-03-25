using Microsoft.AspNetCore.Mvc;
using Aragen.Common.Utility;
using AragenSmartsheet.Entities.User;
using Microsoft.AspNetCore.Http;
using Smartsheet.Api.Models;
using Newtonsoft.Json;
using System.Configuration;
using Microsoft.Extensions.Configuration;
using System.DirectoryServices;
using System;
using Serilog;

namespace AragenSmartsheet.Web.Controllers
{
    public class LoginController : Controller
    {
        private IConfiguration configuration;
        public LoginController(IConfiguration iConfig)
        {
            configuration = iConfig;
        }
        public IActionResult Index()
        {
            return View();
        }


        /// <summary>
        /// Controller method to Authenticate user from Active Directory
        /// </summary>
        /// <param name="username"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public IActionResult Authenticate(string username, string password)
        {
            System.DirectoryServices.SearchResult result;
            //try
            //{
            //    string DomainName = configuration.GetSection("domain").Value;
            //    DirectoryEntry dEntry = new(DomainName, username, password);
            //    DirectorySearcher dSearcher = new(dEntry);
            //    if (!username.Contains("@"))
            //    {
            //        dSearcher.Filter = "(SAMAccountName=" + username + ")";
            //    }
            //    else
            //    {
            //        dSearcher.Filter = "(Mail=" + username + ")";
            //    }
            //    dSearcher.PropertiesToLoad.Add("SAMAccountName");
            //    dSearcher.PropertiesToLoad.Add("Mail");

            //    result = dSearcher.FindOne();
            //    if (result != null)
            //    {
            //        UserInfo = new MUser();
            //        UserInfo.Name = result.Properties["SAMAccountName"][0].ToString();
            //        UserInfo.Email = result.Properties["Mail"][0].ToString();
            //        UserInfo.Department = result.Properties["Department"][0].ToString();
            //        UserInfo.Company = result.Properties["Company"][0].ToString();
            //        HttpContext.Session.SetString("UserInfo", JsonConvert.SerializeObject(UserInfo));
            //        return RedirectToAction("Index", "Home");
            //    }
            //    else
            //    {
            //        ViewBag.Error = "Invalid username or password.";
            //        return View("~/views/login/index.cshtml");
            //    }
            //}
            //catch (Exception ex)
            //{
            //    Log.Error(ex.Message);
            //    Log.Error(ex.StackTrace);

            //    if (ex.Message == "The user name or password is incorrect.")
            //    {
            //        ViewBag.Error = "The user name or password is incorrect.";
            //    }
            //    else
            //    {
            //        ViewBag.Error = "Some error occured.";
            //    }

            //    return View("~/views/login/index.cshtml");
            //}


            //string domain = configuration.GetSection("domain").Value;
            //var user = Authentication.AuthenticateUserAgainstDomain(domain, username, password, false);
            //if (user != null)
            //{
            //    UserInfo = new MUser();
            //    UserInfo.Name = user.EmployeeName;
            //    UserInfo.Email = user.EmployeeMailId;
            //    UserInfo.Department = user.Department;
            //    UserInfo.Company = user.Company;
            //    HttpContext.Session.SetString("UserInfo", JsonConvert.SerializeObject(UserInfo));
            //    return RedirectToAction("Index", "Home");
            //}

            ////For local dev
            MUser UserInfo = new()
            {
                Name = "Aragen User",
                Email = "abhishek@copernicusworld.com",
                Department = "CDS",
                Company = "CCPL"
            };
            HttpContext.Session.SetString("UserInfo", JsonConvert.SerializeObject(UserInfo));
            return RedirectToAction("Index", "Home");


            //ViewBag.Error = "Invalid username or password.";
            //return View("~/views/login/index.cshtml");
             


        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Index");
        }
    }
}
