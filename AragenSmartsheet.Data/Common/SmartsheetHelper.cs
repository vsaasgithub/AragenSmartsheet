using Smartsheet.Api.Models;
using System.Collections.Generic;
using System.Linq;

namespace AragenSmartsheet.Data.Common
{
    public class SmartsheetHelper
    {
        public static Cell GetCellByColumnName(Row row, string columnName, Dictionary<string, long> columnMap)
        {
            return row.Cells.First(cell => cell.ColumnId == columnMap[columnName]);
        }
    }
}
