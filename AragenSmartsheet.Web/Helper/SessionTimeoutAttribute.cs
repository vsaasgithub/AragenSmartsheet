using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Web;

namespace AragenSmartsheet.Web.Helper
{
    public class SessionTimeoutAttribute : ActionFilterAttribute, IActionFilter
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.HttpContext.Session.GetString("UserInfo") == null)
            {
                filterContext.Result = new RedirectResult("~/login/index");
                return;
            }
            base.OnActionExecuting(filterContext);
        }
    }
}
