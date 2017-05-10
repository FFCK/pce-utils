'use strict';

const csv2Array = require("csv-to-array");


let embarcationJson;
let licenciesJson;

module.exports = {parseEmbarcations, parseLicencies, getLicencesFromName, getLicenciesFromLicenceAndName, getLicenciesFromNames, getPceRowRegistrationMono, getAgeCategoryFromYear};


const columnsPceEmb = ["embarcationId", "boat", "category", "division", "club", "clubId", "cd", "cdId", "cr", "crId", "value", "licence", "lastname","firstname", "sex", "dob", "licence2", "lastname2","firstname2", "sex2", "dob2"];

function parseEmbarcations(cb) {
  csv2Array({
    file: "ffcanoe-sla.pce",
    columns: columnsPceEmb,
    csvOptions:{delimiter:';', charset: 'ISO-8859-15'}
  }, (err, embarcations) => {
    embarcationJson = embarcations;
    if (cb) cb(embarcations);
  });
}

const columnsPceLicencies = ["licence", "lastname","firstname", "sex", "dob", "club", "clubId"];

function parseLicencies(cb) {
  csv2Array({
    file: "licencies.pce",
    columns: columnsPceLicencies,
    csvOptions:{delimiter:';', charset: 'ISO-8859-15'}
  }, (err, licencies) => {
    for(let row of licencies) {
      row.ageCategory = getAgeCategoryFromDob(row.dob);
    }
    licenciesJson = licencies;
    if (cb) cb(licencies);
  });
}

function getLicencesFromName(name) {
  return licenciesJson.filter((elem) => elem.lastname=== name);
} 

function getLicenciesFromLicenceAndName(licence, name) {
  return licenciesJson.find((e) => e.licence === licence && e.lastname === name);
}

function getLicenciesFromNames(firstname, lastname) {
  return licenciesJson.find((e) => e.lastname === lastname.toUpperCase() && e.firstname === firstname.toUpperCase());
}

function getPceRowRegistrationMono(embId, cat, catAge, club, clubId, licence, lastname, firstname, sex, dob ) {
  return embId+';'+cat+';'+catAge+';'+cat+';'+club+';'+clubId+';;;;;;;1;'+licence+';'+lastname+
              ';'+firstname+';'+sex+';'+dob+';NT;Nt;;;Nt;;;;;;;;;;Nt;;;\n';
}

function getAgeCategoryFromDob(dob) {
  return getAgeCategoryFromYear(Number(dob.substr(0,4)));
}

function getAgeCategoryFromYear(year) {
  let nowYear = new Date();
  nowYear = nowYear.getFullYear();
  let diff = nowYear - year;
  if(diff<15) return 'M';
  else if(diff<17) return 'C';
  else if(diff<19) return 'J';
  else if(diff<35) return 'S';
  else return 'V';
}