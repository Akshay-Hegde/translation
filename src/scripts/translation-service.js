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
    tranlationService.sentenceArray = [];
    for (var i = 0; i < htmlData.length; i++) {
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
  downloadFile(data, filename) {
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    a.download = 'en_' + filename;
    // Append anchor to body.
    document.body.appendChild(a);
    a.click();
    // Remove anchor from body
    document.body.removeChild(a);
  },
  IsJsonString(str) {
    try {
      var json = JSON.parse(str);
      return (typeof json === 'object');
    } catch (e) {
      return false;
    }
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
                  if (tranlationService.IsJsonString(value)) {
                    let fileData = JSON.parse(value);

                    //conver the strings into translation JSON
                    let array = [];
                    fileData.forEach(function(index, el) {
                      let dataObj = { originalHTML: {} };
                      tranlationService.sentenceArray = [];
                      for (var key in index) {
                        let parsedHTML = [];
                        if (key.indexOf('brightspot') === -1) {
                          //parse the HTML
                          if (typeof(index[key]) === 'object') {
                            dataObj.originalHTML[key] = parsedHTML = parse(index[key][0]);
                          } else {
                            dataObj.originalHTML[key] = parsedHTML = parse(index[key]);
                          }
                          //get the translation JSON
                          const translationJSON = tranlationService.createJSON(parsedHTML);
                          dataObj = {
                            ...dataObj,
                            [key]: translationJSON
                          };
                        } else {
                          dataObj = {
                            ...dataObj,
                            [key]: index[key]
                          };
                        }
                      }
                      array = [...array, dataObj];
                    });
                    //download the json file
                    tranlationService.downloadFile(array, zipEntry.name);
                  }
                });
              }
            });
          }, function(e) {
            console.log("err", e.message);
          });
      }
      const files = evt.target.files;
      for (let i = 0; i < files.length; i++) {
        handleFile(files[i]);
      }
    });
  },
  createHTML(htmlData, translatedObj) {
    let translatedHTML;
    //store the parsed HTML array length
    for (var i = 0; i < htmlData.length; i++) {
      if (htmlData[i].type === 'element') {
        tranlationService.createHTML(htmlData[i].children, translatedObj);
      } else if (htmlData[i].type === 'text') {
        htmlData[i].content = translatedObj;
      }
    }
    translatedHTML = stringify(htmlData);
    return translatedHTML;
  },
  handleBundle() {
    $("#bundleInput").on("change", function(evt) {
      //capture the file information.
      function handleZip(file) {
        const new_zip = new JSZip();
        const bundle_zip = new JSZip();

        //read the Blob
        new_zip.loadAsync(file)
          .then(function(zip) {
            //read the entries
            tranlationService.count = 0;
            let fileZip = new JSZip();
            zip.forEach(function(relativePath, zipEntry) {
              if ((relativePath === zipEntry.name) && (zipEntry.name.indexOf('json') !== -1)) {
                new_zip.file(zipEntry.name).async("string").then(function(value) {
                  tranlationService.count++;

                  function joinString(obj) {
                    let string = '';
                    for (var key in obj) {
                      string = string + obj[key];
                    }
                    return string;
                  }
                  if (tranlationService.IsJsonString(value)) {
                    const fileData = JSON.parse(value);
                    //convert the translated strings into json
                    let array = [];
                    fileData.forEach(function(index, el) {
                      let dataObj = {};
                      for (var key in index) {
                        if (key.indexOf('brightspot') !== -1) {
                          dataObj = {
                            ...dataObj,
                            [key]: index[key]
                          };
                        } else if (key !== 'originalHTML') {
                          dataObj = {
                            ...dataObj,
                            [key]: tranlationService.createHTML(index.originalHTML[key], joinString(index[key]))
                          };
                        }
                      }
                      array = [...array, dataObj];
                    });

                    const arrStrings = JSON.stringify(array);
                    fileZip.file(zipEntry.name, arrStrings);
                  }
                  if (tranlationService.count === Object.keys(zip.files).length - 1) {
                    fileZip.generateAsync({
                      type: "blob"
                    }).then(function(content) {
                      saveAs(content, "bundle.zip");
                    }, function(err) {
                      console.log("err", err);
                    });
                  }
                });
              }
            });
          }, function(e) {
            console.log("err", e.message);
          });
      }
      const files = evt.target.files;
      for (let i = 0; i < files.length; i++) {
        handleZip(files[i]);
      }
    });
  }
};

export default tranlationService;