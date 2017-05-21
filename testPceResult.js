'use strict';

const pceParser = require('./pceResultParser');

const qualif = './export_pce/2017-05-21-1-selectif_championnat_national_2_slalom_qualif.pce';
const final = './export_pce/2017-05-21-1-selectif_championnat_national_2_slalom_finale.pce';
pceParser.fixMissingCriteriaOnFinal(qualif, final, './output.pce', () => {
  console.log('done');
})
