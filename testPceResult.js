'use strict';

const pceParser = require('./pceResultParser');

function haveStarted(e) {
  const score = e.score.toLowerCase();
  return (score !== 'abs' && score !== 'nt');
}

function giveCriteria(catFiltered) {
  const nbBoatHavingStarted = catFiltered.filter(haveStarted).length;
  let nbBoatFinalA = nbBoatHavingStarted < 6 ? 5 : Math.round(nbBoatHavingStarted/2);
  console.log(`starts: ${nbBoatHavingStarted}, number of boats in Final A: ${nbBoatFinalA}`);
  for(let e of catFiltered) {
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
  }

}

pceParser.parseResult('./export_pce/2017-05-13-0-selectif_national_3_slalom_sud_ouest_qualification.pce', (headerQualif, resultJsonMonoQualif, resultJsonBiQualif, footerQualif) => {
  pceParser.parseResult('./export_pce/2017-05-13-3-selectif_national_3_slalom_sud_ouest_finales_sans_critere.pce', (headerFinale, resultJsonMonoFinale, resultJsonBiFinale, footerFinale) => {
    const catMono = ['K1H', 'K1D', 'C1H', 'C1D'];
    for(let catM of catMono) {
      const catFiltered = resultJsonMonoQualif.filter((e)=>e.epreuve===catM);
      console.log(`Cat: ${catM}`);

      giveCriteria(catFiltered);
      
      const map = catFiltered.map((e) => {return {embarcationId:e.embarcationId, score:e.score, rank:e.rank, criteria:e.criteria};});
      /*for(let e of map) {
        console.log(e);
      }*/
      console.log(map);
    }
    const catBi = ['C2H', 'C2M', 'C2D'];
    for(let catB of catBi) {
      const catFiltered = resultJsonBiQualif.filter((e)=>e.epreuve===catB);
      console.log(`Cat: ${catB}`);

      giveCriteria(catFiltered);
      const map = catFiltered.map((e) => {return {embarcationId:e.embarcationId, score:e.score, rank:e.rank, criteria:e.criteria};});
      console.log(map);

    }

  });
});