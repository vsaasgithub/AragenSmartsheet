namespace AragenSmartsheet.Entities.CDS
{
    public class MCDSProject
    {
        public MCDSPRD PRD { get; set; }
        public MCDSFC FC { get; set; }
        public MCDSCCS CCS { get; set; }

    }

    public class MCDSPRD
    {
        public string Client { get; set; }
        public string ProposalCode { get; set; }
        public string ProjectCode { get; set; }
        public string ProjectName { get; set; }
        public string ProjectType { get; set; }
        public string PlannedStartDate { get; set; }
        public string PlannedEndDate { get; set; }
        public string Scientist { get; set; }
        public string ProjectManager { get; set; }
        public string ProjectValue { get; set; }
        public string NoOfFTE { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string SONumber { get; set; }
        public string PONumber { get; set; }
        public string BDName { get; set; }
    }

    public class MCDSFC
    {
        public string Client { get; set; }
        public string ProposalCode { get; set; }
        public string ProjectCode { get; set; }
        public string ProjectName { get; set; }
        public string ProjectType { get; set; }
        public string GMPOrNonGMP { get; set; }
        public string Molecules { get; set; }
        public string Phase { get; set; }
        public string Qty { get; set; }
        public string Units { get; set; }
        public string CommittedYield { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string ProjectValue { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string Deliverable { get; set; }
        public string ProjectCategory { get; set; }
        public string BDName { get; set; }
        public string ProjectManager { get; set; }
    }

    public class MCDSCCS
    {
        public string Client { get; set; }
        public string ProposalCode { get; set; }
        public string ProjectCode { get; set; }
        public string ProjectName { get; set; }
        public string ProjectType { get; set; }
        public string GMPOrNonGMP { get; set; }
        public string Molecules { get; set; }
        public string Phase { get; set; }
        public string Qty { get; set; }
        public string ProjectCategory { get; set; }
        public string CommittedYield { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string ProjectValue { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string Deliverable { get; set; }
        public string BDName { get; set; }
        public string ProjectManager { get; set; }
    }
}
