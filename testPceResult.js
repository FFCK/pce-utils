'use strict';

const pceParser = require('./pceResultParser');

const qualif = './export_pce/2017-05-13-0-selectif_national_3_slalom_sud_ouest_qualification.pce';
const final = './export_pce/2017-05-13-3-selectif_national_3_slalom_sud_ouest_finales_sans_critere.pce';
pceParser.fixMissingCriteriaOnFinal(qualif, final, './output.pce', () => {
  console.log('done');
})
