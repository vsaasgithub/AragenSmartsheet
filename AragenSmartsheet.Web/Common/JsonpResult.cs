﻿//using Microsoft.AspNetCore.Mvc;
//using System;

//namespace AragenSmartsheet.Web.Common
//{
//    public class JsonpResult : JsonResult
//    {
//        object data = null;

//        public JsonpResult()
//        {
//        }

//        public JsonpResult(object data)
//        {
//            this.data = data;
//        }

//        public override void ExecuteResult(ControllerContext controllerContext)
//        {
//            if (controllerContext != null)
//            {
//                HttpResponseBase Response = controllerContext.HttpContext.Response;
//                HttpRequestBase Request = controllerContext.HttpContext.Request;

//                string callbackfunction = Request["callback"];

//                if (string.IsNullOrEmpty(callbackfunction))
//                {
//                    throw new Exception("Callback function name must be provided in the request!");
//                }
//                Response.ContentType = "application/x-javascript";
//                if (data != null)
//                {
//                    JavaScriptSerializer serializer = new JavaScriptSerializer();
//                    Response.Write(string.Format("{0}({1});", callbackfunction, serializer.Serialize(data)));
//                }
//            }
//        }
//    }
//}
