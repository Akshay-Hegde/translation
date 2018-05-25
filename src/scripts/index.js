'use strict';

if (module.hot) {
  module.hot.accept();
}

import '../styles/index.scss';
import { parse, stringify } from 'himalaya';

const html = '<div>hello div tag. this is a new line.<a class="test">hello a tag<strong> this is gonna be hard</strong></a></div><div>hello div 2 tag<a class="test">hello a2 tag<strong> this is gonna be harder</strong></a></div>';
const json = parse(html);

$('.HTML').text(html);

const JSONdata = parse(html);
let sentenceArray = [];
let count = 0;
let translationJSON = {};
let htmlData = parse(html);
const textTags = ['a', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'i', 'u', 'p', 'td', 'tr', 'dd', 'dt', 'blockquote', 'strong'];

//encode
function createJSON(data) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].type === 'element' && (textTags.indexOf(data[i].tagName) !== -1)) {
      sentenceArray = [...sentenceArray, stringify([data[i]])];
    } else if (data[i].type === 'element') {
      createJSON(data[i].children);
    } else if (data[i].type === 'text') {
      sentenceArray = [...sentenceArray, data[i].content.split('.').map(function(index, elem) {
        return index;
      })];
    }
  }
  return sentenceArray;
}


$('.JSON').text(JSON.stringify(createJSON(JSONdata)));


//decode
let translatedJSON = [
  ["hello div tag -in spanish", " this is a new line-in spanish", ""], "<a class='test'>hello a tag<strong> this is gonna be hard -in spanish</strong></a>", ["hello div 2 tag -in spanish"], "<a class='test'>hello a2 tag<strong> this is gonna be harder -in spanish</strong></a>"
];
$('.transaltionJSON').text(JSON.stringify(translatedJSON));

function createHTML(data, translatedJSON) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].type === 'element' && (textTags.indexOf(data[i].tagName) !== -1)) {
      data[i] = parse(translatedJSON[count])[0];
      count++;
    } else if (data[i].type === 'element') {
      createHTML(data[i].children, translatedJSON);
    } else if (data[i].type === 'text') {
      data[i].content = translatedJSON[count].join();
      count++;
    }
  }
  htmlData = [...htmlData, data];
  return data;
}
createHTML(htmlData, translatedJSON);
htmlData = htmlData.splice(0, json.length);

const translatedHTML = stringify(htmlData);
$('.translatedHTML').text(translatedHTML);