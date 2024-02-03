using System.Collections.Generic;

namespace AragenSmartsheet.Entities.Client
{
    public class MClient
    {
        public string ClientID { get; set; }
        public string Country { get; set; }
        public string Name1 { get; set; }
        public string Name2 { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
        public string Region { get; set; }
    }

    public static class CustomerMasterData
    {
        public const string CustomerID = "Customer ID";
        public const string Country = "Country";
        public const string Name1 = "Name 1";
        public const string Name2 = "Name 2";
        public const string City = "City";
        public const string PostalCode = "Postal Code";
        public const string Region = "Region";
    }
    public class ProjectPlan
    {
        public string FolderId { set; get; }
        public string Name { set; get; }
        public string  URL { set; get; }
        public List<ProjectPlan> content { set; get; }
           
    }
}
