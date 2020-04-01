// PARA PREENCHER
var GA_ACCOUNTS_IDS = ["XXXXXXXX", "XXXXXXXX"], // ID das contas de GA que queira coletar os filtros
    starterRow = 8, // Linha do comeco do Header
    starterColumn = 2, // Coluna do comeco do Header
    sheetName = "Filtros"; // Nome da sheet a qual os filtros estarao
    
// NAO NECESSARIO MEXER
var columnLength = 12; // Quantidade de colunas

function getFilters() {
  
  var accounts = Analytics.Management.Accounts.list();
  
  var fields = [];
  accounts.items.map(function (account) {
    if (GA_ACCOUNTS_IDS.includes(account.id)){
      
      var filters = [];
      
      var properties = Analytics.Management.Webproperties.list(account.id).items;
      
      properties.map(function (property) {
        var views = Analytics.Management.Profiles.list(account.id, property.id);
        views.items.map(function (view) {
          var filterLinks = Analytics.Management.ProfileFilterLinks.list(account.id, property.id, view.id);
          filterLinks.items.map(function (filterLink){
            var filter = Analytics.Management.Filters.get(account.id, filterLink.filterRef.id);
            if (!filters.includes(filter.id)) filters.push(filter.id);
            var prefab = [account.id, account.name, property.id, property.name, view.id, view.name, filterLink.rank, filter.name, filter.type];
            var params = [prefab, filter, fields];
            var hasFilter = includeDetails(params)
            || excludeDetails(params)
            || advancedDetails(params)
            || searchAndReplaceDetails(params);
            if (!hasFilter) {
              Logger.log("FILTER NOT SPECIFIED:"); // Checar o log para ver se todos os filtros entraram
              Logger.log(filter);
            }
          }) // filterLinks.items.map
        }) // views.items.map
      }) // properties.map
      
      var accountFilters = Analytics.Management.Filters.list(account.id).items;
      
      accountFilters.map(function (filter){
        if (!filters.includes(filter.id)){
          var prefab = [account.id, account.name, "---", "---", "---", "---", "---", filter.name, filter.type];
          var params = [prefab, filter, fields];
          var hasFilter = includeDetails(params)
          || excludeDetails(params)
          || advancedDetails(params)
          || searchAndReplaceDetails(params);
          if (!hasFilter) {
            Logger.log("FILTER NOT SPECIFIED:"); // Checar o log para ver se todos os filtros entraram
            Logger.log(filter);
          }
        }
      }) // accountFilters.map
    } // if (GA_ACCOUNTS_IDS.includes(account.id))
  }) // accounts.items.map

  
  // Preencher sheet
  var filtersSheet = SS.getSheetByName(sheetName);
  
  filtersSheet.setFrozenRows(starterRow);
  filtersSheet.getRange(starterRow, starterColumn,  1, columnLength).setValues([['ID da Conta', 'Conta', 'ID da Propriedade', 'Propriedade', 'ID da Vista', 'Vista', 'Rank', 'Nome do Filtro', 'Tipo de Filtro', 'Campo de Filtro', 'Case Sensitive', 'Padrão de filtro']]);
  filtersSheet.getRange(starterRow + 1, starterColumn, SS.getLastRow(), columnLength).clear();
  if (fields.length != 0) filtersSheet.getRange(starterRow + 1, starterColumn, fields.length, columnLength).setValues(fields);
  
  // Centralizar coluna e Header
  filtersSheet.getRange(starterRow, starterColumn,  1, columnLength).setHorizontalAlignment("center");
  for (var i = 0; i <= 7; i += 2) {
    filtersSheet.getRange(starterRow + 1, starterColumn + i, SS.getLastRow(), 1).setHorizontalAlignment("center");
  }
}

function includeDetails(params){
  if (params[1].includeDetails){
    var includeArr = [params[1].includeDetails.field, params[1].includeDetails.caseSensitive, params[1].includeDetails.expressionValue];
    params[2].push(params[0].concat(includeArr));
    Logger.log(params[0].concat(includeArr));
    return true;
  }
  return false;
}

function excludeDetails(params){
  if (params[1].excludeDetails) {
    var excludeArr = [params[1].excludeDetails.field, params[1].excludeDetails.caseSensitive, params[1].excludeDetails.expressionValue];
    params[2].push(params[0].concat(excludeArr));
    Logger.log(params[0].concat(excludeArr));
    return true;
  }
  return false;
}

function advancedDetails(params){
  if (params[1].advancedDetails) {
    var advancedArr = ['A: ${params[1].advancedDetails.fieldA} B: ${params[1].advancedDetails.fieldB}', params[1].advancedDetails.caseSensitive, 'A: ${params[1].advancedDetails.extractA} B: ${params[1].advancedDetails.extractB}'];
    params[2].push(params[0].concat(advancedArr));
    Logger.log(params[0].concat(advancedArr));
    return true;
  }
  return false;
}

function searchAndReplaceDetails(params){
  if (params[1].searchAndReplaceDetails){
    var searchArr = [params[1].searchAndReplaceDetails.field, params[1].searchAndReplaceDetails.caseSensitive, 'S: ${params[1].searchAndReplaceDetails.searchString} R: ${params[1].searchAndReplaceDetails.replaceString}'];
    params[2].push(params[0].concat(searchArr));
    Logger.log(params[0].concat(searchArr));
    return true;
  }
  return false;
}