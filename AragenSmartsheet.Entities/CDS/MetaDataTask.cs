using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AragenSmartsheet.Entities.CDS
{
    public class MetaDataTask
    {

        public long? Id { get; set; }
        public long? SiblingId { get; set; }
        public long? ParentId { get; set; }
        public long? RowNo { get; set; }
        public long? RowCount { get; set; }
        public string ProposalCode { get; set; }
        public string ProjectName { get; set; }
        public int Update { get; set; }
        public string Customer { get; set; }
        public string ProjectCode { get; set; }
        public string PlannedStartDate { get; set; }
        public string PlannedEndDate { get; set; }
        public string Qty { get; set; }
        public string ProjectType { get; set; }
        public string GMPNon        {get;set;}
    public string Deliverable { get; set; }
    public string Molecules { get; set; }
    public string Phase { get; set; }
    public string Region { get; set; }
    public string Country { get; set; }
    public string ProjectValue { get; set; }
    public string ManufacturingUnit { get; set; }
    public string Plant { get; set; }
    public string BudgetConsumed { get; set; }
    public string BudgetAvailable { get; set; }
    public string BudgetUtilized { get; set; }
    public string Scientist { get; set; }
    public string ProjectManager { get; set; }
    public string ProjectHealth { get; set; }
    public string ActualStartDate { get; set; }
    public string ActualEndDate { get; set; }
    public string PercentageComplete {get;set;}
public string ProjectStatus { get; set; }
public string ProjectClosure { get; set; }
public string ProjectClosureHelper { get; set; }

public string Variance { get; set; }
public string Duration { get; set; }
public string DelayReason {get; set;}
public string Dashboard { get; set; }
public string Submitter { get; set; }
public string SubmissionDate { get; set; }

    }
}
