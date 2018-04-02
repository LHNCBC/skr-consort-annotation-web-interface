import React, { Component } from 'react';
import './UserInterface.css'
import TabTable from './TabTable'
import FileInput from './FileInput'

export default class UserInterface extends Component {

  constructor(props) {
    super(props);
    this.handleFileLoaded = this.handleFileLoaded.bind(this);
    this.state = {
      titles: [],
      sentences: null
    };
  }

  handleFileLoaded(fileObject){
    var reader = new FileReader();
    reader.onload = (e) => {
      var text = reader.result;
      var xml2js = require('xml2js');
      var parser = new xml2js.Parser({explicitArray: false});
      parser.parseString(text, (err, result) => {
        var titleArray = [];
        var textSpanArray = [];
        var dataArray = [[]];
        var data = [];
        var curSentenceIndex = 1;
        var curSectionIndex = 0;
        for (var section of result.document.section.section){
          titleArray.push(section.$.title);
          textSpanArray.push(section.$.textSpan.split('-')[1]);
        }
        for (var sentence of result.document.sentence){
          let span = sentence.$.charOffset.split('-')[1];
          if (!titleArray.includes(sentence.text._)){
            if(parseInt(span) <= parseInt(textSpanArray[curSectionIndex])){
              dataArray[curSectionIndex].push({id: curSentenceIndex, sentence: sentence.text._});
              curSentenceIndex = curSentenceIndex + 1;
            }else{
              curSectionIndex = curSectionIndex + 1;
              dataArray[curSectionIndex] = [];
              dataArray[curSectionIndex].push({id: 1, sentence: sentence.text._});
              curSentenceIndex = 2;
            }
          }
        }
        // alert(
        //   titleArray.includes("Objective") ?
        //   `Selected file - ${JSON.stringify(textSpanArray[4])}` : `none`
        // );
        this.setState({titles: titleArray, data: dataArray});
      });
    };
    reader.readAsText(fileObject);
  }

  render(){
    return (
      <div>
        <div class="row">
          <div class="column left">
            <embed src="pdf_example.pdf" type="application/pdf" height="1000dp" width="100%" />
          </div>

          <div class="column right">
            <div id="filepickerwrapper">
              <FileInput  onFileLoaded={this.handleFileLoaded}/>
            </div>
            <div>
              <TabTable titles={this.state.titles} data={this.state.data}/>
            </div>
          </div>
        </div>

        <div id="buttonwrapper">
          <button type="button"> Submit </button>
        </div>
      </div>
    );
  }
}
