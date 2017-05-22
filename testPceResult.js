'use strict';

const pceParser = require('./pceResultParser');

//const qualif = './export_pce/2017-05-13-0-selectif_national_3_slalom_sud_ouest_qualification.pce';
//const final = './export_pce/2017-05-13-3-selectif_national_3_slalom_sud_ouest_finales_sans_critere.pce';
const qualif = './export_pce/2017-05-21-1-selectif_championnat_national_2_slalom_qualif.pce';
const final = './export_pce/2017-05-21-1-selectif_championnat_national_2_slalom_finale.pce';
pceParser.fixMissingCriteriaOnFinal(qualif, final, 1, './output.pce', () => {
  console.log('done');
})
