using AragenSmartsheet.Data.Common;
using AragenSmartsheet.Data.IRepository;
using AragenSmartsheet.Entities.CDS;
using AragenSmartsheet.Entities.CDSAutomation;
using AragenSmartsheet.Entities.Home;
using AragenSmartsheet.Integration.SmartsheetIntegration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using NLog.Fluent;
using Smartsheet.Api.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Resources;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;

namespace AragenSmartsheet.Data.Repository
{
    public class CDSRepository : ICDSRepository
    {
        readonly ConfigurationBuilder configurationBuilder = new();
        public string TaskName;
        public static bool Workday;

        public CDSRepository()
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
            configurationBuilder.AddJsonFile(path, false);
        }

        /// <summary>
        /// FolderID using ProjectPlanDataSheet Id get then particuluar datasheet all details recovered  
        /// </summary>
        /// //<param="FolderID">FolderID param use with Get the smarsheet Folder Access sheet id  </param>
        /// <returns></returns>
        public List<MCDSTasks> GetProjectPlans(string FolderID)
        {
            try
            {

                Dictionary<string, long> ProjectPlanColumnMap = new();
                //var ProjectPlanTemplate = long.Parse(configurationBuilder.Build().GetSection("ProjectPlanTemplate").Value);

                //Getting Folder object
                Folder folderObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(Convert.ToInt64(FolderID), null);
                Int64 ProjPlanSheetID = 0;
                foreach (var item in folderObj.Sheets)
                {
                    if (item.Name == "Project Plan")
                    {
                        ProjPlanSheetID = Convert.ToInt64(item.Id);
                    }
                }

                var ProjectPlanDataSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(ProjPlanSheetID, null, null, null, null, null, null, null, null, null);
                List<MCDSTasks> lstTask = new();
                foreach (var column in ProjectPlanDataSheet.Columns)
                {
                    ProjectPlanColumnMap.Add(column.Title, (long)column.Id);
                }
                bool binaryFlag = false;
                foreach (var row in ProjectPlanDataSheet.Rows)
                {
                    MCDSTasks task = new()
                    {
                        Id = row.Id,
                        //task.Id = row.Id;
                        ParentId = row.ParentId,
                        SiblingId = row.SiblingId,
                        RowNo = row.RowNumber,
                        SlDate = 5,
                        Flag = true,
                        Enable = false,
                        Name = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Task", ProjectPlanColumnMap).Value)
                    };
                    task.Desc = task.Name = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Task", ProjectPlanColumnMap).Value);
                    task.Health = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Health", ProjectPlanColumnMap).Value);
                    task.Duration = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Duration", ProjectPlanColumnMap).Value);


                    task.StartDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Actual Start Date", ProjectPlanColumnMap).Value);
                    task.EndDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Actual End Date", ProjectPlanColumnMap).Value);
                    //task.baseline = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Baseline Set", ProjectPlanColumnMap).Value);
                    string bLine = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Baseline Set", ProjectPlanColumnMap).Value);
                    if (bLine != "" && bLine != null)
                    {
                        if (bLine == "True")
                        {
                            task.planBaseLine = true;

                        }
                        else
                        {
                            task.planBaseLine = false;

                        }
                    }


                    if (task.Duration == "")
                    {
                        if (task.StartDate != "" && task.EndDate != "")
                        {
                            DateTime StartDate = DateTime.Parse(task.StartDate);
                            DateTime EndDate = DateTime.Parse(task.EndDate);
                            if (StartDate < EndDate)
                            {
                                var duration = (((StartDate - EndDate).TotalDays) * -1) - 1;
                                if (Convert.ToInt32(duration) < 0)
                                {
                                    duration = Convert.ToInt32(duration) * -1;

                                }
                                task.Duration = $"{duration.ToString()}d";
                            }
                            else
                            {
                                task.Duration = "";
                                task.EndDate = "";
                            }


                        }
                    }

                    if (task.Duration == "d")
                        task.Duration = "";

                    foreach (var data in ProjectPlanColumnMap)
                    {
                        if (data.Key == "Planned End Date")
                        {
                            task.PlanedEndDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Planned End Date", ProjectPlanColumnMap).Value);
                        }
                        else
                        {
                            if (data.Key == "Committed End Date")
                            {
                                task.PlanedEndDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Committed End Date", ProjectPlanColumnMap).Value);
                            }
                        }
                        if (data.Key == "Planned Start Date")
                        {
                            task.PlanedStartDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Planned Start Date", ProjectPlanColumnMap).Value);
                        }
                        else
                        {
                            if (data.Key == "Project Start Date")
                            {
                                task.PlanedStartDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Project Start Date", ProjectPlanColumnMap).Value);
                            }
                        }

                        if (data.Key == "% Complete - Duration")
                        {
                            task.PercentComplete = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "% Complete - Duration", ProjectPlanColumnMap).Value);
                            if (task.PercentComplete != null && task.PercentComplete != "")
                            {

                                task.PercentComplete = task.PercentComplete;
                            }
                        }

                        if (data.Key == "Work Days")
                        {
                            task.WorkingDays = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Work Days", ProjectPlanColumnMap).Value);
                        }
                        if (data.Key == "Latest Comment")
                        {
                            task.Latestcomments = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Latest Comment", ProjectPlanColumnMap).Value);
                        }
                    }
                    // task.ProjectManager = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Project Manger", ProjectPlanColumnMap).Value);
                    task.Predecessors = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Predecessors", ProjectPlanColumnMap).Value);
                    // task.PercentageComplete = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "% Complete", ProjectPlanColumnMap).Value);
                    task.TaskStatus = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Task Status", ProjectPlanColumnMap).Value);
                    task.TaskManager = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Task Manager", ProjectPlanColumnMap).Value);
                    //task.ProjectStartDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Project Start Date", ProjectPlanColumnMap).Value);
                    //task.CommitedEndDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Committed End Date", ProjectPlanColumnMap).Value);
                    task.DelayReason = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Delay Reason", ProjectPlanColumnMap).Value);
                    task.DelayComments = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Delay Comments", ProjectPlanColumnMap).Value);

                    task.Remarks = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Remarks", ProjectPlanColumnMap).Value);
                    task.Variance = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Variance", ProjectPlanColumnMap).Value);

                    if (task.RowNo == 1)
                    {
                        binaryFlag = task.planBaseLine;
                    }
                    if (task.Variance == "")
                    {
                        if (task.PlanedEndDate != "" && task.EndDate != "" && binaryFlag)
                        {
                            DateTime planEndDate = DateTime.Parse(task.PlanedEndDate);
                            DateTime EndDate = DateTime.Parse(task.EndDate);
                            var varriances = ((planEndDate - EndDate).TotalDays);
                            if (planEndDate > EndDate)
                            {
                                if (Convert.ToInt32(varriances) > 0)
                                {
                                    var data = Convert.ToInt32(varriances) * -1;
                                    task.Variance = data.ToString();
                                }
                                else
                                {

                                    task.Variance = varriances.ToString();
                                }
                            }
                            else
                            {
                                if (Convert.ToInt32(varriances) > 0)
                                {

                                    task.Variance = varriances.ToString();
                                }
                                else
                                {
                                    var data = Convert.ToInt32(varriances) * -1;
                                    task.Variance = data.ToString();

                                }
                            }



                        }
                        else
                        {
                            task.Variance = "";
                        }
                    }
                    else if (!binaryFlag)
                    {
                        task.Variance = "";
                    }
                    // task.Allocation = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Allocation %", ProjectPlanColumnMap).Value);
                    //  task.Noofdays = !string.IsNullOrEmpty(task.Duration) ? Convert.ToInt32(task.Duration.Replace('d', ' ').Trim()) : 0;
                    task.StartDate = !string.IsNullOrEmpty(task.StartDate) ? Convert.ToDateTime(task.StartDate).ToString("dd-MM-yyyy") : "";

                    task.EndDate = !string.IsNullOrEmpty(task.EndDate) ? Convert.ToDateTime(task.EndDate).ToString("dd-MM-yyyy") : "";

                    task.ShortStartDate = !string.IsNullOrEmpty(task.PlanedStartDate) ? Convert.ToDateTime(task.PlanedStartDate).ToString("dd-MM-yyyy") : "";
                    task.ShortEndDate = !string.IsNullOrEmpty(task.PlanedEndDate) ? Convert.ToDateTime(task.PlanedEndDate).ToString("dd-MM-yyyy") : "";
                    //task.ProjectStartDate = !string.IsNullOrEmpty(task.ProjectStartDate) ? Convert.ToDateTime(task.ProjectStartDate).ToString("dd-MM-yyyy") : "";
                    //task.CommitedEndDate = !string.IsNullOrEmpty(task.CommitedEndDate) ? Convert.ToDateTime(task.CommitedEndDate).ToString("dd-MM-yyyy") : "";
                    lstTask.Add(task);
                }

                return lstTask.Select(x =>
                {
                    x.SubTask = lstTask.Where(y => y.ParentId == x.Id).ToList();
                    return x;
                }).ToList();
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        public static DateTime GMTDateConvert(string Date)
        {
            DateTime date = DateTime.Parse(Date);
            DateTime dateTimeToUtc = TimeZoneInfo.ConvertTimeToUtc(date);
            return dateTimeToUtc;
        }

        public static DateTime LocalTimeConvert(string Date)
        {
            DateTime date = DateTime.Parse(Date);


            return date;
        }
        //projectmetaData

        public List<MetaDataTask> ProjectMetatData(string FolderID)
        {
            try
            {

                Dictionary<string, long> ProjectPlanColumnMap = new();
                //var ProjectPlanTemplate = long.Parse(configurationBuilder.Build().GetSection("ProjectPlanTemplate").Value);

                //Getting Folder object
                Folder folderObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(Convert.ToInt64(FolderID), null);
                Int64 ProjPlanSheetID = 0;
                foreach (var item in folderObj.Sheets)
                {
                    if (item.Name == "Project Metadata")
                    {
                        ProjPlanSheetID = Convert.ToInt64(item.Id);
                    }
                }

                var ProjectPlanDataSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(ProjPlanSheetID, null, null, null, null, null, null, null, null, null);
                List<MetaDataTask> lstTask = new();
                foreach (var column in ProjectPlanDataSheet.Columns)
                {
                    ProjectPlanColumnMap.Add(column.Title, (long)column.Id);
                }

                foreach (var row in ProjectPlanDataSheet.Rows)
                {
                    MetaDataTask task = new()
                    {
                        Id = row.Id,
                        ParentId = row.ParentId,
                        SiblingId = row.SiblingId,
                        RowNo = row.RowNumber,
                        ProjectCode = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Project Code", ProjectPlanColumnMap).Value)
                    };
                    task.ProjectCode = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Proposal Code", ProjectPlanColumnMap).Value);
                    task.ProjectName = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Project Name", ProjectPlanColumnMap).Value);
                    task.Customer = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Customer", ProjectPlanColumnMap).Value);
                    task.PlannedStartDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Planned Start Date", ProjectPlanColumnMap).Value);
                    task.PlannedEndDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Planned End Date", ProjectPlanColumnMap).Value);
                    task.ProjectType = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Project Type", ProjectPlanColumnMap).Value);
                    task.GMPNon = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "GMP/ Non-GMP", ProjectPlanColumnMap).Value);
                    task.Deliverable = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Deliverable", ProjectPlanColumnMap).Value);
                    task.Molecules = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Molecules", ProjectPlanColumnMap).Value);
                    task.ProjectValue = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Project Value", ProjectPlanColumnMap).Value);
                    task.ManufacturingUnit = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Manufacturing Unit", ProjectPlanColumnMap).Value);
                    task.BudgetConsumed = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Budget Consumed", ProjectPlanColumnMap).Value);
                    task.BudgetAvailable = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Budget Available", ProjectPlanColumnMap).Value);
                    task.BudgetUtilized = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Budget Utilized %", ProjectPlanColumnMap).Value);
                    task.Region = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Region", ProjectPlanColumnMap).Value);
                    task.Phase = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Phase", ProjectPlanColumnMap).Value);
                    task.Scientist = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Scientist", ProjectPlanColumnMap).Value);
                    task.Country = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Country", ProjectPlanColumnMap).Value);
                    task.ProjectManager = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Project Manager", ProjectPlanColumnMap).Value);
                    task.ProjectHealth = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Project Health", ProjectPlanColumnMap).Value);
                    task.ActualStartDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Actual Start Date", ProjectPlanColumnMap).Value);
                    task.ActualEndDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Actual End Date", ProjectPlanColumnMap).Value);
                    task.PercentageComplete = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "% Complete - Duration", ProjectPlanColumnMap).Value);
                    task.ProjectStatus = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Project Status", ProjectPlanColumnMap).Value);
                    task.ProjectClosureHelper = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Project Closure Helper", ProjectPlanColumnMap).Value);
                    task.ProjectClosure = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Project Closure", ProjectPlanColumnMap).Value);
                    task.Variance = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Variance", ProjectPlanColumnMap).Value);
                    task.Duration = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Duration", ProjectPlanColumnMap).Value);
                    task.DelayReason = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Delay Reason", ProjectPlanColumnMap).Value);
                    task.Dashboard = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Dashboard Link", ProjectPlanColumnMap).Value);
                    task.Submitter = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Submitter", ProjectPlanColumnMap).Value);
                    task.SubmissionDate = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Submission Date", ProjectPlanColumnMap).Value);
                    task.Update = 1;
                    lstTask.Add(task);
                }
                return lstTask.ToList();
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        /// <summary>
        /// get smartsheet folderId and name get the smartsheet
        /// </summary>
        /// <returns></returns>        
        public List<MCDSFolder> GetProjectsList()
        {
            try
            {
                List<MCDSFolder> liCDSFolder = new();
                var DestinationFolderCDS = long.Parse(configurationBuilder.Build().GetSection("DestinationFolderCDS").Value);
                var CDSTempelate = long.Parse(configurationBuilder.Build().GetSection("CDSNewTempelate").Value);
                //Getting Folder object
                Folder folderObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(Convert.ToInt64(DestinationFolderCDS), null);



                MCDSFolder CDSFolder;
                foreach (var item in folderObj.Folders)
                {
                    CDSFolder = new MCDSFolder
                    {
                        FolderID = Convert.ToInt64(item.Id),
                        FolderName = Convert.ToString(item.Name),
                        FolderLink = Convert.ToString(item.Permalink),

                    };

                    Folder folObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(Convert.ToInt64(item.Id), null);
                    foreach (var sheet in folObj.Sheets)
                    {
                        var FolderSheet = new MCDSFolderSheets
                        {
                            SheetID = Convert.ToInt64(sheet.Id),
                            SheetLink = sheet.Permalink,
                            SheetName = sheet.Name
                        };
                        CDSFolder.FolderSheets.Add(FolderSheet);
                    }

                    liCDSFolder.Add(CDSFolder);
                }
                MCDSFolder msdsFolder = liCDSFolder.FirstOrDefault(x => x.FolderID == CDSTempelate);
                if (msdsFolder != null)
                {
                    liCDSFolder.Remove(msdsFolder);

                }
                return liCDSFolder.OrderBy(x => x.FolderName).ToList();
            }


            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        /// <summary> 
        /// SubLoop base  Insert and update the subtask  in ganttchart
        /// </summary>  
        /// <param name="taskModel">ganttchart data also pushsed taskModel object to insert or update function  </param> 
        /// <param name="columnMapmain">columnMapmain param using append column details</param>
        /// <param name="ProjectPlanTemplate">ProjectPlanTemplate param using get for Insert or update the current tableId   </param>


        private static void GanttChart_initialize(MCDSTasks taskModel, Dictionary<string, long> columnMapmain, Int64 ProjectPlanTemplate)
        {
            Dictionary<string, long> columnMap = columnMapmain;
            IList<Row> liRowsToAdd = new List<Row>();
            Workday = false;
            try
            {

                if (taskModel.Id == 0 || taskModel.Id == null)
                {
                    taskModel.TaskManager = "";
                    taskModel.PercentageComplete = "";
                    if (taskModel.StartDate != "" && taskModel.EndDate != "")
                    {
                        var SD = DateSplit(taskModel.StartDate);
                        taskModel.StartDate = Convert.ToDateTime(SD).ToString("yyyy-MM-dd");
                        var ED = DateSplit(taskModel.EndDate);
                        taskModel.EndDate = Convert.ToDateTime(ED).ToString("yyyy-MM-dd");
                    }
                    else
                    {
                        taskModel.StartDate = "";
                        taskModel.EndDate = "";
                    }
                    if (taskModel.ShortStartDate != "" && taskModel.ShortEndDate != "")
                    {
                        var SD = DateSplit(taskModel.ShortStartDate);

                        taskModel.ShortStartDate = Convert.ToDateTime(SD).ToString("yyyy-MM-dd");
                        var ED = DateSplit(taskModel.ShortEndDate);
                        taskModel.ShortEndDate = Convert.ToDateTime(ED).ToString("yyyy-MM-dd");
                    }
                    else
                    {
                        taskModel.ShortStartDate = "";
                        taskModel.ShortEndDate = "";
                    }

                    if (taskModel.DelayReason == "Chemistry/Lab Developmen")
                    {
                        taskModel.DelayReason = "Chemistry/Lab Development";
                    }
                    if (taskModel.TaskStatus == "On HOLD")
                    {
                        taskModel.TaskStatus = "On Hold";
                    }


                    Cell[] cellsToInsert = new Cell[]
                    {
                       new Cell
                    {

                    ColumnId = columnMap["Task"],
                         Value = taskModel.Name== null ? string.Empty : taskModel.Name
                    },
                     new Cell
                    {

                    ColumnId = columnMap["Duration"],
                         Value = taskModel.Duration== null ? string.Empty : taskModel.Duration
                    },  new Cell
                    {

                    ColumnId = columnMap["Work Days"],
                         Value = taskModel.WorkingDays== null ? string.Empty : taskModel.WorkingDays
                    },
                new Cell
                    {
                     ColumnId =columnMap["Actual Start Date"],
                      Value =taskModel.StartDate== null ? string.Empty : taskModel.StartDate
                    },
                  new Cell
                    {
                     ColumnId =columnMap["Actual End Date"],
                      Value =taskModel.EndDate== null ? string.Empty : taskModel.EndDate
                    },
                   new Cell
                        {
                            ColumnId = columnMap["Planned Start Date"],
                        Value = taskModel.ShortStartDate== null ? string.Empty : taskModel.ShortStartDate
                        }
                        ,
                    new Cell
               {
                     ColumnId =columnMap["Task Status"],
                    Value =taskModel.TaskStatus == null ||taskModel.TaskStatus=="Select" ? string.Empty : taskModel.TaskStatus
               },
                     new Cell
               {
                     ColumnId =columnMap["Task Manager"],
                    Value =taskModel.TaskManager == null ||taskModel.TaskManager=="Select" ? string.Empty : taskModel.TaskStatus
               },
                   new Cell
                    {
                        ColumnId = columnMap["Planned End Date"],
                           Value = taskModel.ShortEndDate== null ? string.Empty : taskModel.ShortEndDate
                    },
                   //new Cell
                   // {
                   //     ColumnId = columnMap["Planned Start Date"],
                   //      Value = taskModel.PlanedStartDate
                   // },
                   //new Cell
                   // {
                   //     ColumnId = columnMap["Planned End Date"],
                   //      Value = taskModel.planedEndDate
                   // },
                  

               new Cell
               {
                     ColumnId =columnMap["Predecessors"],
                    Value =taskModel.Predecessors== null ? string.Empty : taskModel.Predecessors
               },
                new Cell
               {
                     ColumnId =columnMap["Task Manager"],
                    Value =taskModel.TaskManager== null ? string.Empty : taskModel.TaskManager,

               },
               new Cell
               {
                     ColumnId =columnMap["% Complete - Duration"],
                    Value =taskModel.PercentageComplete== null ? string.Empty : taskModel.PercentageComplete
               },
               new Cell
               {
                     ColumnId =columnMap["Delay Reason"],
                    Value =taskModel.DelayReason== null ||taskModel.DelayReason=="Select" ? string.Empty : taskModel.DelayReason
               },
                new Cell
               {
                     ColumnId =columnMap["Delay Comments"],
                    Value =taskModel.DelayComments== null ? string.Empty : taskModel.DelayComments
               },
                new Cell
                {
                    ColumnId = columnMap["Latest Comment"],
                    Value = taskModel.Latestcomments== null  ? string.Empty : taskModel.Latestcomments
                },new Cell
                {
                    ColumnId = columnMap["Remarks"],
                    Value = taskModel.Remarks== null  ? string.Empty : taskModel.Remarks
                },
                 new Cell
               {
                     ColumnId =columnMap["Variance"],
                    Value =taskModel.Variance== null ? string.Empty : taskModel.Variance
               }

                    };
                    Row row = new()
                    {
                        Above = false,
                        SiblingId = taskModel.SiblingId,

                        Cells = cellsToInsert
                    };
                    liRowsToAdd.Add(row);
                    var FTEIntakeSheetInsertedRow = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.AddRows(ProjectPlanTemplate, liRowsToAdd);
                }
                else if (taskModel.Id != 0 && taskModel.Update == 1)
                {

                    if (taskModel.WorkingDays == "")
                    {
                        taskModel.WorkingDays = "5";
                    }
                    if (taskModel.StartDate != "" && taskModel.EndDate != "")
                    {
                        var SD = DateSplit(taskModel.StartDate);
                        taskModel.StartDate = Convert.ToDateTime(SD).ToString("yyyy-MM-dd");
                        var ED = DateSplit(taskModel.EndDate);
                        taskModel.EndDate = Convert.ToDateTime(ED).ToString("yyyy-MM-dd");
                    }
                    else
                    {
                        taskModel.StartDate = "";
                        taskModel.EndDate = "";
                    }
                    if (taskModel.ShortStartDate != "" && taskModel.ShortEndDate != "")
                    {
                        var SD = DateSplit(taskModel.ShortStartDate);
                        taskModel.ShortStartDate = Convert.ToDateTime(SD).ToString("yyyy-MM-dd");
                        var ED = DateSplit(taskModel.ShortEndDate);
                        taskModel.ShortEndDate = Convert.ToDateTime(ED).ToString("yyyy-MM-dd");
                    }
                    else
                    {
                        taskModel.ShortStartDate = "";
                        taskModel.ShortEndDate = "";
                    }
                    if (taskModel.baseline != null)
                    {
                        if (taskModel.baseline == "true")
                        {
                            taskModel.planBaseLine = true;
                        }
                        else
                        {
                            taskModel.planBaseLine = false;
                        }
                    }
                    if (taskModel.DelayReason == "Chemistry/Lab Developmen")
                    {
                        taskModel.DelayReason = "Chemistry/Lab Development";
                    }
                    if (taskModel.TaskStatus == "On HOLD")
                    {
                        taskModel.TaskStatus = "On Hold";
                    }
                    if (taskModel.PercentComplete != "")
                    {
                        taskModel.PercentageComplete = taskModel.PercentComplete;
                    }
                    else
                    {
                        taskModel.PercentageComplete = "0";
                    }

                    List<Row> rows = new();

                    Cell[] cellsToInsert = new Cell[]
                     {
                    new Cell
                    {
                        ColumnId = columnMap["Task"],
                         Value = taskModel.Name == null ? string.Empty : taskModel.Name
                    },
                    new Cell
                    {
                        ColumnId = columnMap["Duration"],
                         Value = taskModel.Duration == null ? string.Empty : taskModel.Duration
                    }, new Cell
                    {
                        ColumnId = columnMap["Work Days"],
                         Value = taskModel.WorkingDays == null ? string.Empty : taskModel.WorkingDays

                    },
                  new Cell
                    {
                        ColumnId = columnMap["Task Manager"],
                         Value = taskModel.TaskManager== null ? string.Empty : taskModel.TaskManager
                    },
                   new Cell
                    {
                        ColumnId = columnMap["Baseline Set"],
                         Value = taskModel.planBaseLine,

                    },
                    new Cell
                    {
                        ColumnId = columnMap["Planned Start Date"],
                        Value = taskModel.ShortStartDate == null ? string.Empty : taskModel.ShortStartDate
                    },

                   new Cell
                    {
                        ColumnId = columnMap["Planned End Date"],
                           Value = taskModel.ShortEndDate == null ? string.Empty : taskModel.ShortEndDate
                    },
                   new Cell
                    {
                     ColumnId =columnMap["Actual Start Date"],
                      Value =taskModel.StartDate == null ? string.Empty : taskModel.StartDate
                    },
                   new Cell
                    {
                     ColumnId =columnMap["Actual End Date"],
                      Value =taskModel.EndDate == null ? string.Empty : taskModel.EndDate
                    },

                   new Cell
                   {
                     ColumnId =columnMap["Predecessors"],
                    Value =taskModel.Predecessors == null ? string.Empty : taskModel.Predecessors
                   },
                new Cell
               {
                     ColumnId =columnMap["Task Status"],
                    Value =taskModel.TaskStatus == null ||taskModel.TaskStatus=="Select" ? string.Empty : taskModel.TaskStatus
               },
              new Cell
               {
                   ColumnId = columnMap["Task Manager"],
                   Value =taskModel.TaskManager == null ||taskModel.TaskManager=="Select"? string.Empty : taskModel.TaskManager
               },
             new Cell
               {
                   ColumnId = columnMap["% Complete - Duration"],
                   Value = taskModel.PercentageComplete == null ? string.Empty : taskModel.PercentageComplete
               },
              new Cell
               {
                   ColumnId = columnMap["Delay Reason"],
                   Value =taskModel.DelayReason == null ||taskModel.DelayReason=="Select"? string.Empty : taskModel.DelayReason
               },
                new Cell
                {
                    ColumnId = columnMap["Delay Comments"],
                    Value = taskModel.DelayComments== null  ? string.Empty : taskModel.DelayComments
                },new Cell
                {
                    ColumnId = columnMap["Latest Comment"],
                    Value = taskModel.Latestcomments== null  ? string.Empty : taskModel.Latestcomments
                },new Cell
                {
                    ColumnId = columnMap["Remarks"],
                    Value = taskModel.Remarks== null  ? string.Empty : taskModel.Remarks
                },
                new Cell
                {
                    ColumnId =columnMap["Variance"],
                    Value =taskModel.Variance ==null ? string.Empty : taskModel.Variance
                }

              };
                    rows.Add(new Row
                    {
                        Id = taskModel.Id,
                        Cells = cellsToInsert
                    });

                    liRowsToAdd = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(ProjectPlanTemplate, rows);
                }

            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
        }

        public static string DateSplit(string date)
        {
            string[] e = date.Split("-");
            date = e[1] + '-' + e[0] + '-' + e[2];
            return date;
        }

        /// <summary>
        /// delete the selected row in smart sheet
        /// </summary>
        /// <param name="sheetIds">delete for the row id passed  </param> 
        /// <param name="FolderID">we have get for the insert or update table folderId   </param> 
        /// <returns></returns>
        public string ProjectPlanDeleteRow(List<long> sheetIds, string FolderID)
        {
            try
            {
                Dictionary<string, long> columnMap = new();
                IList<Row> liRowsToAdd = new List<Row>();
                Folder folderObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(Convert.ToInt64(FolderID), null);
                Int64 ProjectPlanTemplate = 0;
                foreach (var item in folderObj.Sheets)
                {
                    if (item.Name == "Project Plan")
                    {
                        ProjectPlanTemplate = Convert.ToInt64(item.Id);
                    }
                }
                var ColumnsInSheetFFSIntake = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(ProjectPlanTemplate, null, null, null, null, null, null, null, null, null).Columns;
                foreach (var column in ColumnsInSheetFFSIntake)
                {
                    columnMap.Add(column.Title, (long)column.Id);
                }
                var sheetids = sheetIds;

                var FTEIntakeSheetInsertedRow = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.DeleteRows(ProjectPlanTemplate, sheetids, true);
            }


            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
            return "success";
        }

        // <summary>
        //Insert and update ganttchary functionalities
        // </summary>       
        /// <param name="datalist">ganttchart list of data get for datalist</param> 
        /// <param name="FolderID">we have get for the insert or update table folderId   </param> 
        // <returns></returns>
        public string GanttChartUpdate(List<MCDSTasks> datalist, string FolderID)
        {
            try
            {
                Dictionary<string, long> columnMap = new();
                IList<Row> liRowsToAdd = new List<Row>();
                Folder folderObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(Convert.ToInt64(FolderID), null);
                Int64 ProjectPlanTemplate = 0;
                foreach (var item in folderObj.Sheets)
                {
                    if (item.Name == "Project Plan")
                    {
                        ProjectPlanTemplate = Convert.ToInt64(item.Id);
                    }
                }
                var ColumnsInSheetFFSIntake = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(ProjectPlanTemplate, null, null, null, null, null, null, null, null, null).Columns;
                foreach (var column in ColumnsInSheetFFSIntake)
                {
                    columnMap.Add(column.Title, (long)column.Id);
                }

                foreach (var InTask in datalist)
                {
                    GanttChart_initialize(InTask, columnMap, ProjectPlanTemplate);
                    foreach (var subtask in InTask.SubTask)
                    {
                        GanttChart_initialize(subtask, columnMap, ProjectPlanTemplate);
                        foreach (var item in subtask.SubTask)
                        {
                            GanttChart_initialize(item, columnMap, ProjectPlanTemplate);
                            foreach (var InItem in item.SubTask)
                            {
                                GanttChart_initialize(InItem, columnMap, ProjectPlanTemplate);
                            }
                        }
                    }
                }
                return "success";
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }

        }

        public Dictionary<string, string> GetProjectResources(string ResourceSheetID)
        {
            Dictionary<string, string> ProjectResources = new();
            Dictionary<string, long> ProjectResourceColumnMap = new();
            string FullName = string.Empty;
            string Email = string.Empty;
            var ProjectResourcesSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(ResourceSheetID), null, null, null, null, null, null, null, null, null);

            foreach (var column in ProjectResourcesSheet.Columns)
            {
                ProjectResourceColumnMap.Add(column.Title, (long)column.Id);
            }

            foreach (var row in ProjectResourcesSheet.Rows)
            {
                Email = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Email", ProjectResourceColumnMap).Value);
                FullName = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Full Name", ProjectResourceColumnMap).Value);
                ProjectResources.Add(Email, FullName);
            }

            return ProjectResources;
        }


        //New Code
        /// <summary>
        /// get smartsheet folderId and name get the smartsheet
        /// </summary>
        /// <returns></returns>        
        public List<MCDSFolder> GetProjectList()
        {
            try
            {
                List<MCDSFolder> liCDSFolder = new();
                var DestinationFolderCDS = long.Parse(configurationBuilder.Build().GetSection("DestinationFolderCDS").Value);
                var CDSTempelate = long.Parse(configurationBuilder.Build().GetSection("CDSNewTempelate").Value);
                //Getting Folder object
                Folder folderObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(Convert.ToInt64(DestinationFolderCDS), null);



                MCDSFolder CDSFolder;
                foreach (var item in folderObj.Folders)
                {
                    CDSFolder = new MCDSFolder
                    {
                        FolderID = Convert.ToInt64(item.Id),
                        FolderName = Convert.ToString(item.Name),
                        FolderLink = Convert.ToString(item.Permalink),

                    };

                    Folder folObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(Convert.ToInt64(item.Id), null);
                    foreach (var sheet in folObj.Sheets)
                    {
                        var FolderSheet = new MCDSFolderSheets
                        {
                            SheetID = Convert.ToInt64(sheet.Id),
                            SheetLink = sheet.Permalink,
                            SheetName = sheet.Name
                        };
                        CDSFolder.FolderSheets.Add(FolderSheet);
                    }

                    liCDSFolder.Add(CDSFolder);
                }
                liCDSFolder.Remove(liCDSFolder.Single(x => x.FolderID == CDSTempelate));
                return liCDSFolder.OrderBy(x => x.FolderName).ToList();
            }

            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        /// <summary>
        /// FolderID using ProjectPlanDataSheet Id get then particuluar datasheet all details recovered  
        /// </summary>
        /// //<param="FolderID">FolderID param use with Get the smarsheet Folder Access sheet id  </param>
        /// <returns></returns>
        public List<MCDSTask> GetAllTasks(string ProjPlanSheetID)
        {
            try
            {
                Dictionary<string, long> ProjectPlanColumnMap = new();

                //Getting Folder object
                //Folder folderObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(Convert.ToInt64(FolderID), null);
                //Int64? ProjPlanSheetID = 0;

                //ProjPlanSheetID = folderObj.Sheets.Where(item => item.Name == "Project Plan").Select(sheet => sheet.Id).FirstOrDefault();

                var ProjectPlanDataSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(ProjPlanSheetID), null, null, null, null, null, null, null, null, null);

                List<MCDSTask> lstTask = new();
                MCDSTask task;
                foreach (var column in ProjectPlanDataSheet.Columns)
                {
                    ProjectPlanColumnMap.Add(column.Title, (long)column.Id);
                }

                int id_auto = 1;
                foreach (var row in ProjectPlanDataSheet.Rows)
                {
                    task = new MCDSTask();

                    task.RowID = Convert.ToInt64(row.Id);
                    task.ID_Auto = id_auto;
                    id_auto++;
                    task.ID = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "ID", ProjectPlanColumnMap).Value);

                    int ParentID = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "ParentID", ProjectPlanColumnMap).Value);
                    task.ParentID = ParentID == 0 ? null : ParentID;

                    task.OrderID = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "OrderID", ProjectPlanColumnMap).Value);
                    task.Expanded = Convert.ToBoolean(SmartsheetHelper.GetCellByColumnName(row, "Expanded", ProjectPlanColumnMap).Value);
                    task.Summary = Convert.ToBoolean(SmartsheetHelper.GetCellByColumnName(row, "Summary", ProjectPlanColumnMap).Value);
                    task.Title = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Title", ProjectPlanColumnMap).Value);
                    task.PlannedStart = Convert.ToDateTime(SmartsheetHelper.GetCellByColumnName(row, "Planned Start Date", ProjectPlanColumnMap).Value);
                    if (task.PlannedStart == DateTime.MinValue)
                    {
                        task.PlannedStart = null;
                    }
                    task.PlannedEnd = Convert.ToDateTime(SmartsheetHelper.GetCellByColumnName(row, "Planned End Date", ProjectPlanColumnMap).Value);
                    if (task.PlannedEnd == DateTime.MinValue)
                    {
                        task.PlannedEnd = null;
                    }

                    task.Start = Convert.ToDateTime(SmartsheetHelper.GetCellByColumnName(row, "Actual Start Date", ProjectPlanColumnMap).Value);
                    task.End = Convert.ToDateTime(SmartsheetHelper.GetCellByColumnName(row, "Actual End Date", ProjectPlanColumnMap).Value);
                    task.PercentComplete = Convert.ToDecimal(SmartsheetHelper.GetCellByColumnName(row, "% Complete - Duration", ProjectPlanColumnMap).Value);
                    task.Workdays = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "Workdays", ProjectPlanColumnMap).Value);
                    task.DurationDays = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "Duration", ProjectPlanColumnMap).Value);
                    task.VarianceDays = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "Variance", ProjectPlanColumnMap).Value);
                    task.TaskStatus = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Task Status", ProjectPlanColumnMap).Value);
                    task.TaskManager = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Task Manager", ProjectPlanColumnMap).Value);
                    task.DelayReason = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Delay Reason", ProjectPlanColumnMap).Value);
                    task.DelayComments = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Delay Comments", ProjectPlanColumnMap).Value);
                    task.Remarks = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Remarks", ProjectPlanColumnMap).Value);
                    task.TaskManager = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Task Manager", ProjectPlanColumnMap).Value);
                    task.BaselineSet = Convert.ToBoolean(SmartsheetHelper.GetCellByColumnName(row, "Baseline Set", ProjectPlanColumnMap).Value);

                    //task.CommitedEndDate = !string.IsNullOrEmpty(task.CommitedEndDate) ? Convert.ToDateTime(task.CommitedEndDate).ToString("dd-MM-yyyy") : "";
                    lstTask.Add(task);
                }
                if (lstTask.Where(x => x.BaselineSet == true).Count() > 0)
                {
                    lstTask.Where(x => x.BaselineSet == false).ToList().ForEach(x => x.BaselineSet = true);
                }
                return lstTask;
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        public void UpdateTask(List<MCDSTask> Tasks, string ProjPlanSheetID)
        {
            Row row;
            List<Row> liRowsToUpdate = new();
            try
            {
                Dictionary<string, long> ProjectPlanColumnMap = new();
                var ProjectPlanDataSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(ProjPlanSheetID), null, null, null, null, null, null, null, null, null);

                foreach (var column in ProjectPlanDataSheet.Columns)
                {
                    ProjectPlanColumnMap.Add(column.Title, (long)column.Id);
                }

                foreach (var task in Tasks)
                {
                    Cell[] CellsToUpdate = new Cell[]
                    {
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.ParentID],
                            Value = task.ParentID == null ? 0 : task.ParentID
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.OrderID],
                            Value = task.OrderID
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Expanded],
                            Value = task.Expanded ? 1 : 0
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Summary],
                            Value = task.Summary ? 1 : 0
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Task],
                            Value = task.Title
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.PlannedStartDate],
                            Value = task.PlannedStart == null ? string.Empty : task.PlannedStart
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.PlannedEndDate],
                            Value = task.PlannedEnd == null ? string.Empty : task.PlannedEnd
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.ActualStartDate],
                            Value = task.Start
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.ActualEndDate],
                            Value = task.End
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.PercentCompleteDuration],
                            Value = task.PercentComplete
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Workdays],
                            Value = task.Workdays
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Duration],
                            Value = task.DurationDays
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Variance],
                            Value = task.VarianceDays
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.TaskManager],
                            Value = task.TaskManager
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.TaskStatus],
                            Value = task.TaskStatus
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.DelayReason],
                            Value = task.DelayReason
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.DelayComments],
                            Value = task.DelayComments
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Remarks],
                            Value = task.Remarks
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.BaselineSet],
                            Value = task.BaselineSet
                        },
                    };
                    row = new Row
                    {
                        Id = task.RowID,
                        Cells = CellsToUpdate
                    };
                    liRowsToUpdate.Add(row);
                }
                SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(Convert.ToInt64(ProjPlanSheetID), liRowsToUpdate);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
        }

        public void DeleteTask(List<MCDSTask> Tasks, string ProjPlanSheetID)
        {
            var RowIDs = Tasks.Select(x => x.RowID).ToList();
            SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.DeleteRows(Convert.ToInt64(ProjPlanSheetID), RowIDs, true);
        }

        public void CreateTask(List<MCDSTask> Tasks, string ProjPlanSheetID)
        {
            Dictionary<string, long> ProjectPlanColumnMap = new();
            Row row;
            List<Row> liRowsToAdd = new();
            try
            {
                var ColumnsInSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(ProjPlanSheetID), null, null, null, null, null, null, null, null, null).Columns;
                foreach (var column in ColumnsInSheet)
                {
                    ProjectPlanColumnMap.Add(column.Title, (long)column.Id);
                }

                foreach (var task in Tasks)
                {
                    Cell[] cellsToInsert = new Cell[]
                {
                    new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.ParentID],
                            Value = task.ParentID == null ? 0 : task.ParentID
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.OrderID],
                            Value = task.OrderID
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Expanded],
                            Value = task.Expanded ? 1 : 0
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Summary],
                            Value = task.Summary ? 1 : 0
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Task],
                            Value = task.Title
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.PlannedStartDate],
                            Value = task.PlannedStart == null ? string.Empty : task.PlannedStart
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.PlannedEndDate],
                            Value = task.PlannedEnd == null ? string.Empty : task.PlannedEnd
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.ActualStartDate],
                            Value = task.Start
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.ActualEndDate],
                            Value = task.End
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.PercentCompleteDuration],
                            Value = task.PercentComplete
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Workdays],
                            Value = task.Workdays
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Duration],
                            Value = task.DurationDays
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Variance],
                            Value = task.VarianceDays
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.TaskManager],
                            Value = task.TaskManager
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.TaskStatus],
                            Value = task.TaskStatus
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.DelayReason],
                            Value = task.DelayReason
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.DelayComments],
                            Value = task.DelayComments
                        },
                        new Cell
                        {
                            ColumnId = ProjectPlanColumnMap[CDSProjectPlan.Remarks],
                            Value = task.Remarks
                        },
                };

                    row = new Row
                    {
                        ToBottom = true,
                        Cells = cellsToInsert
                    };

                    liRowsToAdd.Add(row);
                }
                SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.AddRows(Convert.ToInt64(ProjPlanSheetID), liRowsToAdd);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
        }

        public List<MCDSDependency> GetGanttDependencies(string GanttDependenciesSheetID)
        {
            try
            {
                Dictionary<string, long> DependenciesColumnMap = new();

                var DependenciesDataSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(GanttDependenciesSheetID), null, null, null, null, null, null, null, null, null);

                foreach (var column in DependenciesDataSheet.Columns)
                {
                    DependenciesColumnMap.Add(column.Title, (long)column.Id);
                }

                MCDSDependency dependency;
                List<MCDSDependency> lstDependency = new();

                foreach (var row in DependenciesDataSheet.Rows)
                {
                    dependency = new MCDSDependency();
                    dependency.RowID = Convert.ToInt64(row.Id);
                    dependency.ID = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "ID", DependenciesColumnMap).Value);
                    dependency.PredecessorID = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "PredecessorID", DependenciesColumnMap).Value);
                    dependency.SuccessorID = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "SuccessorID", DependenciesColumnMap).Value);
                    dependency.Type = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "Type", DependenciesColumnMap).Value);

                    lstDependency.Add(dependency);
                }

                return lstDependency;
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        public void UpdateGanttDependencies(List<MCDSDependency> Dependencies, string GanttDependenciesSheetID)
        {
            Row row;
            List<Row> liRowsToUpdate = new();
            try
            {
                Dictionary<string, long> GanttDependenciesColumnMap = new();
                var GanttDependenciesDataSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(GanttDependenciesSheetID), null, null, null, null, null, null, null, null, null);

                foreach (var column in GanttDependenciesDataSheet.Columns)
                {
                    GanttDependenciesColumnMap.Add(column.Title, (long)column.Id);
                }

                foreach (var dependency in Dependencies)
                {
                    Cell[] CellsToUpdate = new Cell[]
                    {
                        new Cell
                        {
                            ColumnId = GanttDependenciesColumnMap[CDSGanttDependencies.PredecessorID],
                            Value = dependency.PredecessorID
                        },
                        new Cell
                        {
                            ColumnId = GanttDependenciesColumnMap[CDSGanttDependencies.SuccessorID],
                            Value = dependency.SuccessorID
                        },
                        new Cell
                        {
                            ColumnId = GanttDependenciesColumnMap[CDSGanttDependencies.Type],
                            Value = dependency.Type
                        }
                    };
                    row = new Row
                    {
                        Id = dependency.RowID,
                        Cells = CellsToUpdate
                    };
                    liRowsToUpdate.Add(row);
                }
                SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(Convert.ToInt64(GanttDependenciesSheetID), liRowsToUpdate);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
        }

        public void DeleteGanttDependencies(List<MCDSDependency> Dependencies, string GanttDependenciesSheetID)
        {
            var RowIDs = Dependencies.Select(x => x.RowID).ToList();
            SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.DeleteRows(Convert.ToInt64(GanttDependenciesSheetID), RowIDs, true);
        }

        public void CreateGanttDependencies(List<MCDSDependency> Dependencies, string GanttDependenciesSheetID)
        {
            Dictionary<string, long> GanttDependenciesColumnMap = new();
            Row row;
            List<Row> liRowsToAdd = new();
            try
            {
                var ColumnsInSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(GanttDependenciesSheetID), null, null, null, null, null, null, null, null, null).Columns;
                foreach (var column in ColumnsInSheet)
                {
                    GanttDependenciesColumnMap.Add(column.Title, (long)column.Id);
                }

                foreach (var dependency in Dependencies)
                {
                    Cell[] cellsToInsert = new Cell[]
                    {
                        new Cell
                        {
                            ColumnId = GanttDependenciesColumnMap[CDSGanttDependencies.PredecessorID],
                            Value = dependency.PredecessorID
                        },
                        new Cell
                        {
                            ColumnId = GanttDependenciesColumnMap[CDSGanttDependencies.SuccessorID],
                            Value = dependency.SuccessorID
                        },
                        new Cell
                        {
                            ColumnId = GanttDependenciesColumnMap[CDSGanttDependencies.Type],
                            Value = dependency.Type
                        }
                    };

                    row = new Row
                    {
                        ToBottom = true,
                        Cells = cellsToInsert
                    };

                    liRowsToAdd.Add(row);
                }
                SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.AddRows(Convert.ToInt64(GanttDependenciesSheetID), liRowsToAdd);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
        }

        public List<MCDSResources> GetGanttResources(string ProjResourcesSheetID)
        {
            try
            {
                Dictionary<string, long> ResourcesColumnMap = new();

                var ResourcesDataSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(ProjResourcesSheetID), null, null, null, null, null, null, null, null, null);

                foreach (var column in ResourcesDataSheet.Columns)
                {
                    ResourcesColumnMap.Add(column.Title, (long)column.Id);
                }
                MCDSResources resources;
                List<MCDSResources> lstResources = new();

                foreach (var row in ResourcesDataSheet.Rows)
                {
                    resources = new MCDSResources();
                    resources.RowID = Convert.ToInt64(row.Id);
                    resources.ID = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "ID", ResourcesColumnMap).Value);
                    //resources.Name = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Name", ResourcesColumnMap).Value);
                    resources.Name = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Email", ResourcesColumnMap).Value);
                    resources.Color = "#0E61C2";

                    lstResources.Add(resources);
                }

                return lstResources;
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        public List<MCDSResourceAssignment> GetGanttResourceAssignments(string GanttResourceAssignmentsSheetID)
        {
            try
            {
                Dictionary<string, long> ResourceAssignmentsColumnMap = new();

                var ResourceAssignmentsDataSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(GanttResourceAssignmentsSheetID), null, null, null, null, null, null, null, null, null);

                foreach (var column in ResourceAssignmentsDataSheet.Columns)
                {
                    ResourceAssignmentsColumnMap.Add(column.Title, (long)column.Id);
                }
                MCDSResourceAssignment resourceAssignment;
                List<MCDSResourceAssignment> lstResourceAssignment = new();

                foreach (var row in ResourceAssignmentsDataSheet.Rows)
                {
                    resourceAssignment = new MCDSResourceAssignment();
                    resourceAssignment.RowID = Convert.ToInt64(row.Id);
                    resourceAssignment.ID = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "ID", ResourceAssignmentsColumnMap).Value);
                    resourceAssignment.TaskID = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "TaskID", ResourceAssignmentsColumnMap).Value);
                    resourceAssignment.ResourceID = Convert.ToInt32(SmartsheetHelper.GetCellByColumnName(row, "ResourceID", ResourceAssignmentsColumnMap).Value);
                    resourceAssignment.Units = Convert.ToDecimal(SmartsheetHelper.GetCellByColumnName(row, "Units", ResourceAssignmentsColumnMap).Value);

                    lstResourceAssignment.Add(resourceAssignment);
                }

                return lstResourceAssignment;
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        public void UpdateGanttResourceAssignments(List<MCDSResourceAssignment> ResourceAssignments, string GanttResourceAssignmentsSheetID)
        {
            Row row;
            List<Row> liRowsToUpdate = new();
            try
            {
                Dictionary<string, long> GanttResourceAssignmentsColumnMap = new();
                var GanttResourceAssignmentsDataSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(GanttResourceAssignmentsSheetID), null, null, null, null, null, null, null, null, null);

                foreach (var column in GanttResourceAssignmentsDataSheet.Columns)
                {
                    GanttResourceAssignmentsColumnMap.Add(column.Title, (long)column.Id);
                }

                foreach (var ResAssignment in ResourceAssignments)
                {
                    Cell[] CellsToUpdate = new Cell[]
                    {
                        new Cell
                        {
                            ColumnId = GanttResourceAssignmentsColumnMap[CDSGanttResourceAssignments.TaskID],
                            Value = ResAssignment.TaskID
                        },
                        new Cell
                        {
                            ColumnId = GanttResourceAssignmentsColumnMap[CDSGanttResourceAssignments.ResourceID],
                            Value = ResAssignment.ResourceID
                        },
                        new Cell
                        {
                            ColumnId = GanttResourceAssignmentsColumnMap[CDSGanttResourceAssignments.Units],
                            Value = ResAssignment.Units
                        }
                    };
                    row = new Row
                    {
                        Id = ResAssignment.RowID,
                        Cells = CellsToUpdate
                    };
                    liRowsToUpdate.Add(row);
                }
                SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(Convert.ToInt64(GanttResourceAssignmentsSheetID), liRowsToUpdate);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
        }

        public void DeleteGanttResourceAssignments(List<MCDSResourceAssignment> ResourceAssignments, string GanttResourceAssignmentsSheetID)
        {
            var RowIDs = ResourceAssignments.Select(x => x.RowID).ToList();
            SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.DeleteRows(Convert.ToInt64(GanttResourceAssignmentsSheetID), RowIDs, true);
        }

        public void CreateGanttResourceAssignments(List<MCDSResourceAssignment> ResourceAssignments, string GanttResourceAssignmentsSheetID)
        {
            Dictionary<string, long> GanttResourceAssignmentsColumnMap = new();
            Row row;
            List<Row> liRowsToAdd = new();
            try
            {
                var ColumnsInSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(GanttResourceAssignmentsSheetID), null, null, null, null, null, null, null, null, null).Columns;
                foreach (var column in ColumnsInSheet)
                {
                    GanttResourceAssignmentsColumnMap.Add(column.Title, (long)column.Id);
                }

                foreach (var ResAssignment in ResourceAssignments)
                {
                    Cell[] cellsToInsert = new Cell[]
                    {
                        new Cell
                        {
                            ColumnId = GanttResourceAssignmentsColumnMap[CDSGanttResourceAssignments.TaskID],
                            Value = ResAssignment.TaskID
                        },
                        new Cell
                        {
                            ColumnId = GanttResourceAssignmentsColumnMap[CDSGanttResourceAssignments.ResourceID],
                            Value = ResAssignment.ResourceID
                        },
                        new Cell
                        {
                            ColumnId = GanttResourceAssignmentsColumnMap[CDSGanttResourceAssignments.Units],
                            Value = ResAssignment.Units
                        }
                    };

                    row = new Row
                    {
                        ToBottom = true,
                        Cells = cellsToInsert
                    };

                    liRowsToAdd.Add(row);
                }
                SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.AddRows(Convert.ToInt64(GanttResourceAssignmentsSheetID), liRowsToAdd);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
            }
        }
    }
}
