using AragenSmartsheet.Entities.Client;
using AragenSmartsheet.Entities.Home;
using System.Collections.Generic;

namespace AragenSmartsheet.Data.IRepository
{
    public interface IHomeRepository
    {
        /// <summary>
        /// Get list of clients from Smartsheet
        /// </summary>
        /// <returns>List of clients</returns>
        List<MClient> GetClients();

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit CDS
        /// </summary>
        /// <param name="pProjectIntake"></param>
        /// <returns>Smartsheet folder path of new project</returns>
        //string CreateCDSProject(MProjectIntake projectIntake);

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit Biology and project type Single PO
        /// </summary>
        /// <param name="projectIntake"></param>
        /// <returns>Smartsheet sheet path of new project</returns>
        string CreateBiologySPOProject(MProjectIntake projectIntake, string submitter);

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit Biology and project type Open PO
        /// </summary>
        /// <param name="projectIntake"></param>
        /// <returns>Smartsheet folder path of new project</returns>
        string CreateBiologyOPOProject(MProjectIntake projectIntake, string submitter);

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit Biology and project type FTE
        /// </summary>
        /// <param name="projectIntake"></param>
        /// <returns>Smartsheet folder path of new project</returns>
        string CreateBiologyFTEProject(MProjectIntake projectIntake, string submitter);

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit CDS and project category CCS
        /// </summary>
        /// <param name="projectIntake"></param>
        /// <returns></returns>
        string CreateCDSCCSProject(MProjectIntake projectIntake, string submitter);

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit CDS and project category FC
        /// </summary>
        /// <param name="projectIntake"></param>
        /// <returns></returns>
        string CreateCDSFCProject(MProjectIntake projectIntake, string submitter);

        /// <summary>
        /// Creates new project in Smartsheet for Business Unit CDS and project category PRD
        /// </summary>
        /// <param name="projectIntake"></param>
        /// <returns></returns>
        string CreateCDSPRDProject(MProjectIntake projectIntake, string submitter);
    }
}
