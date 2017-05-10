'use strict';

const async = require('async');
const csv2Array = require("csv-to-array");
const pceParser = require('./pceParser');

const prefix = '';
const folder = 'FranceElite2017';
const suffix =  '_C4.txt';

const cats = ['K1H', 'K1D', 'C1H', 'C1D', 'C2H', 'C2M'];


let pce = '';
pceParser.parseEmbarcations((licences) => {
  //console.log(err || array);
  function iterator(cat, iteratorCallback) {
    const columns = ["rank", "bib", "name", "club", "time", "penalties","total"];
    const file = `export_siwidata/${folder}/${prefix}${cat}${suffix}`;
    //console.log(file);
    csv2Array({
      file: file,
      columns: columns,
      csvOptions:{charset: 'utf16'}
    }, function (err, siwi) {
      //console.log(err || licences);
      for(let line of siwi) {
        if(line.rank !== 'Touched' && line.rank !== 'Missed') {
          //console.log(line);
          const splittedName = line.name.split(' ');

          if(cat !== 'C2H' && cat !== 'C2M' && cat !== 'C2D') {
            let lastname = '';
            let firstname = '';
            for(let tokenName of splittedName) {
              if(tokenName.toUpperCase() == tokenName) {
                if(lastname !== '') lastname += ' ';
                lastname += tokenName;
              } else {
                if(firstname !== '') firstname += ' ';
                firstname += tokenName;
              }
            }
            firstname = firstname.toUpperCase();
            //console.log(firstname);
            //console.log(lastname);
            const found = licences.find((e) => e.boat === cat && e.firstname===firstname && e.lastname===lastname);
            //console.log(found);
            const ligne = found.embarcationId+';'+cat+';'+found.category+';'+cat+';'+found.club+';'+found.clubId+';;;;;;'+line.bib+';1;'+found.licence+';'+lastname+
              ';'+firstname+';'+found.sex+';'+found.dob+';CO;'+(line.time || 'DNS')+';'+(line.penalties || 0)+';;'+line.total+';;;;;;;;;;'+line.total+';;;\n';
            //console.log(ligne);
            pce += ligne;
          } else {
            let lastname1 = '';
            let firstname1 = '';
            let lastname2 = '';
            let firstname2 = '';
            let steps = 1;
            for(let tokenName of splittedName) {
              if(tokenName.toUpperCase() == tokenName) {
                if(steps == 2) steps ++;
                if(steps == 1) {
                  if(lastname1 != '') lastname1 += ' ';
                  lastname1 += tokenName;
                } else if (steps == 3) {
                  if(lastname2 != '') lastname2 += ' ';
                  lastname2 += tokenName;
                }
              } else {
                if(steps == 1) steps ++;
                if(steps == 3) steps ++;
                if(steps == 2) {
                  if(firstname1 != '') firstname1 += ' ';
                  firstname1 += tokenName;
                } else if (steps == 4) {
                  if(firstname2 != '') firstname2 += ' ';
                  firstname2 += tokenName;
                }
              }
            }
            firstname1 = firstname1.toUpperCase();
            firstname2 = firstname2.toUpperCase();
            //console.log(firstname1);
            //console.log(lastname1);
            //console.log(firstname2);
            //console.log(lastname2);
            const found = licences.find((e) => e.boat===cat && e.firstname===firstname1 && e.lastname===lastname1 && e.firstname2===firstname2 && e.lastname2===lastname2);
            //if (!found) 
            //console.log(found);
            const ligne = found.embarcationId+';'+cat+';'+found.category+';'+cat+';'+found.club+';'+found.clubId+';;;;;;'+line.bib+';2;'+found.licence+';'+lastname1+
              ';'+firstname1+';'+found.sex+';'+found.dob+';'+found.licence2+';'+lastname2+
              ';'+firstname2+';'+found.sex2+';'+found.dob2+';CO;'+(line.time||'DNS')+';'+(line.penalties || 0)+';;'+line.total+';;;;;;;;;;'+line.total+';;;\n';
            //console.log(ligne);
            pce += ligne;
          }
        }
      }
      iteratorCallback();
    });
  }

  async.eachSeries(cats, iterator, function() {
    console.log(pce);
  });
});
