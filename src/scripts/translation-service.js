import '../styles/index.scss';
import { parse, stringify } from 'himalaya';

const tranlationService = {
  //commonly used tags for text in HTML
  textTags: ['a', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'i', 'u', 'p', 'td', 'tr', 'dd', 'dt', 'blockquote', 'strong'],
  count: 0,
  sentenceArray: [],
  init() {
    //html input
    const html = '<div>hello div tag. this is a new line.<a class="test">hello a tag<strong> this is gonna be hard</strong></a></div><div>hello div 2 tag<a class="test">hello a2 tag<strong> this is gonna be harder</strong></a></div>';
    //parse the HTML
    const parsedHTML = parse(html);

    //get the translation JSON
    const translationJSON = this.createJSON(parsedHTML);

    //translated JSON
    let translatedObj = {
      1: "hello div tag -in spanish",
      2: " this is a new line -in spanish",
      3: "",
      4: "<a class='test'>hello a tag<strong> this is gonna be hard -in spanish</strong></a>",
      5: "hello div 2 tag",
      6: "<a class='test'>hello a2 tag<strong> this is gonna be harder -in spanish</strong></a>"
    };

    //create the translated HTML
    const originalHTML = parse(html);
    const translatedHTML = this.createHTML(originalHTML, parsedHTML, translatedObj);

    //show all the data on page
    $('.HTML').text(html);
    $('.JSON').text(JSON.stringify(translationJSON));
    $('.transaltionJSON').text(JSON.stringify(translatedObj));
    $('.translatedHTML').text(translatedHTML);

  },
  extractSentences(htmlData) {
    for (var i = 0; i < htmlData.length; i++) {
      //if there is text tag inside a text tag -> <a>We need this sentence <strong>together</strong></a>
      if (htmlData[i].type === 'element' && (tranlationService.textTags.indexOf(htmlData[i].tagName) !== -1)) {
        tranlationService.sentenceArray = [...tranlationService.sentenceArray, stringify([htmlData[i]])];
      } else if (htmlData[i].type === 'element') {
        //if its not a text tag then keep traversing till you find any text tag in the children nodes
        tranlationService.extractSentences(htmlData[i].children);
      } else if (htmlData[i].type === 'text') {
        // if its a text tag then store all the sentences in the array
        tranlationService.sentenceArray = [...tranlationService.sentenceArray, htmlData[i].content.split('.').map(function(index, elem) {
          return index;
        })];
      }
    }
    return tranlationService.sentenceArray;
  },
  createJSON(htmlData) {
    let jsonObj = {};
    let sentenceCount = 0;
    //extract all the sentences from HTML 
    let sentenceData = tranlationService.extractSentences(htmlData);
    sentenceData = JSON.stringify(sentenceData);
    // replace every text with special symbols and a number to create the JSON for translation team
    sentenceData = sentenceData.replace(/\"(.*?)\"/g, function(match) {
      //remove the special character  
      match = match.replace(/\"|\"/g, '');
      sentenceCount++;
      //jsonObj is the object we will pass to the translation team
      jsonObj[sentenceCount] = match;

      return '"~' + sentenceCount + '~"';
    });
    return jsonObj;
  },
  extractText(originalHTML, htmlData, translatedObj) {
    let sentenceCount = 0;
    //extract all the sentences from HTML tp map it to the translated JSON recieved from the translation team
    let sentenceData = tranlationService.extractSentences(htmlData);
    sentenceData = JSON.stringify(sentenceData);
    // replace every text with special symbols and a number to create the JSON for translation team
    sentenceData = sentenceData.replace(/\"(.*?)\"/g, function(match) {
      //remove the special character  
      match = match.replace(/\"|\"/g, '');
      sentenceCount++;
      return '"~' + sentenceCount + '~"';
    });
    //compare the sentenceData with the keys in translated JSON and extract the text from the values
    let translatedJSON = sentenceData.replace(/\~(.*?)\~/g, function(match) {
      //remove the special character  
      match = match.replace(/\~|\~/g, '');

      return translatedObj[match];
    });
    //parse the translated JSON and use the values to create the HTML array
    translatedJSON = JSON.parse(translatedJSON);
    translatedJSON = Object.values(translatedJSON);
    //create the HTML data for the stringify function which will create the translated HTML
    for (var i = 0; i < htmlData.length; i++) {
      if (htmlData[i].type === 'element' && (tranlationService.textTags.indexOf(htmlData[i].tagName) !== -1)) {
        htmlData[i] = parse(translatedJSON[tranlationService.count])[0];
        tranlationService.count++;
      } else if (htmlData[i].type === 'element') {
        tranlationService.extractText(originalHTML, htmlData[i].children, translatedObj);
      } else if (htmlData[i].type === 'text') {
        htmlData[i].content = translatedJSON[tranlationService.count].join('.');
        tranlationService.count++;
      }
    }
    originalHTML = [...originalHTML, htmlData];
    return htmlData;
  },
  createHTML(originalHTML, htmlData, translatedObj) {
    //store the parsed HTML array length
    const arrayLength = originalHTML.length;
    //extract text from the translatedObj
    let translatedSentences = tranlationService.extractText(originalHTML, htmlData, translatedObj);
    translatedSentences = translatedSentences.splice(0, arrayLength);
    //use the stringify function to generate the HTML
    const translatedHTML = stringify(translatedSentences);
    return translatedHTML;
  }
};

export default tranlationService;