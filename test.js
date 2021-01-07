const fuzzysort = require('fuzzysort');

let julienIndexes = require('./juliencrash.json'); //! not working
// let julienIndexes = require('./test.json'); //? working but the data is the problem
// ? this make the indexes working then
// julienIndexes = julienIndexes.map((descriptionPrepared, namePrepared, resource)=>({
//   resource,
//   namePrepared: fuzzysort.prepare(resource.name?.substring(0,150) || ''),
//   descriptionPrepared: fuzzysort.prepare(resource.description?.substring(0,150) || ''),
//   addedTermsStrPrepared: fuzzysort.prepare(resource.appMetadata?.additionalSearchTerms?.join(' ').substring(0,150) || '')
// }));

console.time('res1');
const res1 = fuzzysort.go('a', julienIndexes, {
  allowTypo: false,
  keys: ['namePrepared', 'descriptionPrepared', 'addedTermsStrPrepared'],
  threshold: 0.005,
  scoreFn(r) {
    return scoringEachField(r);
  },
})
console.timeEnd('res1');

console.log('res1 done', res1.length)


console.time('res2');
const res2 = fuzzysort.go('key faq', julienIndexes, {
  allowTypo: true,
  keys: ['namePrepared', 'descriptionPrepared', 'addedTermsStrPrepared'],
  threshold: 0.0001,
  scoreFn(r) {
    return scoringEachField(r);
  },
})
console.timeEnd('res2');
console.log('res2', res2.length)


/** Imported helper fromp station which convert to prepared data */
function scoringEachField(resourceFields) {
  // [name, description, additionalSearchTerm]
  const orderOfWeight = [1, 2, 4];
  return [resourceFields[0], resourceFields[1], resourceFields[2]].reduce((totalScore, currScore, index) => {
    if (!currScore) return totalScore;
    //? Fuzzysort have score between [-∞; 0] we transform all to [limit(0); 1]
    totalScore += formatScore(currScore.score) * orderOfWeight[index];
    return totalScore;
  }, 0);
}

function formatScore(score) {
  if (score === 0) return 1; // ? 0 is best score for fuzzy
  if (score < 0) {
    return 1 / Math.abs(score);
  }
  // This case should not happen but...
  return 1;
}
