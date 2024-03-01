namespace AragenSmartsheet.Entities.CDS
{
    public static class CDSIntakeForm
    {
        public const string BusinessUnit = "Business Unit";
        public const string Client = "Client";
        public const string ProjectCode = "Project Code";
        public const string ProposalCode = "Proposal Code";
        public const string PlannedStartDate = "Planned Start Date";
        public const string PlannedEndDate = "Planned End Date";
        public const string Qty = "Qty (in Kg)";
        public const string ProjectCategory = "Category Type";
        public const string ProjectType = "Project Type";
        public const string Type = "Type";
        public const string PlantLab = "Plant/Lab";
        public const string GMPNonGMP = "GMP/ Non-GMP";
        public const string Molecules = "Molecules";
        public const string Phase = "Phase";
        public const string Deliverable = "Deliverable";
        public const string Region = "Region";
        public const string Country = "Country";
        public const string Scientist = "Scientist";
        public const string ProjectManager = "Project Manager";
        public const string DelayReason = "Delay Reason";
        public const string ProjectValue = "Project Value (in USD)";
        public const string BudgetConsumed = "Budget Consumed";
        public const string BudgetAvailable = "Budget Available";
        public const string DashboardURL = "Dashboard URL";
        public const string Submitter = "Submitter";
        public const string ProjectHealth = "Project Health";
        public const string ActualStartDate = "Actual Start Date";
        public const string ActualEndDate = "Actual End Date";
        public const string PercentComplete = "% Complete";
        public const string ProjectStatus = "Project Status";
        public const string ManufacturingUnit = "Manufacturing Unit";
        public const string BDName = "BD Name";
    }

    public static class CDSPRDIntakeForm
    {
        public const string BusinessUnit = "Business Unit";
        public const string Client = "Client";
        public const string ProjectCode = "Project Code";
        //public const string ProjectName = "Project Name";
        public const string ProposalCode = "Proposal Code";
        public const string PlannedStartDate = "Contract Start Date";
        public const string PlannedEndDate = "Contract End Date";
        public const string Type = "Type";
        public const string Region = "Region";
        public const string Country = "Country";
        public const string Scientist = "Scientist";
        public const string ProjectManager = "Project Manager";
        public const string ProjectValue = "FTE Rate (in USD)/Annum";
        public const string NoOfFTEs = "No. of FTE's";
        public const string PONumber = "PO Number";
        public const string SONumber = "SO Number";
        public const string Submitter = "Submitter";
        public const string BDName = "BD Name";
    }

    public static class CDSProjectMetaData
    {
        public const string ProjectCode = "Project Code";
        public const string ProposalCode = "Proposal Code";
        public const string ProjectName = "Project Name";
        public const string Qty = "Qty (in Kg)";
        public const string Units = "Units";
        public const string ProjectType = "Project Type";
        public const string GMPNonGMP = "GMP/ Non-GMP";
        public const string Molecules = "Molecules";
        public const string Phase = "Phase";
        public const string Deliverable = "Deliverable";
        public const string Region = "Region";
        public const string Country = "Country";
        public const string ProjectValue = "Project Value";
        public const string ManufacturingUnit = "Manufacturing Unit";
        public const string PlantLab = "Plant/Lab";
        public const string BudgetConsumed = "Budget Consumed";
        public const string BudgetAvailable = "Budget Available";
        public const string DashboardURL = "Dashboard Link";
        public const string DelayReason = "Delay Reason";
        public const string PercentComplete = "% Complete - Duration";
        public const string ProjectStatus = "Project Status";
        public const string ProjectHealth = "Project Health";
        public const string Scientist = "Scientist";
        public const string ProjectManager = "Project Manager";
        public const string ActualStartDate = "Actual Start Date";
        public const string ActualEndDate = "Actual End Date";
        public const string Customer = "Customer";
        public const string PlannedStartDate = "Planned Start Date";
        public const string PlannedEndDate = "Planned End Date";
    }

    public static class CDSProjectPlan
    {
        public const string Task = "Title";
        public const string Health = "Health";
        public const string PlannedStartDate = "Planned Start Date";
        public const string PlannedEndDate = "Planned End Date";
        public const string ActualStartDate = "Actual Start Date";
        public const string ActualEndDate = "Actual End Date";
        public const string PercentCompleteDuration = "% Complete - Duration";

        public const string ID = "ID";
        public const string ParentID = "ParentID";
        public const string OrderID = "OrderID";
        public const string Expanded = "Expanded";
        public const string Summary = "Summary";
        public const string Workdays = "Workdays";
        public const string Duration = "Duration";
        public const string Variance = "Variance";
        public const string TaskStatus = "Task Status";
        public const string DelayReason = "Delay Reason";
        public const string DelayComments = "Delay Comments";
        public const string Remarks = "Remarks";
        public const string BaselineSet = "Baseline Set";
        public const string TaskManager = "Task Manager";

    }

    public static class CDSGanttDependencies
    {
        public const string ID = "ID";
        public const string PredecessorID = "PredecessorID";
        public const string SuccessorID = "SuccessorID";
        public const string Type = "Type";
    }

    public static class CDSGanttResourceAssignments
    {
        public const string ID = "ID";
        public const string TaskID = "TaskID";
        public const string ResourceID = "ResourceID";
        public const string Units = "Units";
    }

}
