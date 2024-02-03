using AragenSmartsheet.Entities.CDS;
using System;
using System.Collections.Generic;

namespace AragenSmartsheet.Data.IRepository
{
    public interface ICDSRepository
    {
        /// <summary>
        /// Get list of CDS projects from Smartsheet and show in UI
        /// </summary>
        /// <returns>List of Projects(folders in smartsheet)</returns>
        public List<MCDSFolder> GetProjectsList();

        /// <summary>
        /// FolderID using ProjectPlanDataSheet Id get then particuluar datasheet all details recovered  
        /// </summary>
        /// //<param="FolderID">FolderID param use with Get the smarsheet Folder Access sheet id  </param>
        /// <returns>List of All tasks in Project Plan</returns>
        public List<MCDSTasks> GetProjectPlans(string FolderID);

        /// <summary>
        /// Get the Meta Data sheet and columns of the selected project
        /// </summary>
        /// <param name="FolderID"></param>
        /// <returns></returns>
        public List<MetaDataTask> ProjectMetatData(string FolderID);

        //string InsertData(List<TaskModel> datalist, string FolderID);

        /// <summary>
        /// Insert and update ganttchary functionalities
        /// </summary>
        /// <param name="datalist">ganttchart list of data get for datalist</param> 
        /// <param name="FolderID">we have get for the insert or update table folderId   </param> 
        /// <returns></returns>
        string GanttChartUpdate(List<MCDSTasks> datalist, string folderID);

        /// <summary>
        /// delete the selected row in smart sheet
        /// </summary>
        /// <param name="sheetIds">delete for the row id passed  </param> 
        /// <param name="FolderID">we have get for the insert or update table folderId   </param> 
        /// <returns></returns>
        string ProjectPlanDeleteRow(List<long> sheetIds, string FolderID);

        /// <summary>
        /// Returns list of resources working in particular project
        /// </summary>
        /// <param name="FolderID"></param>
        /// <returns></returns>
        Dictionary<string, string> GetProjectResources(string FolderID);

        //string InsertRow (Root Root);

        /// <summary>
        /// Get list of CDS projects from Smartsheet and show in UI
        /// </summary>
        /// <returns>List of Projects(folders in smartsheet)</returns>
        public List<MCDSFolder> GetProjectList();

        public List<MCDSTask> GetAllTasks(string ProjPlanSheetID);
        public void UpdateTask(List<MCDSTask> Tasks, string ProjPlanSheetID);
        public void DeleteTask(List<MCDSTask> Tasks, string ProjPlanSheetID);
        public void CreateTask(List<MCDSTask> Tasks, string ProjPlanSheetID);

        public List<MCDSDependency> GetGanttDependencies(string GanttDependenciesSheetID);
        public void UpdateGanttDependencies(List<MCDSDependency> Dependencies, string GanttDependenciesSheetID);
        public void DeleteGanttDependencies(List<MCDSDependency> Dependencies, string GanttDependenciesSheetID);
        public void CreateGanttDependencies(List<MCDSDependency> Dependencies, string GanttDependenciesSheetID);

        public List<MCDSResources> GetGanttResources(string ProjResourcesSheetID);

        public List<MCDSResourceAssignment> GetGanttResourceAssignments(string GanttResourceAssignmentsSheetID);
        public void UpdateGanttResourceAssignments(List<MCDSResourceAssignment> ResourceAssignments, string GanttResourceAssignmentsSheetID);
        public void DeleteGanttResourceAssignments(List<MCDSResourceAssignment> ResourceAssignments, string GanttResourceAssignmentsSheetID);
        public void CreateGanttResourceAssignments(List<MCDSResourceAssignment> ResourceAssignments, string GanttResourceAssignmentsSheetID);
    }
}
