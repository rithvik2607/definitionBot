 function parser(json, word) {
  console.log(json[0].fl);
  console.log(json[0].shortdef);
  category = json[0].fl;
  definition = json[0].shortdef;
 
  return `
  Word: <b>${word}</b>
  definition found for the word: <b>${word}</b>
 
  <i>CATEGORY: ${category}</i>
  ${definition}
  `
}
 
module.exports = parser;