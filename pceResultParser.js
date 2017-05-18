const csv = require('csvtojson');
const readline = require('readline');
const fs = require('fs');
const _ = require('lodash');

module.exports = {parseResult};


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

const columnsPceResultsMono = [
  'embarcationId', 'boat', 'category', 'epreuve', 'club', 'clubId', 'cd', 'cdId', 'cr', 'crId', 'value', 'bib', 'peopleInTheBoat', 
  'licence', 'lastname','firstname', 'sex', 'dob', 'CO', 'time', 'totalPenalties', 'detailPenalties', 'score', 'a', 'b', 'c', 'd', 'e',
  'f', 'g', 'h', 'i', 'j', 'rank', 'criteria'
];

const columnsPceResultsBi = [
  'embarcationId', 'boat', 'category', 'epreuve', 'club', 'clubId', 'cd', 'cdId', 'cr', 'crId', 'value', 'bib', 'peopleInTheBoat', 
  'licence1', 'lastname1','firstname1', 'sex1', 'dob1', 'licence2', 'lastname2','firstname2', 'sex2', 'dob2', 'CO', 'time', 'totalPenalties', 'detailPenalties', 'score', 'a', 'b', 'c', 'd', 'e',
  'f', 'g', 'h', 'i', 'j', 'rank', 'criteria'
];

function parseResult(filePath, cb) {
  let headerSection = true;
  let results = false;
  let footerSection = false;
  const tokenResults = '[resultats]';
  const tokenOfficiels = '[officiels]';

  let header = '';
  let footer = '';
  let mono = '';
  let bi = '';
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath)
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
    csv({noheader: true, headers: columnsPceResultsMono, delimiter:';'}).fromString(mono).on('end_parsed', (jsonArrObjMono) => {
      csv({noheader: true, headers: columnsPceResultsBi, delimiter:';'}).fromString(bi).on('end_parsed', (jsonArrObjBi) => {
        cb(header, _.sortBy(jsonArrObjMono, (e) => parseFloat(e.score)), _.sortBy(jsonArrObjBi, (e) => parseFloat(e.score)), footer);
      });
    });
  }); 
}