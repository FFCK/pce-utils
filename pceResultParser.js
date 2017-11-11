const csv = require('csvtojson');
const readline = require('readline');
const json2csv = require('json2csv');
const fs = require('fs');
const _ = require('lodash');

module.exports = {parseResult, fixMissingCriteriaOnFinal};


function sortResultsOnScore(a, b) {
  if(a.score === b.score) {
    return 0;
  } else {
    const aFloat = parseFloat(a.score.replace(',', '.'));
    const bFloat = parseFloat(b.score.replace(',', '.'));
    if(aFloat === NaN && bFloat=== NaN) {
      // handle NT vs DNS VS DSQ...
      return 0;
    } else if(aFloat === NaN) {
      return 1;
    } else if(bFloat === NaN) {
      return -1;
    } else if (aFloat>bFloat) {
      return 1;
    } else {
      return -1;
    }
  }
}


function sortResultsOnRank(a, b) {
  if(a.rank === b.rank) {
    return 0;
  } else {
    const aRank = parseInt(a.rank);
    const bRank = parseInt(b.rank);
    if(aRank === NaN && bRank=== NaN) {
      return 0;
    } else if(aRank === NaN) {
      return 1;
    } else if(bRank === NaN) {
      return -1;
    } else if (aRank>bRank) {
      return 1;
    } else {
      return -1;
    }
  }
}


const columnsPceResultsMono1Run = [
  'embarcationId', 'boat', 'category', 'epreuve', 'club', 'clubId', 'cd', 'cdId', 'cr', 'crId', 'value', 'bib', 'peopleInTheBoat', 
  'licence', 'lastname','firstname', 'sex', 'dob', 'CO', 'time', 'totalPenalties', 'detailPenalties', 'score', 'startTime', 'startOrder',
   '?', 'rank', 'criteria'
];
const columnsPceResultsMono2Runs = [
  'embarcationId', 'boat', 'category', 'epreuve', 'club', 'clubId', 'cd', 'cdId', 'cr', 'crId', 'value', 'bib', 'peopleInTheBoat', 
  'licence', 'lastname','firstname', 'sex', 'dob', 'CO', 'time', 'totalPenalties', 'detailPenalties', 'score', 'startTime', 'startOrder',
   '?', 'time2', 'totalPenalties2', 'detailPenalties2','score2', 'startTime2', 'startOrder2', 'scoreTotal', 'rank', 'criteria'
];


const columnsPceResultsBi1Run = [
  'embarcationId', 'boat', 'category', 'epreuve', 'club', 'clubId', 'cd', 'cdId', 'cr', 'crId', 'value', 'bib', 'peopleInTheBoat', 
  'licence1', 'lastname1','firstname1', 'sex1', 'dob1', 'licence2', 'lastname2','firstname2', 'sex2', 'dob2', 'CO', 'time', 'totalPenalties', 
  'detailPenalties', 'score', 'startTime', 'startOrder','?', 
  'rank', 'criteria'
];
const columnsPceResultsBi2Runs = [
  'embarcationId', 'boat', 'category', 'epreuve', 'club', 'clubId', 'cd', 'cdId', 'cr', 'crId', 'value', 'bib', 'peopleInTheBoat', 
  'licence1', 'lastname1','firstname1', 'sex1', 'dob1', 'licence2', 'lastname2','firstname2', 'sex2', 'dob2', 'CO', 'time', 'totalPenalties', 
  'detailPenalties', 'score', 'startTime', 'startOrder','?', 'time2', 'totalPenalties2', 'detailPenalties2','score2', 'startTime2', 'startOrder2', 
  'scoreTotal', 'rank', 'criteria'
];

function parseResult(filePath, numberOfRunsInPce, cb) {
  let headerSection = true;
  let results = false;
  let footerSection = false;
  const tokenResults = '[resultats]';
  const tokenOfficiels = '[officiels]';

  const columnsMonoToBeUsed = numberOfRunsInPce === 2 ? columnsPceResultsMono2Runs : columnsPceResultsMono1Run;
  const columnsBiToBeUsed = numberOfRunsInPce === 2 ? columnsPceResultsBi2Runs : columnsPceResultsBi1Run;


  let header = '';
  let footer = '';
  let mono = '';
  let bi = '';
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'binary')
  });
  rl.on('line', (line) => {
    if(line.length >= tokenResults.length && line.substr(0, tokenResults.length) === tokenResults) {
      headerSection = false;
      results = true;
      return;
    } else if(line.length >= tokenOfficiels.length && line.substr(0, tokenOfficiels.length) === tokenOfficiels) {
      results = false;
      footerSection = true;
    }
    if(results && line.length>2) {
      if(line.substr(0,2) === 'C2') {
        bi += line+'\n';
      } else {
        mono += line+'\n';
      }
    } else if(headerSection) {
      header += line+'\n';
    } else if (footerSection) {
      footer += line+'\n';
    }
  }).on('close', () => {
    //console.log(mono);

    csv({noheader: true, headers: columnsMonoToBeUsed, delimiter:';'}).fromString(mono).on('end_parsed', (jsonArrObjMono) => {
      csv({noheader: true, headers: columnsBiToBeUsed, delimiter:';'}).fromString(bi).on('end_parsed', (jsonArrObjBi) => {
        cb(header, _.sortBy(jsonArrObjMono, (e) => parseFloat(e.score)), _.sortBy(jsonArrObjBi, (e) => parseFloat(e.score)), footer);
      });
    });
  }); 
}

function fixMissingCriteriaOnFinal(filePathQualif, filePathFinal, numberOfRunsInPce, outputFile, cb) {
  function haveStarted(e) {
    const score = e.score.toLowerCase();
    return (score !== 'abs' && score !== 'nt');
  }

  function giveCriteria(catFiltered) {
    const nbBoatHavingStarted = catFiltered.filter(haveStarted).length;
    let nbBoatFinalA = nbBoatHavingStarted < 6 ? 5 : Math.round(nbBoatHavingStarted/2);
    console.log(`starts: ${nbBoatHavingStarted}, number of boats in Final A: ${nbBoatFinalA}`);
    catFiltered = _.sortBy(catFiltered, (e) => parseFloat(e.score.replace(',', '.')));
    /*for(let e of catFiltered) {
      if(e.rank==='') {
        if(haveStarted(e)) {
          e.criteria = 'B';
        } else {
          e.criteria = '';
        }
      } else if(parseInt(e.rank) <=nbBoatFinalA) {
        e.criteria = 'A';
      } else {
        e.criteria = 'B';
      }
    }*/
    for(let i=0; i < catFiltered.length; i++) {
      const e = catFiltered[i];
      //console.log(e);
      if(i+1<=nbBoatFinalA) {
        e.criteria = 'A';
      } else {
        e.criteria = 'B';
      }
    }

  }

  parseResult(filePathQualif, numberOfRunsInPce, (headerQualif, resultJsonMonoQualif, resultJsonBiQualif, footerQualif) => {
    parseResult(filePathFinal, numberOfRunsInPce, (headerFinale, resultJsonMonoFinale, resultJsonBiFinale, footerFinale) => {
      // const catMono = [/*'K1H', */'K1D'/*, 'C1H', 'C1D', 'INV'*/];
      const catMono = ['K1H', 'K1HM', 'K1D', 'K1DM', 'C1H', 'C1HM', 'C1D', 'C1DM', 'INV'];
      const finalMono = [];
      const finalBi = [];
      for(let catM of catMono) {
        const catFiltered = resultJsonMonoQualif.filter((e)=>e.epreuve===catM);
        console.log(`Cat: ${catM}`);
        //console.log(catFiltered);
        giveCriteria(catFiltered);
        
        const map = catFiltered.map((e) => {return {embarcationId:e.embarcationId, score:e.score, rank:e.rank, criteria:e.criteria};});
        /*for(let e of map) {
          console.log(e);
        }*/
        
        //console.log(map);

        for(let f of catFiltered) {
          let found = resultJsonMonoFinale.find((e) => e.embarcationId === f.embarcationId);
          if(found) {
            found.criteria = f.criteria;
            finalMono.push(found);
          }
        }

      }
      //const catBi = [/*'C2H', 'C2M', 'C2D'*/];
      const catBi = ['C2H', 'C2M', 'C2D', 'C2HM', 'C2MM', 'C2DM'];

      for(let catB of catBi) {
        const catFiltered = resultJsonBiQualif.filter((e)=>e.epreuve===catB);
        //console.log(`Cat: ${catB}`);

        giveCriteria(catFiltered);
        const map = catFiltered.map((e) => {return {embarcationId:e.embarcationId, score:e.score, rank:e.rank, criteria:e.criteria};});
        //console.log(map);

        for(let f of catFiltered) {
          let found = resultJsonBiFinale.find((e) => e.embarcationId === f.embarcationId);
          if(found) {
            found.criteria = f.criteria;
            finalBi.push(found);
          }
        }
      }
      //console.log(final);
      //console.log(json2csv({data:finalMono, hasCSVColumnTitle:false, del:';', quotes:''}));
      //console.log(json2csv({data:finalBi, hasCSVColumnTitle:false, del:';', quotes:''}));
      const pceFinal = headerFinale+'\n[resultats]\n'+json2csv({data:finalMono, hasCSVColumnTitle:false, del:';', quotes:''})+'\n'+json2csv({data:finalBi, hasCSVColumnTitle:false, del:';', quotes:''})+'\n\n'+footerFinale;
      //console.log(pceFinal);
      fs.writeFile(outputFile, pceFinal, cb);
    });
  });
} 