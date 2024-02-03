using NLog.Fluent;
using Smartsheet.Api;
using System;
using System.Reflection.Metadata.Ecma335;

namespace AragenSmartsheet.Integration.SmartsheetIntegration
{
    public class SmartsheetAppIntegration
    {
        /// <summary>
        /// Creates Smartsheet connection to access Smartsheet  
        /// </summary>
        /// <returns>SmartsheetClient to access Smartsheet Objects</returns>
        public static SmartsheetClient AccessClient()
        {
            try
            {
                string accessToken = AppConfiguration.SmartsheetAppConfiguration.SmartsheetAccessToken;
                SmartsheetClient smartsheet = new SmartsheetBuilder().SetAccessToken(accessToken).Build();
                return smartsheet;
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }
    }
}
