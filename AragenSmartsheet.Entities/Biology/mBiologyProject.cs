namespace AragenSmartsheet.Entities.Biology
{
    public class MBiologyProject
    {
        public MOpenPO OpenPO { get; set; }
        public MSinglePO SinglePO { get; set; }
        public MFTE FTE { get; set; }
    }

    public class MOpenPO
    {
        public string Client { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string ProjectType { get; set; }
        public string Location { get; set; }
        public string ProposalCode { get; set; }
        public string SaleOrder { get; set; }
        public string WBSCode { get; set; }
        public string PONo { get; set; }
        public string Service { get; set; }
        public string ProposalApprovalDate { get; set; }
        public string CompoundReceiptDate { get; set; }
        public string StudyDetails { get; set; }
        public string SalesTeam { get; set; }
        public string ProjectLead { get; set; }
        public string NoOfUnits { get; set; }
        public string NoOfDays { get; set; }
        public string StudyInitiationDate { get; set; }
        public string ActualPOValue { get; set; }
    }

    public class MSinglePO
    {
        public string Client { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string ProjectType { get; set; }
        public string Location { get; set; }
        public string ProposalCode { get; set; }
        public string SaleOrder { get; set; }
        public string WBSCode { get; set; }
        public string PONo { get; set; }
        public string Service { get; set; }
        public string ProposalApprovalDate { get; set; }
        public string CompoundReceiptDate { get; set; }
        public string StudyDetails { get; set; }
        public string SalesTeam { get; set; }
        public string ProjectLead { get; set; }
        public string NoOfUnits { get; set; }
        public string NoOfDays { get; set; }
        public string StudyInitiationDate { get; set; }
        public string ActualPOValue { get; set; }
    }

    public class MFTE
    {
        public string Client { get; set; }
        public string Region { get; set; }
        public string Country { get; set; }
        public string ProjectType { get; set; }
        public string SaleOrder { get; set; }
        public string PONo { get; set; }
        public string WBSCode { get; set; }
        public string ProposalCode { get; set; }
        public string IDD { get; set; }
        public string Service { get; set; }
        public string NoOfFTE { get; set; }
        public string StartDate { get; set; }
        public string FTEContractEndDate { get; set; }
        public string RenewalDate { get; set; }
        public string Status { get; set; }
        public string PMPOC { get; set; }
        public string BD { get; set; }
        public string TotalPOValues { get; set; }
        public string FTECost { get; set; }
        public string PassthroughValue { get; set; }
    }
}
