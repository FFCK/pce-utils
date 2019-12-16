const pceParser = require('./pceResultParser');
const json2csv = require('json2csv');
const fs = require('fs');

const startList = './export_pce/20191214_listeDepartFinale.pce';
const result = './export_pce/20191214_resultatFinaleSansCriteres.pce';

const numberOfRunsInPce = 2;


pceParser.parseResult(startList, numberOfRunsInPce, (headerStartList, startListMono, startListBi, footerStartList) => {
  pceParser.parseResult(result, numberOfRunsInPce, (headerResult, resultJsonMonoFinale, resultJsonBiFinale, footerResult) => {
    resultJsonMonoFinale.forEach(mono => {
      const foundStart = startListMono.find(e => e.embarcationId === mono.embarcationId);
      if(foundStart) {
        console.log(`${mono.embarcationId} has criteria ${foundStart.criteria}`);
        mono.criteria = foundStart.criteria;
      } else {
        console.log(`${mono.embarcationId} not found.`);
      }
    });
    resultJsonBiFinale.forEach(bi => {
      const foundStart = startListBi.find(e => e.embarcationId === bi.embarcationId);
      if(foundStart) {
        console.log(`${bi.embarcationId} has criteria ${foundStart.criteria}`);
        bi.criteria = foundStart.criteria;
      } else {
        console.log(`${bi.embarcationId} not found.`);
      }
    });

    const pceFinal = headerResult+'\n[resultats]\n'+json2csv({data:resultJsonMonoFinale, hasCSVColumnTitle:false, del:';', quotes:''})+'\n'+json2csv({data:resultJsonBiFinale, hasCSVColumnTitle:false, del:';', quotes:''})+'\n\n'+footerResult;
    //console.log(pceFinal);
    fs.writeFile('./output.pce', pceFinal, () => {
      console.log('Done');
    });
  });
});
