'use strict';

const pceParser = require('./pceParser');

pceParser.parseResult('./export_pce/2017-05-13-0-selectif_national_3_slalom_sud_ouest_qualification.pce', (resultJson) => {
  console.log(resultJson);
});