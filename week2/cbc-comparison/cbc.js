/**
 * Christmas Bird Count (CBC) Data Formatter
 * Requires: p5.js library
 * 
 * The Audubon CBC archive data is formatted for human viewing rather than 
 * computational analysis. This module parses the raw data into a structured
 * object for easier programmatic access.
 * 
 * Output structure:
 * {
 *   name: 'L.I.: Brooklyn',           // Count circle name
 *   code: 'NYBR',                      // Count circle code
 *   latLon: {lat: '40.616', lon: '-73.944'},
 *   weather: Table,                    // Weather conditions data
 *   effort: Table,                     // Count totals and participation
 *   orgs: Table,                       // Sponsoring organizations
 *   checklist: Table,                  // Bird observation data
 *   compilers: Table,                  // Compiler information
 *   participants: Table,               // Participant information
 *   birdMap: {},                       // Nested object: birdMap[commonName][year] = {howMany, numberByPartyHours}
 *   birdList: []                       // Array of all bird common names
 * }
 */

/**
 * Loads and processes CBC data from a URL
 * @param {string} _url - URL to the CBC data file
 * @param {function} _callback - Callback function that receives the processed data
 */
function loadCBCData(_url, _callback) {
  loadTable(_url, function (_data) {
    let countData = processCBCData(_data);
    _callback(countData);
    console.log("LOADED CBC DATA");
  });
}

/**
 * Processes raw CBC data table into structured format
 * @param {p5.Table} _data - Raw data table loaded from CBC file
 * @returns {Object} Structured count data object
 */
function processCBCData(_data) {
  // Extract basic count information from row 1
  // Format: "L.I.: Brooklyn,NYBR,40.6160370000/-73.9448350000"
  let details = _data.getRow(1);
  let latLonString = details.get(2);
  
  let count = {
    name: details.get(0),
    code: details.get(1),
    latLon: {
      lat: latLonString.split("/")[0],
      lon: latLonString.split("/")[1]  // Fixed: was using index [0] twice
    },
    birdMap: {},   // Will store bird counts indexed by species and year
    birdList: []   // Will store unique bird species names
  };
  
  // Define the order of data sections in the source file
  let sectionNames = [
    "weather",
    "effort",
    "orgs",
    "checklist",
    "compilers",
    "participants"
  ];
  
  // Define clean header names for each data section
  let cleanHeaders = [
    "CountYear,LowTemp,HighTemp,AMCloud,PMClouds,AMRain,PMRain,AMSnow,PMSnow",
    "CountYear,CountDate,NumParticipants,NumHours,NumSpecies",
    "CountYear,SponsoringOrg",
    "CommonName,CountYear,HowMany,NumberByPartyHours,Flags",
    "CountYear,FirstName,LastName,Email,IsPrimary",
    "CountYear,FirstName,LastName"
  ];
  
  let currentSectionIndex = 0;
  let currentTable = null;
  
  // Parse data starting from row 3 (rows 0-2 contain metadata)
  for (let i = 3; i < _data.getRowCount(); i++) {
    let row = _data.getRow(i);
    
    // Check if we need to start a new table section
    if (!currentTable) {
      // Initialize new table with appropriate column headers
      currentTable = new p5.Table();
      let columnNames = cleanHeaders[currentSectionIndex].split(",");
      
      for (let j = 0; j < columnNames.length; j++) {
        currentTable.addColumn(columnNames[j]);
      }
      
      // Attach table to the count object
      count[sectionNames[currentSectionIndex]] = currentTable;
      
    } else if (row.arr.join("").indexOf("CountYear") !== -1) {
      // "CountYear" indicates start of new section - reset for next table
      currentTable = null;
      currentSectionIndex++;
      
    } else {
      // Add data row to current table
      let newRow = currentTable.addRow();
      
      for (let j = 0; j < currentTable.getColumnCount(); j++) {
        newRow.set(j, row.get(j));
      }
      
      // Special processing for checklist section (index 3)
      // Build the birdMap for quick lookup by species and year
      if (currentSectionIndex === 3) {
        // Clean bird name (remove any line breaks)
        let birdName = row.get(0).split(/\r?\n/)[0];
        // Extract year (remove any trailing whitespace/text)
        let year = row.get(1).split(/\r?\n/)[0].split(" ")[0];
        
        // Initialize bird entry if first occurrence
        if (!count.birdMap[birdName]) {
          count.birdMap[birdName] = {};
          count.birdList.push(birdName);
        }
        
        // Store count data for this bird species in this year
        count.birdMap[birdName][year] = {
          howMany: parseInt(row.get(2)),                    // Total count
          numberByPartyHours: parseFloat(row.get(3))        // Normalized by effort
        };
      }
    }
  }
  
  return count;
}