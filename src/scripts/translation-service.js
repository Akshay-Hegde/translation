import '../styles/index.scss';
import { parse, stringify } from 'himalaya';

const tranlationService = {
  //commonly used tags for text in HTML
  textTags: ['a', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'i', 'u', 'p', 'td', 'tr', 'dd', 'dt', 'blockquote', 'strong'],
  count: 0,
  sentenceArray: [],
  init() {
    //html input
    const html = '<h2>Set up Active Directory Connector v1.5 logging </h2> The Active Directory Connector (ADC) logs activities to the Windows Event Viewer. <br> <br> Back to <a href="/openvoice/help/active-directory-connector-v15-ov790002" target="_blank">Active Directory Connector Contents</a> <br> <br> <h2>Set up logging in the Active Directory Connector </h2> <blockquote>  1. Open the ADC and select the  <b>Operation</b> tab.  <br>  <br> 2. In the  <i>More configuration</i> section, set the  <b>Windows event logger</b>,  <b>File logger</b> and the  <b>Folder for file logging</b> as needed.  <br>  <br> 3. Click  <b>Apply changes</b> when finished.  <br>  <br>  <img src="https://assets.cdngetgo.com/0b/aa/a1b6d7f4421686c2cbaae331cdda/rtaimage-eid-kac1b000000tobu-feoid-00n1b00000b8tsp-refid-0em1b0000005imt">  <br>  <br> </blockquote> <h2>Locate ADC log files in the Windows Event Viewer </h2> <blockquote>  1. Open the Windows Event Viewer (  <b>Start</b> &gt;  <b>All Programs</b> &gt;  <b>Administrative Tools</b> &gt;  <b>Event Viewer</b>).  <br>  <br> 2. In the left navigation, select  <b>Applications and Services Logs &gt; AD Connector</b>. Only Active Directory Connector logs will be displayed.  <br>  <br>  <img src="https://assets.cdngetgo.com/21/25/e113ffee48fbac8666b2a65e46eb/rtaimage-eid-kac1b000000tobu-feoid-00n1b00000b8tsp-refid-0em1b0000005imr">  <br>  <br> </blockquote> <h2>See also </h2> <ul>  <li><a href="/openvoice/help/set-up-email-notification-for-adc-errors-ov700016" target="_blank">Set up email notifications for error messages</a> </li>  <li><a href="/openvoice/help/set-up-email-notification-for-adc-status-ov700017" target="_blank">Set up email notifications for daily status updates</a> </li> </ul>';
    //parse the HTML
    const parsedHTML = parse(html);

    //get the translation JSON
    const translationJSON = this.createJSON(parsedHTML);

    //translated JSON
    let translatedObj = {
      "1": "<h2>Set up Active Directory Connector v1.5 logging -in spanish</h2>",
      "2": " The Active Directory Connector (ADC) logs activities to the Windows Event Viewer.-in spanish",
      "3": " Back to .-in spanish",
      "4": "<a href='/openvoice/help/active-directory-connector-v15-ov790002' target='_blank'>Active Directory Connector Contents-in spanish</a>",
      "5": "<h2>Set up logging in the Active Directory Connector-in spanish </h2>",
      "6": "<blockquote>  1. Open the ADC and select the  <b>Operation</b> tab.  <br>  <br> 2. In the  <i>More configuration</i> section, set the  <b>Windows event logger</b>,  <b>File logger</b> and the  <b>Folder for file logging</b> as needed.  <br>  <br> 3. Click  <b>Apply changes</b> when finished. -in spanish <br>  <br>  <img src='https://assets.cdngetgo.com/0b/aa/a1b6d7f4421686c2cbaae331cdda/rtaimage-eid-kac1b000000tobu-feoid-00n1b00000b8tsp-refid-0em1b0000005imt'>  <br>  <br> </blockquote>",
      "7": "<h2>Locate ADC log files in the Windows Event Viewer -in spanish</h2>",
      "8": "<blockquote>  1. Open the Windows Event Viewer (  <b>Start</b> >  <b>All Programs</b> >  <b>Administrative Tools</b> >  <b>Event Viewer</b>).  <br>  <br> 2. In the left navigation, select  <b>Applications and Services Logs > AD Connector</b>. Only Active Directory Connector logs will be displayed.-in spanish  <br>  <br>  <img src='https://assets.cdngetgo.com/21/25/e113ffee48fbac8666b2a65e46eb/rtaimage-eid-kac1b000000tobu-feoid-00n1b00000b8tsp-refid-0em1b0000005imr'>  <br>  <br> </blockquote>",
      "9": "<h2>See also-in spanish </h2>",
      "10": "<a href='/openvoice/help/set-up-email-notification-for-adc-errors-ov700016' target='_blank'>Set up email notifications for error messages-in spanish</a>",
      "11": "<a href='/openvoice/help/set-up-email-notification-for-adc-status-ov700017' target='_blank'>Set up email notifications for daily status updates-in spanish</a>"
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
    for (var i = 0; i < htmlData.length; i++) {
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
  }
};

export default tranlationService;