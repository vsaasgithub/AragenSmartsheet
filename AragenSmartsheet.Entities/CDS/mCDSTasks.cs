using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.Formats.Asn1;

namespace AragenSmartsheet.Entities.CDS
{
    public class MCDSTasks
    {
        public long? Id { get; set; }
        public long? SiblingId { get; set; }
        public long? ParentId { get; set; }
        public long? RowNo { get; set; }
        public long? RowCount { get; set; }
        public string Name { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public int SlDate { get; set; }
        public string Desc { get; set; }
        public int Noofdays { get; set; }
        public string Health { get; set; }
        public string Duration { get; set; }
        public string ShortStartDate { get; set; }
        public string ShortEndDate { get; set; }
        public string WorkingDays { get; set; }
        public string Scientist { get; set; }
        public string TaskManager { get; set; }
        public string Predecessors { get; set; }
        public string PercentageComplete { get; set; }
        public string PlanedStartDate { get; set; }
        public string PlanedEndDate { get; set; }
        public string TaskStatus { get; set; }
        public string ProjectStartDate { get; set; }
        public string CommitedEndDate { get; set; }
        public string DelayReason { get; set; }
        public string DelayComments { get; set; }
        public string baseline { get; set; }
        public bool planBaseLine { get; set; }
        public string Variance { get; set; }
        public string PercentComplete { get; set; }
        public string Latestcomments { get; set; }
        public string Remarks { get; set; }
        public string Allocation { get; set; }
        public bool Flag { get; set; }
        public bool Enable { get; set; }
        public int Update { get; set; }
        public List<Values> Values { get; set; } = new List<Values>();
        public List<MCDSTasks> SubTask { get; set; } = new List<MCDSTasks>();
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

    public class MCDSTask
    {
        public long RowID { get; set; }
        public int ID { get; set; }
        public int ID_Auto { get; set; }
        public string Title { get; set; }
        public int? ParentID { get; set; }
        public int OrderID { get; set; }

        [JsonConverter(typeof(CustomDateTimeConverter))]
        public DateTime Start { get; set; }

        [JsonConverter(typeof(CustomDateTimeConverter))]
        public DateTime End { get; set; }
        public decimal PercentComplete { get; set; }
        public bool Summary { get; set; }
        public bool Expanded { get; set; }

        [JsonConverter(typeof(CustomDateTimeConverter))]
        public DateTime? PlannedStart { get; set; }

        [JsonConverter(typeof(CustomDateTimeConverter))]
        public DateTime? PlannedEnd { get; set; }
        public int? Workdays { get; set; }
        public string TaskManager { get; set; }
        public int? DurationDays { get; set; }
        public int? VarianceDays { get; set; }
        public string TaskStatus { get; set; }
        public string DelayReason { get; set; }
        public string DelayComments { get; set; }
        public string Remarks { get; set; }
        public bool BaselineSet { get; set; }

    }

    public class MCDSDependency
    {
        public long RowID { get; set; }
        public int ID { get; set; }
        public int PredecessorID { get; set; }
        public int SuccessorID { get; set; }
        public int Type { get; set; }

    }

    public class MCDSResources
    {
        public long RowID { get; set; }
        public int ID { get; set; }
        public string Name { get; set; }
        public string Color { get; set; }
    }

    public class MCDSResourceAssignment
    {
        public long RowID { get; set; }
        public int ID { get; set; }
        public int TaskID { get; set; }
        public int ResourceID { get; set; }
        public decimal Units { get; set; }
    }

    public class CustomDateTimeConverter : IsoDateTimeConverter
    {
        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            try
            {
                return base.ReadJson(reader, objectType, existingValue, serializer);
            }
            catch (JsonReaderException)
            {
                // Handle the DateTime format exception here
                // You can log the issue, set a default value, or throw a more specific exception
                return DateTime.MinValue; // Example: Set a default value
            }
            catch (FormatException)
            {
                // Handle the FormatException when the date is '0000-12-31T18:06:32.000Z'
                // You can log the issue, set a default value, or throw a more specific exception
                return DateTime.MinValue; // Example: Set a default value
            }
        }
    }

}
