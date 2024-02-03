using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace AragenSmartsheet.Web.Helper
{
    public class JsonpResult : ObjectResult
    {
        public JsonpResult(object value) : base(value)
        {
            JsonRequestBehavior = JsonRequestBehavior.AllowGet;
        }

        public string Callback { get; set; }

        public JsonRequestBehavior JsonRequestBehavior { get; set; }

        public override void ExecuteResult(ActionContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            var response = context.HttpContext.Response;

            if (!string.IsNullOrEmpty(Callback))
            {
                response.Headers["Content-Type"] = "application/javascript";
                var callback = Uri.EscapeDataString(Callback);
                response.WriteAsync($"{callback}(");
            }

            base.ExecuteResult(context);

            if (!string.IsNullOrEmpty(Callback))
            {
                response.WriteAsync(");");
            }
        }
    }

    public class JsonpResultExecutor : ObjectResultExecutor
    {
        public JsonpResultExecutor(
            IActionResultExecutor<ObjectResult> objectResultExecutor,
        IHttpResponseStreamWriterFactory writerFactory,
        ILoggerFactory loggerFactory,
        IOptions<MvcOptions> mvcOptions)
        : base((OutputFormatterSelector)objectResultExecutor, writerFactory, loggerFactory, mvcOptions)
        {
        }

        public override Task ExecuteAsync(ActionContext context, ObjectResult result)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            if (result == null)
            {
                throw new ArgumentNullException(nameof(result));
            }

            if (result is JsonpResult jsonpResult)
            {
                jsonpResult.Callback = context.HttpContext.Request.Query["callback"];
                jsonpResult.JsonRequestBehavior = JsonRequestBehavior.AllowGet;
            }

            return base.ExecuteAsync(context, result);
        }
    }
}
