'use strict';

if (module.hot) {
  module.hot.accept();
}

import '../styles/index.scss';
import { parse, stringify } from 'himalaya';

//html input
const html = '<div>hello div tag. this is a new line.<a class="test">hello a tag<strong> this is gonna be hard</strong></a></div><div>hello div 2 tag<a class="test">hello a2 tag<strong> this is gonna be harder</strong></a></div>';
//parse the HTML
const parsedHTML = parse(html);

//show the HTML on page
$('.HTML').text(html);

let translationJSON = {};
let sentenceArray = [];
let count = 0;
let symbolCount = 0;
let htmlData = parse(html);

//commonly used tags for text in HTML
const textTags = ['a', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'i', 'u', 'p', 'td', 'tr', 'dd', 'dt', 'blockquote', 'strong'];

//encode
function createJSON(data) {
  for (var i = 0; i < data.length; i++) {
    //if there is text tag inside a text tag -> <a>We need this sentence <strong>together</strong></a>
    if (data[i].type === 'element' && (textTags.indexOf(data[i].tagName) !== -1)) {
      sentenceArray = [...sentenceArray, stringify([data[i]])];
    } else if (data[i].type === 'element') {
      //if its not a text tag then keep traversing till you find any text tag in the children nodes
      createJSON(data[i].children);
    } else if (data[i].type === 'text') {
      // if its a text tag then store all the sentences in the array
      sentenceArray = [...sentenceArray, data[i].content.split('.').map(function(index, elem) {
        return index;
      })];
    }
  }
  return sentenceArray;
}
createJSON(parsedHTML);

let test = JSON.stringify(sentenceArray);
const test1 = test.replace(/\"(.*?)\"/g, function(match) {
  //remove the special character	
  match = match.replace(/\"|\"/g, '');
  symbolCount++;
  translationJSON[symbolCount] = match;

  return '"~' + symbolCount + '~"';
});
$('.JSON').text(JSON.stringify(translationJSON));

//decode
let translatedJSON = {
  1: "hello div tag -in spanish",
  2: " this is a new line -in spanish",
  3: "",
  4: "<a class='test'>hello a tag<strong> this is gonna be hard -in spanish</strong></a>",
  5: "hello div 2 tag",
  6: "<a class='test'>hello a2 tag<strong> this is gonna be harder -in spanish</strong></a>"
};
$('.transaltionJSON').text(JSON.stringify(translatedJSON));
translatedJSON = test1.replace(/\~(.*?)\~/g, function(match) {

  //remove the special character	
  match = match.replace(/\~|\~/g, '');

  return translatedJSON[match];
});
translatedJSON = JSON.parse(translatedJSON);
translatedJSON = Object.values(translatedJSON);


function createHTML(data, translatedJSON) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].type === 'element' && (textTags.indexOf(data[i].tagName) !== -1)) {
      data[i] = parse(translatedJSON[count])[0];
      count++;
    } else if (data[i].type === 'element') {
      createHTML(data[i].children, translatedJSON);
    } else if (data[i].type === 'text') {
      data[i].content = translatedJSON[count].join('.');
      count++;
    }
  }
  htmlData = [...htmlData, data];
  return data;
}
createHTML(htmlData, translatedJSON);

//show translated HTML on page
htmlData = htmlData.splice(0, parsedHTML.length);
const translatedHTML = stringify(htmlData);
$('.translatedHTML').text(translatedHTML);