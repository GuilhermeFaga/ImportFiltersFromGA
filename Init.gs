var SS = SpreadsheetApp.getActiveSpreadsheet();

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Automação')
  .addItem('Recarregar Filtros',  'getFilters')
  .addToUi();
}