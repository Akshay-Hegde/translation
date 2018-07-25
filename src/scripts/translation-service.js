import '../styles/index.scss';
import { parse, stringify } from 'himalaya';
import JSZip from 'JSZip';
import { saveAs } from 'file-saver/FileSaver';

const tranlationService = {
  //commonly used tags for text in HTML
  textTags: ['a', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'i', 'u', 'p', 'td', 'tr', 'dd', 'dt', 'blockquote', 'strong'],
  count: 0,
  sentenceArray: [],
  init() {
    this.handleZip();
    this.handleBundle();
  },
  extractSentences(htmlData) {
    //tranlationService.sentenceArray = [];
    for (let i = 0; i < htmlData.length; i++) {
      //if there is text tag inside a text tag -> <a>We need this sentence <strong>together</strong></a>
      if (htmlData[i].type === 'element' && (tranlationService.textTags.indexOf(htmlData[i].tagName) !== -1)) {
        tranlationService.sentenceArray = [...tranlationService.sentenceArray, stringify([htmlData[i]])];
      } else if ((htmlData[i].type === 'element') && (htmlData[i].children.length > 0)) {
        //if its not a text tag then keep traversing till you find any text tag in the children nodes
        tranlationService.extractSentences(htmlData[i].children);
      } else if (htmlData[i].type === 'text') {
        // if its a text tag and has some content then store all the sentences in the array
        if (htmlData[i].content) {
          tranlationService.sentenceArray = [...tranlationService.sentenceArray, htmlData[i].content.split('.').map(function(index, elem) {
            if (index.replace(/\s/g, '').length > 0) {
              return index + '.';
            }
          })];
        }
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
    for (let i = 0; i < htmlData.length; i++) {
      if (htmlData[i].type === 'element' && (tranlationService.textTags.indexOf(htmlData[i].tagName) !== -1)) {
        htmlData[i] = parse(translatedJSON[tranlationService.count])[0];
        tranlationService.count++;
      } else if (htmlData[i].type === 'element') {
        tranlationService.extractText(originalHTML, htmlData[i].children, translatedObj);
      } else if (htmlData[i].type === 'text') {
        htmlData[i].content = translatedJSON[tranlationService.count].join('');
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
  },
  downloadFile(data) {
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    a.download = 'test.json';
    // Append anchor to body.
    document.body.appendChild(a);
    a.click();
    // Remove anchor from body
    document.body.removeChild(a);
  },
  handleZip() {
    $("#fileInput").on("change", function(evt) {
      //capture the file information.
      function handleFile(file) {
        const new_zip = new JSZip();
        //read the Blob
        new_zip.loadAsync(file)
          .then(function(zip) {
            //read the entries
            zip.forEach(function(relativePath, zipEntry) {
              if (zipEntry.name.indexOf('_en') !== -1) {
                //only english file
                new_zip.file(zipEntry.name).async("string").then(function(value) {
                  let fileData = JSON.parse(value);

                  //conver the strings into translation JSON
                  let array = [];

                  fileData.forEach(function(index, el) {
                    let dataObj = {};
                    tranlationService.sentenceArray = [];
                    for (var key in index) {
                      let parsedHTML = [];
                      if (key.indexOf('brightspot') === -1) {
                        //parse the HTML
                        if (typeof(index[key]) === 'object') {
                          parsedHTML = parse(index[key][0]);
                        } else {
                          parsedHTML = parse(index[key]);
                        }
                        //get the translation JSON
                        const translationJSON = tranlationService.createJSON(parsedHTML);
                        dataObj = {
                          ...dataObj,
                          [key]: translationJSON
                        };
                      }
                    }
                    array = [...array, dataObj];
                  });
                  //download the json file
                  tranlationService.downloadFile(array);
                });
              }
            });
          }, function(e) {
            $('.error').html("Error reading " + file.name + ": " + e.message);
          });
      }
      const files = evt.target.files;
      for (let i = 0; i < files.length; i++) {
        handleFile(files[i]);
      }
    });
  },
  handleBundle() {

  }
};

export default tranlationService;