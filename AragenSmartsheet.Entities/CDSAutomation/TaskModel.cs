using System.Collections.Generic;

namespace AragenSmartsheet.Entities.CDSAutomation
{
    public class TaskModel
    {
        public long? Id { get; set; }
        public long? SiblingId { get; set; }
        public long? ParentId { get; set; }
        public long? RowNo { get; set; }
        public string Name { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public int SlDate { get; set; }
        public string TaskManager { get; set; }
        public string Desc { get; set; }
        public string PlanedStartDate { get; set; }
        public string PlanedEndDate { get; set; }
        public int Noofdays { get; set; }
        public string Health { get; set; }
        public string Duration { get; set; }
        public string Scientist { get; set; }
        public string ProjectManager { get; set; }
        public string Predecessors { get; set; }
        public string PercentageComplete { get; set; }
        public string TaskStatus { get; set; }
        public string ProjectStartDate { get; set; }
        public string CommitedEndDate { get; set; }
        public string DelayReason { get; set; }
        public string DelayComments { get; set; }
        public string Variance { get; set; }
        public string Allocation { get; set; }
        public string FolderId { get; set; }
        public List<Values> Values { get; set; } = new List<Values>();
        public List<TaskModel> SubTask { get; set; } = new List<TaskModel>();
        public List<Predecessors> PredecessorsList { get; set; } = new List<Predecessors>();
    } 
public class Predecessors
{
    public string txtRow { get; set; }
    public string Task { get; set; }
    public string TaskStatus { get; set; }
    public string LagNo { get; set; }
}

public class Values
    {
        public string From { get; set; }
        public string To { get; set; }
        public string Label { get; set; }
        public string CustomClass { get; set; }
    }

}
