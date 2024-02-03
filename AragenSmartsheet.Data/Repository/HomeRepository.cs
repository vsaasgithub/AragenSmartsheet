using AragenSmartsheet.Data.Common;
using AragenSmartsheet.Data.IRepository;
using AragenSmartsheet.Entities.Biology;
using AragenSmartsheet.Entities.CDS;
using AragenSmartsheet.Entities.Client;
using AragenSmartsheet.Entities.Home;
using AragenSmartsheet.Integration.SmartsheetIntegration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Serilog;
using Smartsheet.Api.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;

namespace AragenSmartsheet.Data.Repository
{
    public class HomeRepository : IHomeRepository
    {
        readonly ConfigurationBuilder configurationBuilder = new();
        public HomeRepository()
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
            configurationBuilder.AddJsonFile(path, false);
        }

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit Biology and project type FTE
        /// </summary>
        /// <param name="projectIntake"></param>
        /// <returns>Smartsheet folder path of new project</returns>
        public string CreateBiologyFTEProject(MProjectIntake projectIntake, string submitter)
        {
            Dictionary<string, long> columnMap = new();
            List<Row> liRowsToAdd = new();
            Row row;

            try
            {
                var FTEIntakeSheetID = long.Parse(configurationBuilder.Build().GetSection("FTEIntakeSheet").Value);

                var ColumnsInSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(FTEIntakeSheetID, null, null, null, null, null, null, null, null, null).Columns;
                foreach (var column in ColumnsInSheet)
                {
                    columnMap.Add(column.Title, (long)column.Id);
                }

                Cell[] cellsToInsert = new Cell[]
                {
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.ClientName],
                        Value = projectIntake.BiologyProject.FTE.Client
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.Region],
                        Value = projectIntake.BiologyProject.FTE.Region
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.SaleOrder],
                        Value = projectIntake.BiologyProject.FTE.SaleOrder
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.PONumber],
                        Value = projectIntake.BiologyProject.FTE.PONo
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.WBSElement],
                        Value = projectIntake.BiologyProject.FTE.WBSCode
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.ProposalReference],
                        Value = projectIntake.BiologyProject.FTE.ProposalCode
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.IDD],
                        Value = projectIntake.BiologyProject.FTE.IDD
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.Service],
                        Value = projectIntake.BiologyProject.FTE.Service
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.NoOfFTEs],
                        Value = projectIntake.BiologyProject.FTE.NoOfFTE
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.StartDate],
                        Value = String.IsNullOrEmpty(projectIntake.BiologyProject.FTE.StartDate.Trim()) ? string.Empty : DateTime.ParseExact(projectIntake.BiologyProject.FTE.StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.FTEContractEndDate],
                        Value = String.IsNullOrEmpty(projectIntake.BiologyProject.FTE.FTEContractEndDate.Trim()) ? string.Empty : DateTime.ParseExact(projectIntake.BiologyProject.FTE.FTEContractEndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    //new Cell
                    //{
                    //    ColumnId = columnMap[BioFTEIntakeSheet.RenewalDate],
                    //    Value = String.IsNullOrEmpty(projectIntake.BiologyProject.FTE.RenewalDate.Trim()) ? string.Empty : DateTime.ParseExact(projectIntake.BiologyProject.FTE.RenewalDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    //},
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.PMPOC],
                        Value = projectIntake.BiologyProject.FTE.PMPOC
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.BD],
                        Value = projectIntake.BiologyProject.FTE.BD
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.TotalPOValues],
                        Value = Convert.ToInt64(projectIntake.BiologyProject.FTE.TotalPOValues.Replace(",", ""))
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.FTECost],
                        Value = Convert.ToInt64(projectIntake.BiologyProject.FTE.FTECost.Replace(",", ""))
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.PassthroughValue],
                        Value = Convert.ToInt64(projectIntake.BiologyProject.FTE.PassthroughValue.Replace(",", ""))
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioFTEIntakeSheet.CreatedBy],
                        Value = submitter,
                    },
                };
                row = new Row
                {
                    ToBottom = true,
                    Cells = cellsToInsert
                };

                liRowsToAdd.Add(row);
                var FTEIntakeSheetInsertedRow = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.AddRows(FTEIntakeSheetID, liRowsToAdd);

                if (FTEIntakeSheetInsertedRow.Count > 0)
                {
                    //Create Folder
                    Folder folder = new();
                    var DestinationFolderFTE = long.Parse(configurationBuilder.Build().GetSection("DestinationFolderBioFTE").Value);
                    var FTETempelate = long.Parse(configurationBuilder.Build().GetSection("BioFTETempelate").Value);

                    // Specify destination older
                    string ClientName = projectIntake.BiologyProject.FTE.Client;
                    if (ClientName.Length > 45)
                    {
                        ClientName = ClientName[..45];
                    }
                    ContainerDestination destination = new()
                    {
                        DestinationId = DestinationFolderFTE,
                        DestinationType = DestinationType.FOLDER,
                        NewName = "FTE_" + ClientName
                    };

                    //Copy Folder
                    folder = SmartsheetAppIntegration.AccessClient().FolderResources.CopyFolder(FTETempelate, destination, new FolderCopyInclusion[] { FolderCopyInclusion.ATTACHMENTS, FolderCopyInclusion.CELL_LINKS, FolderCopyInclusion.DATA, FolderCopyInclusion.DISCUSSIONS, FolderCopyInclusion.FILTERS, FolderCopyInclusion.FORMS, FolderCopyInclusion.RULES, FolderCopyInclusion.RULE_RECIPIENTS, FolderCopyInclusion.SHARES }, null);

                    //Getting Folder object
                    Folder folderObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(Convert.ToInt64(folder.Id), null);

                    Sheet sheetProjectPlan = new();
                    Int64 ProjPlanSheetID = 0;
                    Int64 ProjectPlanRowID = 0;
                    var FolderId = folderObj.Id.ToString() + '+' + folderObj.Name.ToString();
                    foreach (var item in folderObj.Sheets)
                    {
                        if (item.Name == "Project Plan")
                        {
                            sheetProjectPlan = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(item.Id), null, null, null, null, null, null, null);
                            ProjPlanSheetID = Convert.ToInt64(item.Id);
                        }
                    }

                    ProjectPlanRowID = Convert.ToInt64(sheetProjectPlan.Rows.First().Id);
                    var ProjPlanColIDTask = sheetProjectPlan.Columns.Where(x => x.Title == "Task").Select(y => y.Id).FirstOrDefault();

                    var cellToUpdateInProjectPlanSheet = new Cell
                    {
                        ColumnId = ProjPlanColIDTask,
                        Value = projectIntake.BiologyProject.FTE.Client
                    };

                    // Identify row and add new cell values to it
                    var rowToUpdatePlan = new Row
                    {
                        Id = ProjectPlanRowID,
                        Cells = new Cell[] { cellToUpdateInProjectPlanSheet }
                    };
                    IList<Row> updatedRowPlan = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(ProjPlanSheetID, new Row[] { rowToUpdatePlan });
                    return FolderId;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit Biology and project type Open PO
        /// </summary>
        /// <param name="projectIntake"></param>
        /// <returns>Smartsheet folder path of new project</returns>
        public string CreateBiologyOPOProject(MProjectIntake projectIntake, string submitter)
        {
            Dictionary<string, long> columnMapOPOIntake = new();
            List<Row> liRowsToAdd = new();
            List<Row> liRowsToUpdate = new();
            Row row;

            try
            {
                var OPOIntakeSheetID = long.Parse(configurationBuilder.Build().GetSection("OPOIntakeSheet").Value);

                var ColumnsInSheetOPOIntake = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(OPOIntakeSheetID, null, null, null, null, null, null, null, null, null).Columns;
                foreach (var column in ColumnsInSheetOPOIntake)
                {
                    columnMapOPOIntake.Add(column.Title, (long)column.Id);
                }
                Cell[] cellsToInsert = new Cell[]
                {
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.ClientName],
                        Value = projectIntake.BiologyProject.OpenPO.Client
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.Location],
                        Value = string.IsNullOrEmpty(projectIntake.BiologyProject.OpenPO.Location) ? string.Empty : Convert.ToString(projectIntake.BiologyProject.OpenPO.Location)
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.ProposalCode],
                        Value = projectIntake.BiologyProject.OpenPO.ProposalCode
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.SaleOrder],
                        Value = projectIntake.BiologyProject.OpenPO.SaleOrder
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.WBSCode],
                        Value = projectIntake.BiologyProject.OpenPO.WBSCode
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.PONo],
                        Value = string.IsNullOrEmpty(projectIntake.BiologyProject.OpenPO.PONo) ? string.Empty : Convert.ToString(projectIntake.BiologyProject.OpenPO.PONo)
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.ProposalApprovalDate],
                        Value = String.IsNullOrEmpty(projectIntake.BiologyProject.OpenPO.ProposalApprovalDate.Trim()) ? string.Empty : DateTime.ParseExact(projectIntake.BiologyProject.OpenPO.ProposalApprovalDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.Region],
                        Value = projectIntake.BiologyProject.OpenPO.Region
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.Service],
                        Value = projectIntake.BiologyProject.OpenPO.Service
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.StudyDetails],
                        Value = projectIntake.BiologyProject.OpenPO.StudyDetails
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.SalesTeam],
                        Value = projectIntake.BiologyProject.OpenPO.SalesTeam
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.ProjectLead],
                        Value = projectIntake.BiologyProject.OpenPO.ProjectLead
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.NoOfUnits],
                        Value = projectIntake.BiologyProject.OpenPO.NoOfUnits
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.TypeOfPO],
                        Value = projectIntake.BiologyProject.OpenPO.ProjectType
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.CompoundReceiptDate],
                        Value = String.IsNullOrEmpty(projectIntake.BiologyProject.OpenPO.CompoundReceiptDate.Trim()) ? string.Empty : DateTime.ParseExact(projectIntake.BiologyProject.OpenPO.CompoundReceiptDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.NoOfDays],
                        Value = projectIntake.BiologyProject.OpenPO.NoOfDays
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.StudyInitiationDate],
                        Value = String.IsNullOrEmpty(projectIntake.BiologyProject.OpenPO.StudyInitiationDate.Trim()) ? string.Empty : DateTime.ParseExact(projectIntake.BiologyProject.OpenPO.StudyInitiationDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.ActualPOValue],
                        Value = Convert.ToInt64(projectIntake.BiologyProject.OpenPO.ActualPOValue.Replace(",", "")),
                    },
                    new Cell
                    {
                        ColumnId = columnMapOPOIntake[BioOPOIntakeSheet.CreatedBy],
                        Value = submitter,
                    },
                };
                row = new Row
                {
                    ToBottom = true,
                    Cells = cellsToInsert
                };

                liRowsToAdd.Add(row);
                var OPOIntakeSheetInsertedRow = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.AddRows(OPOIntakeSheetID, liRowsToAdd);

                if (OPOIntakeSheetInsertedRow.Count > 0)
                {
                    string strFinYear = GetCurrentFinancialYear();
                    string strY1 = strFinYear.Split("-")[0];
                    string strY2 = strFinYear.Split("-")[1];

                    //Create Folder
                    Folder folder = new();
                    var DestinationFolderOPO = long.Parse(configurationBuilder.Build().GetSection("DestinationFolderBioOPO").Value);
                    var OPOTempelate = long.Parse(configurationBuilder.Build().GetSection("BioOPOTempelate").Value);

                    // Specify destination older
                    string ClientName = projectIntake.BiologyProject.OpenPO.Client;
                    if (ClientName.Length > 24)
                    {
                        ClientName = ClientName[..24];
                    }
                    ContainerDestination destination = new()
                    {
                        DestinationId = DestinationFolderOPO,
                        DestinationType = DestinationType.FOLDER,
                        NewName = ClientName + "_" + projectIntake.BiologyProject.OpenPO.WBSCode
                    };

                    //Copy Folder
                    folder = SmartsheetAppIntegration.AccessClient().FolderResources.CopyFolder(
                      OPOTempelate,
                      destination,
                      new FolderCopyInclusion[] {
                    FolderCopyInclusion.ATTACHMENTS, FolderCopyInclusion.CELL_LINKS, FolderCopyInclusion.DATA, FolderCopyInclusion.DISCUSSIONS, FolderCopyInclusion.FILTERS, FolderCopyInclusion.FORMS, FolderCopyInclusion.RULES, FolderCopyInclusion.RULE_RECIPIENTS, FolderCopyInclusion.SHARES
                      },
                        null
                    );

                    //Getting Folder object
                    Folder folderObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(
                      Convert.ToInt64(folder.Id),
                      null
                    );
                    var FolderId = folderObj.Id.ToString() + '+' + folderObj.Name;
                    foreach (var fol in folderObj.Folders)
                    {
                        if (fol.Name.Contains("Y1"))
                        {
                            string strNewName = fol.Name.Replace("Y1", strY1);
                            Folder folderSpecification = new()
                            {
                                Id = fol.Id,
                                Name = strNewName
                            };

                            // Update folder
                            Folder updatedFolder = SmartsheetAppIntegration.AccessClient().FolderResources.UpdateFolder(folderSpecification);

                            Folder folObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(Convert.ToInt64(fol.Id), null);
                            foreach (var sheet in folObj.Sheets)
                            {
                                if (sheet.Name.Contains("Y1"))
                                {
                                    Sheet sheetSpecification = new()
                                    {
                                        Id = sheet.Id,
                                        Name = sheet.Name.Replace("Y1", strY1)
                                    };

                                    // Update sheet
                                    Sheet updatedSheet = SmartsheetAppIntegration.AccessClient().SheetResources.UpdateSheet(sheetSpecification);
                                }
                            }
                        }
                        else if (fol.Name.Contains("Y2"))
                        {
                            string strNewName = fol.Name.Replace("Y2", strY2);
                            Folder folderSpecification = new()
                            {
                                Id = fol.Id,
                                Name = strNewName
                            };

                            // Update folder
                            Folder updatedFolder = SmartsheetAppIntegration.AccessClient().FolderResources.UpdateFolder(folderSpecification);

                            Folder folObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(Convert.ToInt64(fol.Id), null);
                            foreach (var sheet in folObj.Sheets)
                            {
                                if (sheet.Name.Contains("Y2"))
                                {
                                    Sheet sheetSpecification = new()
                                    {
                                        Id = sheet.Id,
                                        Name = sheet.Name.Replace("Y2", strY2)
                                    };

                                    // Update sheet
                                    Sheet updatedSheet = SmartsheetAppIntegration.AccessClient().SheetResources.UpdateSheet(sheetSpecification);
                                }
                            }
                        }
                    }

                    Sheet sheetProjectPlan = new();
                    Int64 ProjPlanSheetID = 0;
                    Int64 MonthSummarySheetID = 0;
                    Int64? MonthSummaryTotalBilledValRowID = 0;
                    Int64? MonthSummaryAvgDelayDaysRowID = 0;
                    Int64? MonthSummaryOTIFRowID = 0;
                    Int64 ProjectPlanRowID = 0;
                    Dictionary<string, long> dctMonthlySummaryYearCols = new();
                    foreach (var item in folderObj.Sheets)
                    {
                        if (item.Name == "Project Plan")
                        {
                            sheetProjectPlan = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(item.Id), null, null, null, null, null, null, null);
                            ProjPlanSheetID = Convert.ToInt64(item.Id);

                            ProjectPlanRowID = Convert.ToInt64(sheetProjectPlan.Rows.First().Id);
                            var ProjPlanColIDTask = sheetProjectPlan.Columns.Where(x => x.Title == "Task").Select(y => y.Id).FirstOrDefault();

                            var cellToUpdateInProjectPlanSheet = new Cell
                            {
                                ColumnId = ProjPlanColIDTask,
                                Value = projectIntake.BiologyProject.OpenPO.Client
                            };

                            // Identify row and add new cell values to it
                            var rowToUpdatePlan = new Row
                            {
                                Id = ProjectPlanRowID,
                                Cells = new Cell[] { cellToUpdateInProjectPlanSheet }
                            };
                            IList<Row> updatedRowPlan = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(ProjPlanSheetID, new Row[] { rowToUpdatePlan });
                        }

                        if (item.Name == "Monthly Summary")
                        {
                            var columnsMonthSummary = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(item.Id), null, null, null, null, null, null, null).Columns;
                            MonthSummaryTotalBilledValRowID = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(item.Id), null, null, null, null, null, null, null).Rows[0].Id;
                            MonthSummaryAvgDelayDaysRowID = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(item.Id), null, null, null, null, null, null, null).Rows[2].Id;
                            MonthSummaryOTIFRowID = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(item.Id), null, null, null, null, null, null, null).Rows[5].Id;
                            MonthSummarySheetID = Convert.ToInt64(item.Id);
                            foreach (var col in columnsMonthSummary)
                            {
                                if (col.Title.Contains("Y1"))
                                {
                                    // Specify column properties
                                    Column columnSpecification = new()
                                    {
                                        Id = col.Id,
                                        Title = col.Title.Replace("Y1", strY1)
                                    };
                                    dctMonthlySummaryYearCols.Add(columnSpecification.Title, Convert.ToInt64(columnSpecification.Id));
                                    // Update column
                                    Column updatedColumn = SmartsheetAppIntegration.AccessClient().SheetResources.ColumnResources.UpdateColumn(MonthSummarySheetID, columnSpecification);
                                }
                                else if (col.Title.Contains("Y2"))
                                {
                                    // Specify column properties
                                    Column columnSpecification = new()
                                    {
                                        Id = col.Id,
                                        Title = col.Title.Replace("Y2", strY2)
                                    };
                                    dctMonthlySummaryYearCols.Add(columnSpecification.Title, Convert.ToInt64(columnSpecification.Id));
                                    // Update column
                                    Column updatedColumn = SmartsheetAppIntegration.AccessClient().SheetResources.ColumnResources.UpdateColumn(MonthSummarySheetID, columnSpecification);
                                }
                            }
                        }
                    }

                    List<Cell> cellsLinksToUpdateInOPOIntake = new();
                    foreach (var columnRecordMonthSum in dctMonthlySummaryYearCols)
                    {
                        foreach (var columnRecordOPOIntake in columnMapOPOIntake)
                        {
                            if (columnRecordMonthSum.Key[..3] + " 20" + strY1 + " Actual Value" == columnRecordOPOIntake.Key || columnRecordMonthSum.Key[..3] + " 20" + strY2 + " Actual Value" == columnRecordOPOIntake.Key)
                            {
                                cellsLinksToUpdateInOPOIntake.Add(
                                    new Cell
                                    {
                                        ColumnId = columnRecordOPOIntake.Value,
                                        LinkInFromCell = new CellLink { SheetId = MonthSummarySheetID, ColumnId = columnRecordMonthSum.Value, RowId = MonthSummaryTotalBilledValRowID }
                                    }
                                );
                            }
                            else if (columnRecordMonthSum.Key[..3] == columnRecordOPOIntake.Key)
                            {
                                cellsLinksToUpdateInOPOIntake.Add(
                                    new Cell
                                    {
                                        ColumnId = columnRecordOPOIntake.Value,
                                        LinkInFromCell = new CellLink { SheetId = MonthSummarySheetID, ColumnId = columnRecordMonthSum.Value, RowId = MonthSummaryAvgDelayDaysRowID }
                                    }
                                );
                            }
                            else if (columnRecordMonthSum.Key[..3] + "_OTIF" == columnRecordOPOIntake.Key)
                            {
                                cellsLinksToUpdateInOPOIntake.Add(
                                    new Cell
                                    {
                                        ColumnId = columnRecordOPOIntake.Value,
                                        LinkInFromCell = new CellLink { SheetId = MonthSummarySheetID, ColumnId = columnRecordMonthSum.Value, RowId = MonthSummaryOTIFRowID }
                                    }
                                );
                            }
                        }
                    }

                    row = new Row
                    {
                        Id = OPOIntakeSheetInsertedRow[0].Id,
                        Cells = cellsLinksToUpdateInOPOIntake
                    };

                    liRowsToUpdate.Add(row);
                    SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(OPOIntakeSheetID, liRowsToUpdate);

                    return folder.Id.ToString();
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit Biology and project type Single PO
        /// </summary>
        /// <param name="projectIntake"></param>
        /// <returns>Smartsheet sheet path of new project</returns>
        public string CreateBiologySPOProject(MProjectIntake projectIntake, string submitter)
        {
            Dictionary<string, long> columnMap = new();
            List<Row> liRowsToAdd = new();
            Row row;

            try
            {
                var SPOIntakeSheetID = long.Parse(configurationBuilder.Build().GetSection("SPOIntakeSheet").Value);

                var ColumnsInSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(SPOIntakeSheetID, null, null, null, null, null, null, null, null, null).Columns;
                foreach (var column in ColumnsInSheet)
                {
                    columnMap.Add(column.Title, (long)column.Id);
                }
                Cell[] cellsToInsert = new Cell[]
                {
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.ClientName],
                        Value = projectIntake.BiologyProject.SinglePO.Client
                    },

                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.Location],
                        Value = String.IsNullOrEmpty(projectIntake.BiologyProject.SinglePO.Location) ? string.Empty : Convert.ToString(projectIntake.BiologyProject.SinglePO.Location)
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.ProposalCode],
                        Value = projectIntake.BiologyProject.SinglePO.ProposalCode
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.SaleOrder],
                        Value = projectIntake.BiologyProject.SinglePO.SaleOrder
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.WBSCode],
                        Value = projectIntake.BiologyProject.SinglePO.WBSCode
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.PONoSOW],
                        Value = projectIntake.BiologyProject.SinglePO.PONo
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.ProposalApprovalDate],
                        Value = String.IsNullOrEmpty(projectIntake.BiologyProject.SinglePO.ProposalApprovalDate.Trim()) ? string.Empty : DateTime.ParseExact(projectIntake.BiologyProject.SinglePO.ProposalApprovalDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.Region],
                        Value = projectIntake.BiologyProject.SinglePO.Region
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.Service],
                        Value = projectIntake.BiologyProject.SinglePO.Service
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.StudyDetails],
                        Value = projectIntake.BiologyProject.SinglePO.StudyDetails
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.SalesTeam],
                        Value = projectIntake.BiologyProject.SinglePO.SalesTeam
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.ProjectLead],
                        Value = projectIntake.BiologyProject.SinglePO.ProjectLead
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.NoOfUnits],
                        Value = projectIntake.BiologyProject.SinglePO.NoOfUnits
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.TypeOfPO],
                        Value = projectIntake.BiologyProject.SinglePO.ProjectType
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.CompoundReceiptDate],
                        Value = String.IsNullOrEmpty(projectIntake.BiologyProject.SinglePO.CompoundReceiptDate.Trim()) ? string.Empty : DateTime.ParseExact(projectIntake.BiologyProject.SinglePO.CompoundReceiptDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.NoOfDays],
                        Value = projectIntake.BiologyProject.SinglePO.NoOfDays
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.StudyInitiationDate],
                        Value = String.IsNullOrEmpty(projectIntake.BiologyProject.SinglePO.StudyInitiationDate.Trim()) ? string.Empty : DateTime.ParseExact(projectIntake.BiologyProject.SinglePO.StudyInitiationDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.ActualPOValue],
                        Value = Convert.ToInt64(projectIntake.BiologyProject.SinglePO.ActualPOValue.Replace(",", "")),
                    },
                    new Cell
                    {
                        ColumnId = columnMap[BioSPOIntakeSheet.CreatedBy],
                        Value = submitter,
                    },
                };
                row = new Row
                {
                    ToBottom = true,
                    Cells = cellsToInsert
                };

                liRowsToAdd.Add(row);
                var SPOIntakeSheetInsertedRow = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.AddRows(SPOIntakeSheetID, liRowsToAdd);

                if (SPOIntakeSheetInsertedRow.Count > 0)
                {
                    return "https://app.smartsheet.com/sheets/452mHGCv8jF9WW9cJCH7Vp8XX4fPrR37RFf8hcv1";
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }

        }

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit CDS
        /// </summary>
        /// <param name="pProjectIntake"></param>
        /// <returns>Smartsheet folder path of new project</returns>
        //public string CreateCDSProject(MProjectIntake pProjectIntake, string submitter)
        //{
        //    Dictionary<string, long> columnMap = new();
        //    Dictionary<string, long> columnMapProjMeta = new();
        //    List<Row> liRowsToUpdate = new();
        //    List<Row> liRowsToUpdatePlan = new();
        //    Row row;
        //    List<Row> liRowsToAdd = new();
        //    try
        //    {
        //        var CDSProjectIntakeSheet = long.Parse(configurationBuilder.Build().GetSection("CDSProjectIntakeSheet").Value);
        //        var DestinationFolderCDS = long.Parse(configurationBuilder.Build().GetSection("DestinationFolderCDS").Value);
        //        var CDSTempelate = long.Parse(configurationBuilder.Build().GetSection("CDSTempelate").Value);

        //        var ColumnsInSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(CDSProjectIntakeSheet, null, null, null, null, null, null, null, null, null).Columns;
        //        foreach (var column in ColumnsInSheet)
        //        {
        //            columnMap.Add(column.Title, (long)column.Id);
        //        }

        //        Cell[] cellsToInsert = new Cell[]
        //        {
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.BusinessUnit],
        //                Value = pProjectIntake.BusinessUnit
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.ProposalCode],
        //                Value = pProjectIntake.CDSProject.ProposalCode
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.ProjectCode],
        //                Value = pProjectIntake.CDSProject.ProjectCode
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.Client],
        //                Value = pProjectIntake.CDSProject.Client
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.PlannedStartDate],
        //                Value = Convert.ToDateTime(pProjectIntake.CDSProject.StartDate).Date
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.PlannedEndDate],
        //                Value = Convert.ToDateTime(pProjectIntake.CDSProject.EndDate).Date
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.Qty],
        //                Value = pProjectIntake.CDSProject.Qty
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.Units],
        //                Value = string.IsNullOrEmpty(pProjectIntake.CDSProject.Units)? string.Empty : pProjectIntake.CDSProject.Units
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.Deliverable],
        //                Value = pProjectIntake.CDSProject.Deliverable
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.ProjectType],
        //                Value = pProjectIntake.CDSProject.ProjectType
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.GMPNonGMP],
        //                Value = pProjectIntake.CDSProject.GMPOrNonGMP
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.Molecules],
        //                Value = pProjectIntake.CDSProject.Molecules
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.Phase],
        //                Value = string.IsNullOrEmpty(pProjectIntake.CDSProject.Phase)? string.Empty : pProjectIntake.CDSProject.Phase
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.Region],
        //                Value = pProjectIntake.CDSProject.Region
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.ProjectValue],
        //                Value = Convert.ToDouble(pProjectIntake.CDSProject.ProjectValue)
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.Submitter],
        //                Value = submitter
        //            }
        //        };

        //        row = new Row
        //        {
        //            ToBottom = true,
        //            Cells = cellsToInsert
        //        };

        //        liRowsToAdd.Add(row);
        //        var ProjIntakeSheetInsertedRow = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.AddRows(CDSProjectIntakeSheet, liRowsToAdd);

        //        if (ProjIntakeSheetInsertedRow.Count > 0)
        //        {
        //            //Project Intake Sheet
        //            Int64 ProjIntakeColIDProjectCode = columnMap[CDSIntakeForm.ProjectCode];
        //            Int64 ProjIntakeColIDClient = columnMap[CDSIntakeForm.Client];

        //            //Create Folder
        //            Folder folder = new();
        //            Int64 ProjMetaDataSheetID = 0;
        //            Int64 ProjPlanSheetID = 0;
        //            Sheet sheetProjectMetaData = new();
        //            Sheet sheetProjectPlan = new();

        //            // Specify destination older
        //            ContainerDestination destination = new()
        //            {
        //                DestinationId = DestinationFolderCDS,
        //                DestinationType = DestinationType.FOLDER,
        //                NewName = pProjectIntake.CDSProject.ProjectCode + "_" + pProjectIntake.CDSProject.Client
        //            };

        //            //Copy Folder
        //            folder = SmartsheetAppIntegration.AccessClient().FolderResources.CopyFolder(CDSTempelate, destination, new FolderCopyInclusion[] { FolderCopyInclusion.ATTACHMENTS, FolderCopyInclusion.CELL_LINKS, FolderCopyInclusion.DATA, FolderCopyInclusion.DISCUSSIONS, FolderCopyInclusion.FILTERS, FolderCopyInclusion.FORMS, FolderCopyInclusion.RULES, FolderCopyInclusion.RULE_RECIPIENTS, FolderCopyInclusion.SHARES  }, null);

        //            //Getting Folder object
        //            Folder folderObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(
        //              Convert.ToInt64(folder.Id),
        //              null
        //            );

        //            string strFolderLink = folderObj.Permalink;

        //            //Get Project Matedata and Project Plan sheet
        //            foreach (var item in folderObj.Sheets)
        //            {
        //                if (item.Name == "Project Metadata")
        //                {
        //                    sheetProjectMetaData = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(item.Id), null, null, null, null, null, null, null);
        //                    ProjMetaDataSheetID = Convert.ToInt64(item.Id);
        //                }
        //                else if (item.Name == "Project Plan")
        //                {
        //                    sheetProjectPlan = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(item.Id), null, null, null, null, null, null, null);
        //                    ProjPlanSheetID = Convert.ToInt64(item.Id);
        //                }
        //            }

        //            //Project MetaData Sheet
        //            Int64 ProjMetaDataColIDProjectHealth = 0;
        //            Int64 ProjMetaDataColIDScientists = 0;
        //            Int64 ProjMetaDataColIDProjectManager = 0;
        //            Int64 ProjMetaDataColIDActStartDate = 0;
        //            Int64 ProjMetaDataColIDActEndDate = 0;
        //            Int64 ProjMetaDataColIDPctComplete = 0;
        //            Int64 ProjMetaDataColIDProjStatus = 0;
        //            Int64 ProjMetaDataColIDDelayReason = 0;
        //            Int64 ProjMetaDataColIDDashboardLink = 0;
        //            Int64 ProjMetaDataColIDBudgetConsumed = 0;
        //            Int64 ProjMetaDataColIDBudgetAvailable = 0;
        //            Int64 ProjMetaDataColIDManufacturingUnit = 0;
        //            Int64 ProjMetaDataColIDPlantLab = 0;

        //            PaginatedResult<Column> ProjMetaDataColumns = SmartsheetAppIntegration.AccessClient().SheetResources.ColumnResources.ListColumns(ProjMetaDataSheetID, null, null, 2);

        //            foreach (var column in ProjMetaDataColumns.Data)
        //            {
        //                columnMapProjMeta.Add(column.Title, (long)column.Id);
        //            }
        //            Int64 ProjectMetaDataRowID = Convert.ToInt64(sheetProjectMetaData.Rows[0].Id);

        //            List<Cell> cellToUpdateInProjectMetaSheet = new();
        //            foreach (var item in ProjMetaDataColumns.Data)
        //            {
        //                switch (item.Title)
        //                {
        //                    case CDSProjectMetaData.PlantLab:
        //                        {
        //                            ProjMetaDataColIDPlantLab = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.ManufacturingUnit:
        //                        {
        //                            ProjMetaDataColIDManufacturingUnit = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.BudgetAvailable:
        //                        {
        //                            ProjMetaDataColIDBudgetAvailable = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.BudgetConsumed:
        //                        {
        //                            ProjMetaDataColIDBudgetConsumed = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.DashboardURL:
        //                        {
        //                            ProjMetaDataColIDDashboardLink = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.DelayReason:
        //                        {
        //                            ProjMetaDataColIDDelayReason = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.PercentComplete:
        //                        {
        //                            ProjMetaDataColIDPctComplete = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.ProjectStatus:
        //                        {
        //                            ProjMetaDataColIDProjStatus = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.ProjectHealth:
        //                        {
        //                            ProjMetaDataColIDProjectHealth = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.Scientist:
        //                        {
        //                            ProjMetaDataColIDScientists = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.ProjectManager:
        //                        {
        //                            ProjMetaDataColIDProjectManager = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.ActualStartDate:
        //                        {
        //                            ProjMetaDataColIDActStartDate = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.ActualEndDate:
        //                        {
        //                            ProjMetaDataColIDActEndDate = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.ProjectCode:
        //                        {
        //                            cellToUpdateInProjectMetaSheet.Add(new Cell
        //                            {
        //                                ColumnId = Convert.ToInt64(item.Id),
        //                                Value = pProjectIntake.CDSProject.ProjectCode
        //                            });
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.ProposalCode:
        //                        {
        //                            cellToUpdateInProjectMetaSheet.Add(new Cell
        //                            {
        //                                ColumnId = Convert.ToInt64(item.Id),
        //                                Value = pProjectIntake.CDSProject.ProposalCode
        //                            });
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.ProjectName:
        //                        {
        //                            cellToUpdateInProjectMetaSheet.Add(new Cell
        //                            {
        //                                ColumnId = Convert.ToInt64(item.Id),
        //                                Value = pProjectIntake.CDSProject.ProjectName
        //                            });
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.Customer:
        //                        {
        //                            cellToUpdateInProjectMetaSheet.Add(new Cell
        //                            {
        //                                ColumnId = Convert.ToInt64(item.Id),
        //                                Value = pProjectIntake.CDSProject.Client
        //                            });
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.PlannedStartDate:
        //                        {
        //                            cellToUpdateInProjectMetaSheet.Add(new Cell
        //                            {
        //                                ColumnId = Convert.ToInt64(item.Id),
        //                                Value = Convert.ToDateTime(pProjectIntake.CDSProject.StartDate).Date
        //                            });
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.PlannedEndDate:
        //                        {
        //                            cellToUpdateInProjectMetaSheet.Add(new Cell
        //                            {
        //                                ColumnId = Convert.ToInt64(item.Id),
        //                                Value = Convert.ToDateTime(pProjectIntake.CDSProject.EndDate).Date
        //                            });
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.Qty:
        //                        {
        //                            if (!string.IsNullOrEmpty(pProjectIntake.CDSProject.Qty))
        //                            {
        //                                cellToUpdateInProjectMetaSheet.Add(new Cell
        //                                {
        //                                    ColumnId = Convert.ToInt64(item.Id),
        //                                    Value = pProjectIntake.CDSProject.Qty
        //                                });
        //                            }
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.Units:
        //                        {
        //                            if (!string.IsNullOrEmpty(pProjectIntake.CDSProject.Units))
        //                            {
        //                                cellToUpdateInProjectMetaSheet.Add(new Cell
        //                                {
        //                                    ColumnId = Convert.ToInt64(item.Id),
        //                                    Value = pProjectIntake.CDSProject.Units
        //                                });
        //                            }
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.Deliverable:
        //                        {
        //                            cellToUpdateInProjectMetaSheet.Add(new Cell
        //                            {
        //                                ColumnId = Convert.ToInt64(item.Id),
        //                                Value = pProjectIntake.CDSProject.Deliverable
        //                            });
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.ProjectType:
        //                        {
        //                            cellToUpdateInProjectMetaSheet.Add(new Cell
        //                            {
        //                                ColumnId = Convert.ToInt64(item.Id),
        //                                Value = pProjectIntake.CDSProject.ProjectType
        //                            });
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.GMPNonGMP:
        //                        {
        //                            cellToUpdateInProjectMetaSheet.Add(new Cell
        //                            {
        //                                ColumnId = Convert.ToInt64(item.Id),
        //                                Value = pProjectIntake.CDSProject.GMPOrNonGMP
        //                            });
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.Molecules:
        //                        {
        //                            cellToUpdateInProjectMetaSheet.Add(new Cell
        //                            {
        //                                ColumnId = Convert.ToInt64(item.Id),
        //                                Value = pProjectIntake.CDSProject.Molecules
        //                            });
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.Phase:
        //                        {
        //                            if (!string.IsNullOrEmpty(pProjectIntake.CDSProject.Phase))
        //                            {
        //                                cellToUpdateInProjectMetaSheet.Add(new Cell
        //                                {
        //                                    ColumnId = Convert.ToInt64(item.Id),
        //                                    Value = pProjectIntake.CDSProject.Phase
        //                                });
        //                            }
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.Region:
        //                        {
        //                            cellToUpdateInProjectMetaSheet.Add(new Cell
        //                            {
        //                                ColumnId = Convert.ToInt64(item.Id),
        //                                Value = pProjectIntake.CDSProject.Region
        //                            });
        //                            break;
        //                        }
        //                    case CDSProjectMetaData.ProjectValue:
        //                        {
        //                            cellToUpdateInProjectMetaSheet.Add(new Cell
        //                            {
        //                                ColumnId = Convert.ToInt64(item.Id),
        //                                Value = Convert.ToDouble(pProjectIntake.CDSProject.ProjectValue)
        //                            });
        //                            break;
        //                        }
        //                    default:
        //                        break;
        //                }
        //            }

        //            // Identify row and add new cell values to it
        //            var rowToUpdateMeta = new Row
        //            {
        //                Id = ProjectMetaDataRowID,
        //                Cells = cellToUpdateInProjectMetaSheet
        //            };
        //            IList<Row> updatedRowMeta = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(ProjMetaDataSheetID, new Row[] { rowToUpdateMeta });

        //            //Project Plan Sheet
        //            Int64 ProjPlanColIDTask = 0;
        //            Int64 ProjPlanColIDProjectHealth = 0;
        //            Int64 ProjPlanColIDActStartDate = 0;
        //            Int64 ProjPlanColIDActEndDate = 0;
        //            Int64 ProjPlanColIDPctComplete = 0;
        //            Int64 ProjectPlanRowID = 0;
        //            PaginatedResult<Column> ProjPlanColumns = SmartsheetAppIntegration.AccessClient().SheetResources.ColumnResources.ListColumns(ProjPlanSheetID, null, null, 2);

        //            foreach (var item in ProjPlanColumns.Data)
        //            {
        //                switch (item.Title)
        //                {
        //                    case CDSProjectPlan.Task:
        //                        {
        //                            ProjPlanColIDTask = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectPlan.Health:
        //                        {
        //                            ProjPlanColIDProjectHealth = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectPlan.ActualStartDate:
        //                        {
        //                            ProjPlanColIDActStartDate = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectPlan.ActualEndDate:
        //                        {
        //                            ProjPlanColIDActEndDate = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    case CDSProjectPlan.PercentComplete:
        //                        {
        //                            ProjPlanColIDPctComplete = Convert.ToInt64(item.Id);
        //                            break;
        //                        }
        //                    default:
        //                        break;
        //                }
        //            }

        //            ProjectPlanRowID = Convert.ToInt64(sheetProjectPlan.Rows.First().Id);

        //            var cellToUpdateInProjectPlanSheet = new Cell
        //            {
        //                ColumnId = ProjPlanColIDTask,
        //                Value = pProjectIntake.CDSProject.ProjectCode
        //            };

        //            // Identify row and add new cell values to it
        //            var rowToUpdatePlan = new Row
        //            {
        //                Id = ProjectPlanRowID,
        //                Cells = new Cell[] { cellToUpdateInProjectPlanSheet }
        //            };
        //            IList<Row> updatedRowPlan = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(ProjPlanSheetID, new Row[] { rowToUpdatePlan });

        //            CrossSheetReference xref = new();
        //            CrossSheetReference result;

        //            //Creating Cross References from Intake Sheet to Project Meta
        //            //Project Code
        //            xref = new CrossSheetReference
        //            {
        //                Name = "Project Intake " + pProjectIntake.CDSProject.ProjectCode + " ProjCode",
        //                SourceSheetId = CDSProjectIntakeSheet,
        //                StartColumnId = ProjIntakeColIDProjectCode,
        //                EndColumnId = ProjIntakeColIDProjectCode
        //            };
        //            result = SmartsheetAppIntegration.AccessClient().SheetResources.CrossSheetReferenceResources.CreateCrossSheetReference(ProjMetaDataSheetID, xref);

        //            //Creating Cross References from Project Meta to Intake Sheet
        //            //Project Code
        //            string ProjMetaDataProjCodeCrossRef = "Project Meta " + pProjectIntake.CDSProject.ProjectCode + " ProjCode";
        //            xref = new CrossSheetReference
        //            {
        //                Name = ProjMetaDataProjCodeCrossRef,
        //                SourceSheetId = ProjMetaDataSheetID,
        //                StartColumnId = ProjMetaDataColumns.Data.Where(x => x.Title == "Project Code").Select(x => x.Id).FirstOrDefault()
        //            };
        //            ;
        //            xref.EndColumnId = xref.StartColumnId;
        //            result = SmartsheetAppIntegration.AccessClient().SheetResources.CrossSheetReferenceResources.CreateCrossSheetReference(CDSProjectIntakeSheet, xref);

        //            Cell[] cellsLinksToUpdate = new Cell[]
        //            {
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.Scientist],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDScientists, RowId = ProjectMetaDataRowID}
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.ProjectManager],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDProjectManager, RowId = ProjectMetaDataRowID}
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.ProjectHealth],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDProjectHealth, RowId = ProjectMetaDataRowID}
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.ActualStartDate],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDActStartDate, RowId = ProjectMetaDataRowID}
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.ActualEndDate],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDActEndDate, RowId = ProjectMetaDataRowID}
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.PercentComplete],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDPctComplete, RowId = ProjectMetaDataRowID}
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.ProjectStatus],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDProjStatus, RowId = ProjectMetaDataRowID}
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.DelayReason],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDDelayReason, RowId = ProjectMetaDataRowID}
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.DashboardURL],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDDashboardLink, RowId = ProjectMetaDataRowID}
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.BudgetConsumed],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDBudgetConsumed, RowId = ProjectMetaDataRowID}
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.BudgetAvailable],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDBudgetAvailable, RowId = ProjectMetaDataRowID}
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.ManufacturingUnit],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDManufacturingUnit, RowId = ProjectMetaDataRowID}
        //            },
        //            new Cell
        //            {
        //                ColumnId = columnMap[CDSIntakeForm.PlantLab],
        //                LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDPlantLab, RowId = ProjectMetaDataRowID}
        //            }
        //            };

        //            row = new Row
        //            {
        //                Id = ProjIntakeSheetInsertedRow[0].Id,
        //                Cells = cellsLinksToUpdate
        //            };

        //            liRowsToUpdate.Clear();
        //            liRowsToUpdate.Add(row);
        //            SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(CDSProjectIntakeSheet, liRowsToUpdate);
        //            return strFolderLink;
        //        }
        //        else
        //        {
        //            return null;
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Log.Error(ex.Message);
        //        Log.Error(ex.StackTrace);
        //        return null;
        //    }
        //}

        /// <summary>
        /// Get list of clients from Smartsheet
        /// </summary>
        /// <returns>List of clients</returns>
        public List<MClient> GetClients()
        {
            Dictionary<string, long> ClientColumnMap = new();
            List<MClient> liClient = new();

            try
            {
                var ClientMasterSheet = long.Parse(configurationBuilder.Build().GetSection("ClientMasterSheet").Value);
                var ClientDataSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(ClientMasterSheet, null, null, null, null, null, null, null, null, null);

                foreach (var column in ClientDataSheet.Columns)
                {
                    ClientColumnMap.Add(column.Title, (long)column.Id);
                }

                MClient client;
                foreach (var row in ClientDataSheet.Rows)
                {
                    client = new MClient
                    {
                        ClientID = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Customer ID", ClientColumnMap).Value),
                        Country = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Country", ClientColumnMap).Value),
                        Name1 = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Name 1", ClientColumnMap).Value),
                        Name2 = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Name 2", ClientColumnMap).Value),
                        City = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "City", ClientColumnMap).Value),
                        PostalCode = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Postal Code", ClientColumnMap).Value),
                        Region = Convert.ToString(SmartsheetHelper.GetCellByColumnName(row, "Region", ClientColumnMap).Value)
                    };

                    liClient.Add(client);
                }

                return liClient.OrderBy(x => x.Name1).ToList();
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        /// <summary>
        /// Get current Financial in format of YYYY-YY based on current date
        /// </summary>
        /// <returns>Current Financial  Year</returns>
        private static string GetCurrentFinancialYear()
        {
            string CurYear = DateTime.Today.ToString("yy");
            string PreYear = (DateTime.Today.Year - 1).ToString().Substring(2, 2);
            string NexYear = (DateTime.Today.Year + 1).ToString().Substring(2, 2);

            string FinYear;
            if (DateTime.Today.Month > 3)
                FinYear = CurYear + "-" + NexYear;
            else
                FinYear = PreYear + "-" + CurYear;
            return FinYear.Trim();
        }

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit CDS and project category CCS
        /// </summary>
        /// <param name="projectIntake"></param>
        /// <returns></returns>
        public string CreateCDSCCSProject(MProjectIntake pProjectIntake, string submitter)
        {
            Dictionary<string, long> columnMap = new();
            Dictionary<string, long> columnMapProjMeta = new();
            List<Row> liRowsToUpdate = new();
            List<Row> liRowsToUpdatePlan = new();
            Row row;
            List<Row> liRowsToAdd = new();
            try
            {
                var CDSProjectIntakeSheet = long.Parse(configurationBuilder.Build().GetSection("CDSProjectIntakeSheet").Value);
                var DestinationFolderCDS = long.Parse(configurationBuilder.Build().GetSection("DestinationFolderCDS").Value);
                var CDSTempelate = long.Parse(configurationBuilder.Build().GetSection("CDSNewTempelate").Value);

                var ColumnsInSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(CDSProjectIntakeSheet, null, null, null, null, null, null, null, null, null).Columns;
                foreach (var column in ColumnsInSheet)
                {
                    columnMap.Add(column.Title, (long)column.Id);
                }

                Cell[] cellsToInsert = new Cell[]
                {
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.BusinessUnit],
                        Value = pProjectIntake.BusinessUnit
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProposalCode],
                        Value = pProjectIntake.CDSProject.CCS.ProposalCode
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectCode],
                        Value = pProjectIntake.CDSProject.CCS.ProjectCode
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Client],
                        Value = pProjectIntake.CDSProject.CCS.Client
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.PlannedStartDate],
                        Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.StartDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.CCS.StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.PlannedEndDate],
                        Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.EndDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.CCS.EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Qty],
                        Value = Convert.ToDouble(pProjectIntake.CDSProject.CCS.Qty)
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectCategory],
                        Value = string.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.ProjectCategory)? string.Empty : pProjectIntake.CDSProject.CCS.ProjectCategory
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Deliverable],
                        Value = pProjectIntake.CDSProject.CCS.Deliverable
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectType],
                        Value = pProjectIntake.CDSProject.CCS.ProjectType
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.GMPNonGMP],
                        Value = pProjectIntake.CDSProject.CCS.GMPOrNonGMP
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Molecules],
                        Value = pProjectIntake.CDSProject.CCS.Molecules
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Phase],
                        Value = string.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.Phase)? string.Empty : pProjectIntake.CDSProject.CCS.Phase
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Region],
                        Value = pProjectIntake.CDSProject.CCS.Region
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectValue],
                        Value = Convert.ToDouble(pProjectIntake.CDSProject.CCS.ProjectValue.Replace(",", ""))
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Submitter],
                        Value = submitter
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.BDName],
                        Value = pProjectIntake.CDSProject.CCS.BDName
                    }
                };

                row = new Row
                {
                    ToBottom = true,
                    Cells = cellsToInsert
                };

                liRowsToAdd.Add(row);
                var ProjIntakeSheetInsertedRow = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.AddRows(CDSProjectIntakeSheet, liRowsToAdd);

                if (ProjIntakeSheetInsertedRow.Count > 0)
                {
                    //Project Intake Sheet
                    Int64 ProjIntakeColIDProjectCode = columnMap[CDSIntakeForm.ProjectCode];
                    Int64 ProjIntakeColIDClient = columnMap[CDSIntakeForm.Client];

                    //Create Folder
                    Folder folder = new();
                    Int64 ProjMetaDataSheetID = 0;
                    Int64 ProjPlanSheetID = 0;
                    Sheet sheetProjectMetaData = new();
                    Sheet sheetProjectPlan = new();

                    // Specify destination older
                    string ClientName = pProjectIntake.CDSProject.CCS.Client;
                    if (ClientName.Length > 24)
                    {
                        ClientName = ClientName[..24];
                    }
                    ContainerDestination destination = new()
                    {
                        DestinationId = DestinationFolderCDS,
                        DestinationType = DestinationType.FOLDER,
                        NewName = pProjectIntake.CDSProject.CCS.ProjectCode + "_" + ClientName
                    };

                    //Copy Folder
                    folder = SmartsheetAppIntegration.AccessClient().FolderResources.CopyFolder(CDSTempelate, destination, new FolderCopyInclusion[] { FolderCopyInclusion.ATTACHMENTS, FolderCopyInclusion.CELL_LINKS, FolderCopyInclusion.DATA, FolderCopyInclusion.DISCUSSIONS, FolderCopyInclusion.FILTERS, FolderCopyInclusion.FORMS, FolderCopyInclusion.RULES, FolderCopyInclusion.RULE_RECIPIENTS, FolderCopyInclusion.SHARES }, null);

                    //Getting Folder object
                    Folder folderObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(
                      Convert.ToInt64(folder.Id),
                      null
                    );
                    //var FolderId = folderObj.Id.ToString() + '+' + folderObj.Name.ToString();
                    string strFolderLink = folderObj.Permalink;
                    string Name = folderObj.Name.ToString();
                    string FolderID = folderObj.Id.ToString() + '+' + Name.ToString() + '+' + folderObj.Permalink;

                    //ProjectPlan project = new ProjectPlan { URL= strFolderLink,
                    //Name=Name,FolderId=FolderID};
                    //Get Project Matedata and Project Plan sheet
                    foreach (var item in folderObj.Sheets)
                    {
                        if (item.Name == "Project Metadata")
                        {
                            sheetProjectMetaData = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(item.Id), null, null, null, null, null, null, null);
                            ProjMetaDataSheetID = Convert.ToInt64(item.Id);
                        }
                        else if (item.Name == "Project Plan")
                        {
                            sheetProjectPlan = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(item.Id), null, null, null, null, null, null, null);
                            ProjPlanSheetID = Convert.ToInt64(item.Id);
                        }
                    }

                    //Project MetaData Sheet
                    Int64 ProjMetaDataColIDProjectHealth = 0;
                    Int64 ProjMetaDataColIDScientists = 0;
                    Int64 ProjMetaDataColIDProjectManager = 0;
                    Int64 ProjMetaDataColIDActStartDate = 0;
                    Int64 ProjMetaDataColIDActEndDate = 0;
                    Int64 ProjMetaDataColIDPctComplete = 0;
                    Int64 ProjMetaDataColIDProjStatus = 0;
                    Int64 ProjMetaDataColIDDelayReason = 0;
                    Int64 ProjMetaDataColIDDashboardLink = 0;
                    Int64 ProjMetaDataColIDBudgetConsumed = 0;
                    Int64 ProjMetaDataColIDBudgetAvailable = 0;
                    Int64 ProjMetaDataColIDManufacturingUnit = 0;
                    Int64 ProjMetaDataColIDPlantLab = 0;

                    PaginatedResult<Column> ProjMetaDataColumns = SmartsheetAppIntegration.AccessClient().SheetResources.ColumnResources.ListColumns(ProjMetaDataSheetID, null, null, 2);

                    foreach (var column in ProjMetaDataColumns.Data)
                    {
                        columnMapProjMeta.Add(column.Title, (long)column.Id);
                    }
                    Int64 ProjectMetaDataRowID = Convert.ToInt64(sheetProjectMetaData.Rows[0].Id);

                    List<Cell> cellToUpdateInProjectMetaSheet = new();
                    foreach (var item in ProjMetaDataColumns.Data)
                    {
                        switch (item.Title)
                        {
                            case CDSProjectMetaData.PlantLab:
                                {
                                    ProjMetaDataColIDPlantLab = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.ManufacturingUnit:
                                {
                                    ProjMetaDataColIDManufacturingUnit = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.BudgetAvailable:
                                {
                                    ProjMetaDataColIDBudgetAvailable = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.BudgetConsumed:
                                {
                                    ProjMetaDataColIDBudgetConsumed = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.DashboardURL:
                                {
                                    ProjMetaDataColIDDashboardLink = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.DelayReason:
                                {
                                    ProjMetaDataColIDDelayReason = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.PercentComplete:
                                {
                                    ProjMetaDataColIDPctComplete = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.ProjectStatus:
                                {
                                    ProjMetaDataColIDProjStatus = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.ProjectHealth:
                                {
                                    ProjMetaDataColIDProjectHealth = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.Scientist:
                                {
                                    ProjMetaDataColIDScientists = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.ProjectManager:
                                {
                                    ProjMetaDataColIDProjectManager = Convert.ToInt64(item.Id);
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.CCS.ProjectManager
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.ActualStartDate:
                                {
                                    ProjMetaDataColIDActStartDate = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.ActualEndDate:
                                {
                                    ProjMetaDataColIDActEndDate = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.ProjectCode:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.CCS.ProjectCode
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.ProposalCode:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.CCS.ProposalCode
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.ProjectName:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.CCS.ProjectName
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.Customer:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.CCS.Client
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.PlannedStartDate:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.StartDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.CCS.StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.PlannedEndDate:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.EndDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.CCS.EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.Qty:
                                {
                                    if (!string.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.Qty))
                                    {
                                        cellToUpdateInProjectMetaSheet.Add(new Cell
                                        {
                                            ColumnId = Convert.ToInt64(item.Id),
                                            Value = Convert.ToDouble(pProjectIntake.CDSProject.CCS.Qty)
                                        });
                                    }
                                    break;
                                }
                            //case CDSProjectMetaData.Units:
                            //    {
                            //        if (!string.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.Units))
                            //        {
                            //            cellToUpdateInProjectMetaSheet.Add(new Cell
                            //            {
                            //                ColumnId = Convert.ToInt64(item.Id),
                            //                Value = pProjectIntake.CDSProject.CCS.Units
                            //            });
                            //        }
                            //        break;
                            //    }
                            case CDSProjectMetaData.Deliverable:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.CCS.Deliverable
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.ProjectType:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.CCS.ProjectType
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.GMPNonGMP:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.CCS.GMPOrNonGMP
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.Molecules:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.CCS.Molecules
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.Phase:
                                {
                                    if (!string.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.Phase))
                                    {
                                        cellToUpdateInProjectMetaSheet.Add(new Cell
                                        {
                                            ColumnId = Convert.ToInt64(item.Id),
                                            Value = pProjectIntake.CDSProject.CCS.Phase
                                        });
                                    }
                                    break;
                                }
                            case CDSProjectMetaData.Region:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.CCS.Region
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.ProjectValue:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = Convert.ToDouble(pProjectIntake.CDSProject.CCS.ProjectValue.Replace(",", ""))
                                    });
                                    break;
                                }
                            default:
                                break;
                        }
                    }

                    // Identify row and add new cell values to it
                    var rowToUpdateMeta = new Row
                    {
                        Id = ProjectMetaDataRowID,
                        Cells = cellToUpdateInProjectMetaSheet
                    };
                    IList<Row> updatedRowMeta = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(ProjMetaDataSheetID, new Row[] { rowToUpdateMeta });

                    //Project Plan Sheet
                    Int64 ProjPlanColIDTask = 0;
                    //Int64 ProjPlanColIDProjectHealth = 0;
                    Int64 ProjPlanColIDPlanStartDate = 0;
                    Int64 ProjPlanColIDPlanEndDate = 0;
                    Int64 ProjPlanColIDActStartDate = 0;
                    Int64 ProjPlanColIDActEndDate = 0;
                    //Int64 ProjPlanColIDPctComplete = 0;
                    Int64 ProjectPlanRowID = 0;
                    PaginatedResult<Column> ProjPlanColumns = SmartsheetAppIntegration.AccessClient().SheetResources.ColumnResources.ListColumns(ProjPlanSheetID, null, null, 2);

                    foreach (var item in ProjPlanColumns.Data)
                    {
                        switch (item.Title)
                        {
                            case CDSProjectPlan.Task:
                                {
                                    ProjPlanColIDTask = Convert.ToInt64(item.Id);
                                    break;
                                }
                            //case CDSProjectPlan.Health:
                            //    {
                            //        ProjPlanColIDProjectHealth = Convert.ToInt64(item.Id);
                            //        break;
                            //    }
                            case CDSProjectPlan.PlannedStartDate:
                                {
                                    ProjPlanColIDPlanStartDate = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectPlan.PlannedEndDate:
                                {
                                    ProjPlanColIDPlanEndDate = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectPlan.ActualStartDate:
                                {
                                    ProjPlanColIDActStartDate = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectPlan.ActualEndDate:
                                {
                                    ProjPlanColIDActEndDate = Convert.ToInt64(item.Id);
                                    break;
                                }
                            //case CDSProjectPlan.PercentComplete:
                            //    {
                            //        ProjPlanColIDPctComplete = Convert.ToInt64(item.Id);
                            //        break;
                            //    }
                            default:
                                break;
                        }
                    }

                    ProjectPlanRowID = Convert.ToInt64(sheetProjectPlan.Rows.First().Id);

                    List<Cell> cellToUpdateInProjectPlanSheet = new()
                    {
                        new Cell
                        {
                            ColumnId = ProjPlanColIDTask,
                            Value = pProjectIntake.CDSProject.CCS.ProjectCode
                        },
                        new Cell
                        {
                            ColumnId = ProjPlanColIDPlanStartDate,
                            Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.StartDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.CCS.StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        },
                        new Cell
                        {
                            ColumnId = ProjPlanColIDPlanEndDate,
                            Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.EndDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.CCS.EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        },
                        new Cell
                        {
                            ColumnId = ProjPlanColIDActStartDate,
                            Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.StartDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.CCS.StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        },
                        new Cell
                        {
                            ColumnId = ProjPlanColIDActEndDate,
                            Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.CCS.EndDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.CCS.EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        }
                    };

                    // Identify row and add new cell values to it
                    var rowToUpdatePlan = new Row
                    {
                        Id = ProjectPlanRowID,
                        Cells = cellToUpdateInProjectPlanSheet
                    };
                    IList<Row> updatedRowPlan = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(ProjPlanSheetID, new Row[] { rowToUpdatePlan });

                    CrossSheetReference xref = new();
                    CrossSheetReference result;

                    //Creating Cross References from Intake Sheet to Project Meta
                    //Project Code
                    xref = new CrossSheetReference
                    {
                        Name = "Project Intake " + pProjectIntake.CDSProject.CCS.ProjectCode + " ProjCode",
                        SourceSheetId = CDSProjectIntakeSheet,
                        StartColumnId = ProjIntakeColIDProjectCode,
                        EndColumnId = ProjIntakeColIDProjectCode
                    };
                    result = SmartsheetAppIntegration.AccessClient().SheetResources.CrossSheetReferenceResources.CreateCrossSheetReference(ProjMetaDataSheetID, xref);

                    //Creating Cross References from Project Meta to Intake Sheet
                    //Project Code
                    string ProjMetaDataProjCodeCrossRef = "Project Meta " + pProjectIntake.CDSProject.CCS.ProjectCode + " ProjCode";
                    xref = new CrossSheetReference
                    {
                        Name = ProjMetaDataProjCodeCrossRef,
                        SourceSheetId = ProjMetaDataSheetID,
                        StartColumnId = ProjMetaDataColumns.Data.Where(x => x.Title == "Project Code").Select(x => x.Id).FirstOrDefault()
                    };
                    var data = xref.StartColumnId;
                    xref.EndColumnId = xref.StartColumnId;
                    result = SmartsheetAppIntegration.AccessClient().SheetResources.CrossSheetReferenceResources.CreateCrossSheetReference(CDSProjectIntakeSheet, xref);

                    Cell[] cellsLinksToUpdate = new Cell[]
                    {
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Scientist],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDScientists, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectManager],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDProjectManager, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectHealth],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDProjectHealth, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ActualStartDate],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDActStartDate, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ActualEndDate],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDActEndDate, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.PercentComplete],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDPctComplete, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectStatus],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDProjStatus, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.DelayReason],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDDelayReason, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.DashboardURL],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDDashboardLink, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.BudgetConsumed],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDBudgetConsumed, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.BudgetAvailable],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDBudgetAvailable, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ManufacturingUnit],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDManufacturingUnit, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.PlantLab],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDPlantLab, RowId = ProjectMetaDataRowID}
                    }
                    };

                    row = new Row
                    {
                        Id = ProjIntakeSheetInsertedRow[0].Id,
                        Cells = cellsLinksToUpdate
                    };
                    liRowsToUpdate.Clear();
                    liRowsToUpdate.Add(row);
                    SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(CDSProjectIntakeSheet, liRowsToUpdate);
                    return FolderID;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit CDS and project category FC
        /// </summary>
        /// <param name="projectIntake"></param>
        /// <returns></returns>
        public string CreateCDSFCProject(MProjectIntake pProjectIntake, string submitter)
        {
            Dictionary<string, long> columnMap = new();
            Dictionary<string, long> columnMapProjMeta = new();
            List<Row> liRowsToUpdate = new();
            List<Row> liRowsToUpdatePlan = new();
            Row row;
            List<Row> liRowsToAdd = new();
            try
            {
                var CDSProjectIntakeSheet = long.Parse(configurationBuilder.Build().GetSection("CDSProjectIntakeSheet").Value);
                var DestinationFolderCDS = long.Parse(configurationBuilder.Build().GetSection("DestinationFolderCDS").Value);
                var CDSTempelate = long.Parse(configurationBuilder.Build().GetSection("CDSNewTempelate").Value);

                var ColumnsInSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(CDSProjectIntakeSheet, null, null, null, null, null, null, null, null, null).Columns;
                foreach (var column in ColumnsInSheet)
                {
                    columnMap.Add(column.Title, (long)column.Id);
                }

                Cell[] cellsToInsert = new Cell[]
                {
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.BusinessUnit],
                        Value = pProjectIntake.BusinessUnit
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProposalCode],
                        Value = pProjectIntake.CDSProject.FC.ProposalCode
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectCode],
                        Value = pProjectIntake.CDSProject.FC.ProjectCode
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Client],
                        Value = pProjectIntake.CDSProject.FC.Client
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.PlannedStartDate],
                        Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.FC.StartDate.Trim()) ? string.Empty :  DateTime.ParseExact(pProjectIntake.CDSProject.FC.StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.PlannedEndDate],
                        Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.FC.EndDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.FC.EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Qty],
                        Value = Convert.ToDouble(pProjectIntake.CDSProject.FC.Qty)
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectCategory],
                        Value = string.IsNullOrEmpty(pProjectIntake.CDSProject.FC.ProjectCategory)? string.Empty : pProjectIntake.CDSProject.FC.ProjectCategory
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Deliverable],
                        Value = pProjectIntake.CDSProject.FC.Deliverable
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectType],
                        Value = pProjectIntake.CDSProject.FC.ProjectType
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.GMPNonGMP],
                        Value = pProjectIntake.CDSProject.FC.GMPOrNonGMP
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Molecules],
                        Value = pProjectIntake.CDSProject.FC.Molecules
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Phase],
                        Value = string.IsNullOrEmpty(pProjectIntake.CDSProject.FC.Phase)? string.Empty : pProjectIntake.CDSProject.FC.Phase
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Region],
                        Value = pProjectIntake.CDSProject.FC.Region
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectValue],
                        Value = Convert.ToDouble(pProjectIntake.CDSProject.FC.ProjectValue.Replace(",", ""))
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Submitter],
                        Value = submitter
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.BDName],
                        Value = pProjectIntake.CDSProject.FC.BDName
                    }
                };

                row = new Row
                {
                    ToBottom = true,
                    Cells = cellsToInsert
                };

                liRowsToAdd.Add(row);
                var ProjIntakeSheetInsertedRow = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.AddRows(CDSProjectIntakeSheet, liRowsToAdd);

                if (ProjIntakeSheetInsertedRow.Count > 0)
                {
                    //Project Intake Sheet
                    Int64 ProjIntakeColIDProjectCode = columnMap[CDSIntakeForm.ProjectCode];
                    Int64 ProjIntakeColIDClient = columnMap[CDSIntakeForm.Client];

                    //Create Folder
                    Folder folder = new();
                    Int64 ProjMetaDataSheetID = 0;
                    Int64 ProjPlanSheetID = 0;
                    Sheet sheetProjectMetaData = new();
                    Sheet sheetProjectPlan = new();

                    // Specify destination older
                    string ClientName = pProjectIntake.CDSProject.FC.Client;
                    if (ClientName.Length > 24)
                    {
                        ClientName = ClientName[..24];
                    }
                    ContainerDestination destination = new()
                    {
                        DestinationId = DestinationFolderCDS,
                        DestinationType = DestinationType.FOLDER,
                        NewName = pProjectIntake.CDSProject.FC.ProjectCode + "_" + ClientName
                    };

                    //Copy Folder
                    folder = SmartsheetAppIntegration.AccessClient().FolderResources.CopyFolder(CDSTempelate, destination, new FolderCopyInclusion[] { FolderCopyInclusion.ATTACHMENTS, FolderCopyInclusion.CELL_LINKS, FolderCopyInclusion.DATA, FolderCopyInclusion.DISCUSSIONS, FolderCopyInclusion.FILTERS, FolderCopyInclusion.FORMS, FolderCopyInclusion.RULES, FolderCopyInclusion.RULE_RECIPIENTS, FolderCopyInclusion.SHARES }, null);

                    //Getting Folder object
                    Folder folderObj = SmartsheetAppIntegration.AccessClient().FolderResources.GetFolder(
                      Convert.ToInt64(folder.Id),
                      null
                    );
                    var FolderId = folderObj.Id.ToString() + '+' + folderObj.Name.ToString();
                    string strFolderLink = folderObj.Id.ToString();

                    //Get Project Matedata and Project Plan sheet
                    foreach (var item in folderObj.Sheets)
                    {
                        if (item.Name == "Project Metadata")
                        {
                            sheetProjectMetaData = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(item.Id), null, null, null, null, null, null, null);
                            ProjMetaDataSheetID = Convert.ToInt64(item.Id);
                        }
                        else if (item.Name == "Project Plan")
                        {
                            sheetProjectPlan = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(Convert.ToInt64(item.Id), null, null, null, null, null, null, null);
                            ProjPlanSheetID = Convert.ToInt64(item.Id);
                        }
                    }

                    //Project MetaData Sheet
                    Int64 ProjMetaDataColIDProjectHealth = 0;
                    Int64 ProjMetaDataColIDScientists = 0;
                    Int64 ProjMetaDataColIDProjectManager = 0;
                    Int64 ProjMetaDataColIDActStartDate = 0;
                    Int64 ProjMetaDataColIDActEndDate = 0;
                    Int64 ProjMetaDataColIDPctComplete = 0;
                    Int64 ProjMetaDataColIDProjStatus = 0;
                    Int64 ProjMetaDataColIDDelayReason = 0;
                    Int64 ProjMetaDataColIDDashboardLink = 0;
                    Int64 ProjMetaDataColIDBudgetConsumed = 0;
                    Int64 ProjMetaDataColIDBudgetAvailable = 0;
                    Int64 ProjMetaDataColIDManufacturingUnit = 0;
                    Int64 ProjMetaDataColIDPlantLab = 0;

                    PaginatedResult<Column> ProjMetaDataColumns = SmartsheetAppIntegration.AccessClient().SheetResources.ColumnResources.ListColumns(ProjMetaDataSheetID, null, null, 2);

                    foreach (var column in ProjMetaDataColumns.Data)
                    {
                        columnMapProjMeta.Add(column.Title, (long)column.Id);
                    }
                    Int64 ProjectMetaDataRowID = Convert.ToInt64(sheetProjectMetaData.Rows[0].Id);

                    List<Cell> cellToUpdateInProjectMetaSheet = new();
                    foreach (var item in ProjMetaDataColumns.Data)
                    {
                        switch (item.Title)
                        {
                            case CDSProjectMetaData.PlantLab:
                                {
                                    ProjMetaDataColIDPlantLab = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.ManufacturingUnit:
                                {
                                    ProjMetaDataColIDManufacturingUnit = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.BudgetAvailable:
                                {
                                    ProjMetaDataColIDBudgetAvailable = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.BudgetConsumed:
                                {
                                    ProjMetaDataColIDBudgetConsumed = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.DashboardURL:
                                {
                                    ProjMetaDataColIDDashboardLink = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.DelayReason:
                                {
                                    ProjMetaDataColIDDelayReason = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.PercentComplete:
                                {
                                    ProjMetaDataColIDPctComplete = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.ProjectStatus:
                                {
                                    ProjMetaDataColIDProjStatus = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.ProjectHealth:
                                {
                                    ProjMetaDataColIDProjectHealth = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.Scientist:
                                {
                                    ProjMetaDataColIDScientists = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.ProjectManager:
                                {
                                    ProjMetaDataColIDProjectManager = Convert.ToInt64(item.Id);
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.FC.ProjectManager
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.ActualStartDate:
                                {
                                    ProjMetaDataColIDActStartDate = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.ActualEndDate:
                                {
                                    ProjMetaDataColIDActEndDate = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectMetaData.ProjectCode:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.FC.ProjectCode
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.ProposalCode:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.FC.ProposalCode
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.ProjectName:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.FC.ProjectName
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.Customer:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.FC.Client
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.PlannedStartDate:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.FC.StartDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.FC.StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.PlannedEndDate:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.FC.EndDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.FC.EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.Qty:
                                {
                                    if (!string.IsNullOrEmpty(pProjectIntake.CDSProject.FC.Qty))
                                    {
                                        cellToUpdateInProjectMetaSheet.Add(new Cell
                                        {
                                            ColumnId = Convert.ToInt64(item.Id),
                                            Value = Convert.ToDouble(pProjectIntake.CDSProject.FC.Qty)
                                        });
                                    }
                                    break;
                                }
                            //case CDSProjectMetaData.Units:
                            //    {
                            //        if (!string.IsNullOrEmpty(pProjectIntake.CDSProject.FC.Units))
                            //        {
                            //            cellToUpdateInProjectMetaSheet.Add(new Cell
                            //            {
                            //                ColumnId = Convert.ToInt64(item.Id),
                            //                Value = pProjectIntake.CDSProject.FC.Units
                            //            });
                            //        }
                            //        break;
                            //    }
                            case CDSProjectMetaData.Deliverable:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.FC.Deliverable
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.ProjectType:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.FC.ProjectType
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.GMPNonGMP:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.FC.GMPOrNonGMP
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.Molecules:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.FC.Molecules
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.Phase:
                                {
                                    if (!string.IsNullOrEmpty(pProjectIntake.CDSProject.FC.Phase))
                                    {
                                        cellToUpdateInProjectMetaSheet.Add(new Cell
                                        {
                                            ColumnId = Convert.ToInt64(item.Id),
                                            Value = pProjectIntake.CDSProject.FC.Phase
                                        });
                                    }
                                    break;
                                }
                            case CDSProjectMetaData.Region:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = pProjectIntake.CDSProject.FC.Region
                                    });
                                    break;
                                }
                            case CDSProjectMetaData.ProjectValue:
                                {
                                    cellToUpdateInProjectMetaSheet.Add(new Cell
                                    {
                                        ColumnId = Convert.ToInt64(item.Id),
                                        Value = Convert.ToDouble(pProjectIntake.CDSProject.FC.ProjectValue.Replace(",", ""))
                                    });
                                    break;
                                }
                            default:
                                break;
                        }
                    }

                    // Identify row and add new cell values to it
                    var rowToUpdateMeta = new Row
                    {
                        Id = ProjectMetaDataRowID,
                        Cells = cellToUpdateInProjectMetaSheet
                    };
                    IList<Row> updatedRowMeta = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(ProjMetaDataSheetID, new Row[] { rowToUpdateMeta });

                    //Project Plan Sheet
                    Int64 ProjPlanColIDTask = 0;
                    //Int64 ProjPlanColIDProjectHealth = 0;
                    Int64 ProjPlanColIDPlanStartDate = 0;
                    Int64 ProjPlanColIDPlanEndDate = 0;
                    Int64 ProjPlanColIDActStartDate = 0;
                    Int64 ProjPlanColIDActEndDate = 0;
                    //Int64 ProjPlanColIDPctComplete = 0;
                    Int64 ProjectPlanRowID = 0;
                    PaginatedResult<Column> ProjPlanColumns = SmartsheetAppIntegration.AccessClient().SheetResources.ColumnResources.ListColumns(ProjPlanSheetID, null, null, 2);

                    foreach (var item in ProjPlanColumns.Data)
                    {
                        switch (item.Title)
                        {
                            case CDSProjectPlan.Task:
                                {
                                    ProjPlanColIDTask = Convert.ToInt64(item.Id);
                                    break;
                                }
                            //case CDSProjectPlan.Health:
                            //    {
                            //        ProjPlanColIDProjectHealth = Convert.ToInt64(item.Id);
                            //        break;
                            //    }
                            case CDSProjectPlan.PlannedStartDate:
                                {
                                    ProjPlanColIDPlanStartDate = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectPlan.PlannedEndDate:
                                {
                                    ProjPlanColIDPlanEndDate = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectPlan.ActualStartDate:
                                {
                                    ProjPlanColIDActStartDate = Convert.ToInt64(item.Id);
                                    break;
                                }
                            case CDSProjectPlan.ActualEndDate:
                                {
                                    ProjPlanColIDActEndDate = Convert.ToInt64(item.Id);
                                    break;
                                }
                            //case CDSProjectPlan.PercentComplete:
                            //    {
                            //        ProjPlanColIDPctComplete = Convert.ToInt64(item.Id);
                            //        break;
                            //    }
                            default:
                                break;
                        }
                    }

                    ProjectPlanRowID = Convert.ToInt64(sheetProjectPlan.Rows.First().Id);

                    List<Cell> cellToUpdateInProjectPlanSheet = new()
                    {
                        new Cell
                        {
                            ColumnId = ProjPlanColIDTask,
                            Value = pProjectIntake.CDSProject.FC.ProjectCode
                        },
                        new Cell
                        {
                            ColumnId = ProjPlanColIDPlanStartDate,
                            Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.FC.StartDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.FC.StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        },
                        new Cell
                        {
                            ColumnId = ProjPlanColIDPlanEndDate,
                            Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.FC.EndDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.FC.EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        }
                    };

                    // Identify row and add new cell values to it
                    var rowToUpdatePlan = new Row
                    {
                        Id = ProjectPlanRowID,
                        Cells = cellToUpdateInProjectPlanSheet
                    };
                    IList<Row> updatedRowPlan = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(ProjPlanSheetID, new Row[] { rowToUpdatePlan });

                    CrossSheetReference xref = new();
                    CrossSheetReference result;

                    //Creating Cross References from Intake Sheet to Project Meta
                    //Project Code
                    xref = new CrossSheetReference
                    {
                        Name = "Project Intake " + pProjectIntake.CDSProject.FC.ProjectCode + " ProjCode",
                        SourceSheetId = CDSProjectIntakeSheet,
                        StartColumnId = ProjIntakeColIDProjectCode,
                        EndColumnId = ProjIntakeColIDProjectCode
                    };
                    result = SmartsheetAppIntegration.AccessClient().SheetResources.CrossSheetReferenceResources.CreateCrossSheetReference(ProjMetaDataSheetID, xref);

                    //Creating Cross References from Project Meta to Intake Sheet
                    //Project Code
                    string ProjMetaDataProjCodeCrossRef = "Project Meta " + pProjectIntake.CDSProject.FC.ProjectCode + " ProjCode";
                    xref = new CrossSheetReference
                    {
                        Name = ProjMetaDataProjCodeCrossRef,
                        SourceSheetId = ProjMetaDataSheetID,
                        StartColumnId = ProjMetaDataColumns.Data.Where(x => x.Title == "Project Code").Select(x => x.Id).FirstOrDefault()
                    };
                    ;
                    xref.EndColumnId = xref.StartColumnId;
                    result = SmartsheetAppIntegration.AccessClient().SheetResources.CrossSheetReferenceResources.CreateCrossSheetReference(CDSProjectIntakeSheet, xref);

                    Cell[] cellsLinksToUpdate = new Cell[]
                    {
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.Scientist],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDScientists, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectManager],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDProjectManager, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectHealth],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDProjectHealth, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ActualStartDate],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDActStartDate, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ActualEndDate],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDActEndDate, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.PercentComplete],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDPctComplete, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ProjectStatus],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDProjStatus, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.DelayReason],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDDelayReason, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.DashboardURL],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDDashboardLink, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.BudgetConsumed],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDBudgetConsumed, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.BudgetAvailable],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDBudgetAvailable, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.ManufacturingUnit],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDManufacturingUnit, RowId = ProjectMetaDataRowID}
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSIntakeForm.PlantLab],
                        LinkInFromCell = new CellLink{SheetId = ProjMetaDataSheetID, ColumnId = ProjMetaDataColIDPlantLab, RowId = ProjectMetaDataRowID}
                    }
                    };

                    row = new Row
                    {
                        Id = ProjIntakeSheetInsertedRow[0].Id,
                        Cells = cellsLinksToUpdate
                    };

                    liRowsToUpdate.Clear();
                    liRowsToUpdate.Add(row);
                    SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.UpdateRows(CDSProjectIntakeSheet, liRowsToUpdate);
                    return FolderId;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
                Log.Error(ex.StackTrace);
                return null;
            }
        }

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit CDS and project category PRD
        /// </summary>
        /// <param name="projectIntake"></param>
        /// <returns></returns>
        public string CreateCDSPRDProject(MProjectIntake pProjectIntake, string submitter)
        {
            Dictionary<string, long> columnMap = new();
            //Dictionary<string, long> columnMapProjMeta = new();
            //List<Row> liRowsToUpdate = new();
            //List<Row> liRowsToUpdatePlan = new();
            Row row;
            List<Row> liRowsToAdd = new();
            try
            {
                var CDSPRDProjectIntakeSheet = long.Parse(configurationBuilder.Build().GetSection("CDSPRDProjectIntakeSheet").Value);
                //var DestinationFolderCDS = long.Parse(configurationBuilder.Build().GetSection("DestinationFolderCDS").Value);
                //var CDSTempelate = long.Parse(configurationBuilder.Build().GetSection("CDSTempelate").Value);

                var ColumnsInSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(CDSPRDProjectIntakeSheet, null, null, null, null, null, null, null, null, null).Columns;
                foreach (var column in ColumnsInSheet)
                {
                    columnMap.Add(column.Title, (long)column.Id);
                }

                Cell[] cellsToInsert = new Cell[]
                {
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.BusinessUnit],
                        Value = pProjectIntake.BusinessUnit
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.ProjectCode],
                        Value = pProjectIntake.CDSProject.PRD.ProjectCode
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.ProposalCode],
                        Value = pProjectIntake.CDSProject.PRD.ProposalCode
                    },
                    //new Cell
                    //{
                    //    ColumnId = columnMap[CDSPRDIntakeForm.ProjectName],
                    //    Value = pProjectIntake.CDSProject.PRD.ProjectName
                    //},
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.Client],
                        Value = pProjectIntake.CDSProject.PRD.Client
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.PlannedStartDate],
                        Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.PRD.PlannedStartDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.PRD.PlannedStartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.PlannedEndDate],
                        Value = String.IsNullOrEmpty(pProjectIntake.CDSProject.PRD.PlannedEndDate.Trim()) ? string.Empty : DateTime.ParseExact(pProjectIntake.CDSProject.PRD.PlannedEndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                    },

                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.Type],
                        Value = pProjectIntake.CDSProject.PRD.ProjectType
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.Region],
                        Value = pProjectIntake.CDSProject.PRD.Region
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.ProjectValue],
                        Value = Convert.ToDouble(pProjectIntake.CDSProject.PRD.ProjectValue.Replace(",", ""))
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.Scientist],
                        Value = pProjectIntake.CDSProject.PRD.Scientist
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.ProjectManager],
                        Value = pProjectIntake.CDSProject.PRD.ProjectManager
                    },
                    //new Cell
                    //{
                    //    ColumnId = columnMap[CDSPRDIntakeForm.NoOfFTEs],
                    //    Value = pProjectIntake.CDSProject.PRD.NoOfFTE
                    //},
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.PONumber],
                        Value = pProjectIntake.CDSProject.PRD.PONumber
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.SONumber],
                        Value = pProjectIntake.CDSProject.PRD.SONumber
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.Submitter],
                        Value = submitter
                    },
                    new Cell
                    {
                        ColumnId = columnMap[CDSPRDIntakeForm.BDName],
                        Value = pProjectIntake.CDSProject.PRD.BDName
                    }
                };

                row = new Row
                {
                    ToBottom = true,
                    Cells = cellsToInsert
                };

                liRowsToAdd.Add(row);
                var ProjIntakeSheetInsertedRow = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.AddRows(CDSPRDProjectIntakeSheet, liRowsToAdd);

                if (ProjIntakeSheetInsertedRow.Count > 0)
                {
                    return "https://app.smartsheet.com/sheets/phwGW7rccmWh344WcgR439xjrr8FVvHq6jvJHpc1";
                }
                else
                {
                    return null;
                }
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
