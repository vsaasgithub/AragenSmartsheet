using Aragen.Common.Utility;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace AragenSmartsheet.Integration.AppConfiguration
{
    public static class SmartsheetAppConfiguration
    {
        private static readonly string accessToken;
        static SmartsheetAppConfiguration()
        {
            var configurationBuilder = new ConfigurationBuilder();
            var path = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
            configurationBuilder.AddJsonFile(path, false);
            var root = configurationBuilder.Build();
            accessToken = root.GetSection("Smartsheet").GetSection("accesstoken").Value;
          //  accessToken = Cryptography.Decrypt(TokenFromConfig);
        }

        public static string SmartsheetAccessToken
        {
            get => accessToken;
        }
    }
}
