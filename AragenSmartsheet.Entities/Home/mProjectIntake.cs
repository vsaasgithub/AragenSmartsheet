using AragenSmartsheet.Entities.Biology;
using AragenSmartsheet.Entities.CDS;

namespace AragenSmartsheet.Entities.Home
{
    public class MProjectIntake
    {
        public string BusinessUnit { get; set; }
        public MCDSProject CDSProject { get; set; }
        public MBiologyProject BiologyProject { get; set; }
        public string FileUpload { get; set; }
    }
}
