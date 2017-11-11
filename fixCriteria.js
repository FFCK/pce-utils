'use strict';

const pceParser = require('./pceResultParser');

//const qualif = './export_pce/2017-05-13-0-selectif_national_3_slalom_sud_ouest_qualification.pce';
//const final = './export_pce/2017-05-13-3-selectif_national_3_slalom_sud_ouest_finales_sans_critere.pce';
const qualif = './export_pce/2017-11-11-1-selectif_regional_slalom_double_samedi_qualifications.pce';
const final = './export_pce/2017-11-11-1-selectif_regional_slalom_double_samedi_finale.pce';
const numberOfRunsInPce = 1;


pceParser.fixMissingCriteriaOnFinal(qualif, final, numberOfRunsInPce, './output.pce', () => {
  console.log('done');
})
