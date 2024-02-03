using Serilog;
using System.Data.OleDb;
using System.Globalization;
using System.IO;
using Smartsheet.Api.Models;
using AragenSmartsheet.Integration.SmartsheetIntegration;
using Microsoft.Extensions.Configuration;
using AragenSmartsheet.Entities.Client;
using System.Data;

Log.Logger = new LoggerConfiguration()
.WriteTo.File("Logs\\log-.txt", rollingInterval: RollingInterval.Day)
.CreateLogger();

try
{
    ConfigurationBuilder configurationBuilder = new();

    Console.WriteLine("Reading Setings File");
    var path = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
    configurationBuilder.AddJsonFile(path, false);

    // Read the path to the Excel file.
    string excelFilePath = configurationBuilder.Build().GetSection("ExcelLocation").Value;

    // Define the connection string for reading Excel files.
    string connectionString = $"Provider=Microsoft.ACE.OLEDB.12.0;Data Source='" + excelFilePath + "'; Extended Properties='Excel 12.0 Xml;HDR=YES;'";
    Console.WriteLine("Excel File Path: " + excelFilePath);


    Dictionary<string, long> columnMap = new();
    List<Row> liRowsToAdd = new();
    Row row;



    // Define the SELECT statement to extract data from the specified columns.
    string selectStatement = "SELECT [Customer], [Country], [Name 1], [Name 2], [City], [Postal Code], [Region] FROM [Sheet1$]";

    // Create a new data table to store the data.
    DataTable dataTable = new();

    // Open the connection to the Excel file.
    using (OleDbConnection connection = new(connectionString))
    {
        // Create a new data adapter with the SELECT statement and the connection.
        using OleDbDataAdapter adapter = new(selectStatement, connection);
        // Fill the data table with the data.
        adapter.Fill(dataTable);
    }

    // Define the batch size.
    int batchSize = 500;
    int rowCount = 0;
    //int batchCount = 0;

    var CustomerMasterSheetID = long.Parse(configurationBuilder.Build().GetSection("CustomerMasterData").Value);

    var ColumnsInSheet = SmartsheetAppIntegration.AccessClient().SheetResources.GetSheet(CustomerMasterSheetID, null, null, null, null, null, null, null, null, null).Columns;
    foreach (var column in ColumnsInSheet)
    {
        long id = (long)column.Id;
        columnMap.Add(column.Title, id);
    }

    foreach (DataRow dataRow in dataTable.Rows)
    {
        // Read the data from the columns.
        string customerId = Convert.ToString(dataRow["Customer"]) ?? string.Empty;
        string country = Convert.ToString(dataRow["Country"]) ?? string.Empty;
        string name1 = Convert.ToString(dataRow["Name 1"]) ?? string.Empty;
        string name2 = Convert.ToString(dataRow["Name 2"]) ?? string.Empty;
        string city = Convert.ToString(dataRow["City"]) ?? string.Empty;
        string postalCode = Convert.ToString(dataRow["Postal Code"]) ?? string.Empty;
        string region = Convert.ToString(dataRow["Region"]) ?? string.Empty;

        // Write the data to Smartsheet.        
        Cell[] cellsToInsert = new Cell[]
        {
            new Cell
            {
                ColumnId = columnMap[CustomerMasterData.CustomerID],
                Value = customerId
            },
            new Cell
            {
                ColumnId = columnMap[CustomerMasterData.Country],
                Value = country
            },
            new Cell
            {
                ColumnId = columnMap[CustomerMasterData.Name1],
                Value = name1
            },
            new Cell
            {
                ColumnId = columnMap[CustomerMasterData.Name2],
                Value = name2
            },
            new Cell
            {
                ColumnId = columnMap[CustomerMasterData.City],
                Value = city
            },
            new Cell
            {
                ColumnId = columnMap[CustomerMasterData.PostalCode],
                Value = postalCode
            },
            new Cell
            {
                ColumnId = columnMap[CustomerMasterData.Region],
                Value = region
            },
        };
        row = new Row
        {
            ToBottom = true,
            Cells = cellsToInsert
        };
        Console.WriteLine("Adding record to list: " + rowCount);
        liRowsToAdd.Add(row);
        rowCount++;

        if (rowCount % batchSize == 0 || rowCount == dataTable.Rows.Count)
        {
            Console.WriteLine("Inserting records to smartsheet: " + rowCount);
            var SPOIntakeSheetInsertedRow = SmartsheetAppIntegration.AccessClient().SheetResources.RowResources.AddRows(CustomerMasterSheetID, liRowsToAdd);
            liRowsToAdd.Clear();
        }

    }
}

catch (Exception ex)
{
    Log.Error(ex.Message);
    Log.Error(ex.StackTrace);
}
