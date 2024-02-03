using System;
using System.Collections.Generic;

namespace AragenSmartsheet.Entities.CDS
{
    public class MCDSFolder
    {
        public MCDSFolder()
        {
            FolderSheets = new List<MCDSFolderSheets>();
        }
        public Int64 FolderID { get; set; }
        public string FolderName { get; set; }
        public string FolderLink { get; set; }
        public List<MCDSFolderSheets> FolderSheets { get; set; }
    }

    public class MCDSFolderSheets
    {
        public Int64 SheetID { get; set; }
        public string SheetName { get; set; }
        public string SheetLink { get; set; }
    }

}
