import React, { Component } from 'react';
import 'react-dropdown/style.css'
import TabTable from './TabTable'
import FileInput from './FileInput'
import Dropdown from 'react-dropdown'
import Select from 'react-select'
import 'react-select/dist/react-select.css';
import './UserInterface.css'

const URL_GET_FILENAMES = 'GetAnnotationFileList.php'
const URL_GET_FILE = 'GetAnnotationFileNew.php'
const URL_GET_USERNAMES = 'GetUserNamesNew.php'
const PDF_DIR = 'pdfs/'
const URL_POST_JSON = 'PostAnnotatedJSONNew.php'

export default class UserInterface extends Component {

  constructor(props) {
    super(props);
    this.retrieveUserNames();
    this.handleUserSelectionSubmit = this.handleUserSelectionSubmit.bind(this);
    this.handleUserSelectionChange = this.handleUserSelectionChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleAnnotationSubmit = this.handleAnnotationSubmit.bind(this);
    this.retrieveFileNames = this.retrieveFileNames.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleItemCheck = this.handleItemCheck.bind(this);
    this.findItemIndex = this.findItemIndex.bind(this);
    this.state = {
      checkSelections: false,
      titles: []
    };
  }

  retrieveUserNames() {
    var httprequest = new XMLHttpRequest();
    httprequest.open('POST', URL_GET_USERNAMES, true);
    httprequest.setRequestHeader("Content-type", "application/json");
    httprequest.onreadystatechange = () => {
      if(httprequest.readyState === 4){
        var response = httprequest.responseText;
        var userNames = response.trim().split(" ");
        var users = [];
        for (var user of userNames) {
          users.push({value: user, label: user});
        }
        this.setState({users: users});
      }
    };
    httprequest.send(null);
  }

  retrieveFileNames(username) {
    var httprequest = new XMLHttpRequest();
    httprequest.open('POST', URL_GET_FILENAMES, true);
    httprequest.setRequestHeader("Content-type", "application/json");
    httprequest.onreadystatechange = () => {
      if(httprequest.readyState === 4){
        var response = httprequest.responseText;
        var fileOptions= [];
        var annotatedFilenames = [];
        var num_annotated = 0;
        var fileLists = response.trim().split("\t");
        var num_total = fileLists[0].trim().split(' ').length;

        if (fileLists.length > 1){
          num_annotated = fileLists[1].trim().split(' ').length;
          for (var filename of fileLists[1].trim().split(' ')) {
            annotatedFilenames.push(filename);
          }
          for (var filename of fileLists[0].trim().split(' ')) {
            if(annotatedFilenames.indexOf(filename) > -1) {
              fileOptions.push({value: filename, label: filename, className: 'annotated'});
            }else{
              fileOptions.push({value: filename, label: filename, className: 'unannotated'});
            }
          }
        } else {
          for (var filename of fileLists[0].trim().split(' ')) {
            fileOptions.push({value: filename, label: filename, className: 'unannotated'});
          }
        }
        this.setState({fileOptions: fileOptions, annotatedFilenames: annotatedFilenames, numAnnotated: num_annotated, numTotal: num_total});
      }
    };
    var postJson = {};
    postJson["user"] = username;
    httprequest.send(JSON.stringify(postJson));
  }

  handleFileChange(e) {
    this.setState({tabIndex: 0});
    this.state.annotatedFilenames.indexOf(e.value) > -1 ? this.handleAnnotatedFileChange(e) : this.handleUnAnnotatedFileChange(e);
  }

  handleUnAnnotatedFileChange(e){
    var filename = e.value;
    this.setState({checkSelections: false});
    var xmlrequest = new XMLHttpRequest();
    xmlrequest.open('POST', URL_GET_FILE, true);
    xmlrequest.setRequestHeader("Content-type", "application/json");
    xmlrequest.onreadystatechange = () => {
      if(xmlrequest.readyState === 4){
        var text = xmlrequest.responseText;
        var obj = JSON.parse(text);
        var xml2js = require('xml2js');
        var parser = new xml2js.Parser({trim: true});
        parser.parseString(obj['data'], (err, result) => {
          var titleArray = [];
          var titleSpanArray = [];
          var textSpanArray = [];
          var dataArray = [[]];
          var subtitleIndexArray = [[]];
          var subtitleArray = [];
          var curSentenceIndex = 1;
          var curSectionIndex = 0;
          var docTitle = result.document.sentence[1].text[0]._;
          for (var section of result.document.section){
            if(titleArray.length > 0) {
              var lastSectionEndSpan = textSpanArray[textSpanArray.length - 1];
              var thisSectionStartSpan = section.$.textSpan.split('-')[0];
              if(parseInt(thisSectionStartSpan) - parseInt(lastSectionEndSpan) > 10) {
                titleArray.push("UNNAMED");
                titleSpanArray.push((parseInt(lastSectionEndSpan) + 1).toString());
                textSpanArray.push((parseInt(thisSectionStartSpan) - 1).toString());
              }
            }
            titleArray.push(section.$.title);
            titleSpanArray.push(section.$.titleSpan.split('-')[0]);
            textSpanArray.push(section.$.textSpan.split('-')[1]);
            if (section.section) {
              Array.prototype.push.apply(subtitleArray, this.getSubTitles(section.section));
            }
          }

          for (var sentence of result.document.sentence){
            let spans = sentence.$.charOffset.split('-');
            let start = spans[0];
            let span = spans[1];
            if (!titleSpanArray.includes(start)) {
              if(parseInt(span) <= parseInt(textSpanArray[curSectionIndex])){
                dataArray[curSectionIndex].push({id: curSentenceIndex, sentence: sentence.text[0]._, sentence_id: sentence.$.id});
                if (subtitleArray.includes(sentence.text[0]._)) {
                  subtitleIndexArray[curSectionIndex].push(curSentenceIndex);
                }
              }else{
                curSectionIndex = curSectionIndex + 1;
                curSentenceIndex = 1;
                dataArray[curSectionIndex] = [];
                dataArray[curSectionIndex].push({id: curSentenceIndex, sentence: sentence.text[0]._, sentence_id: sentence.$.id});
                subtitleIndexArray[curSectionIndex] = [];
                if (subtitleArray.includes(sentence.text[0]._)) {
                  subtitleIndexArray[curSectionIndex].push(curSentenceIndex);
                }
              }
              curSentenceIndex = curSentenceIndex + 1;
            }
          }
          this.setState({titles: titleArray, data: dataArray, selectedFileName: filename,
            xmlParsedJson: result, documentTitle: docTitle, selectionValues: null, subtitleIndexArray: subtitleIndexArray});
          document.getElementById('title').setAttribute("href", PDF_DIR + filename + ".pdf");
          document.getElementById('notes').value = '';
        });
      }
    };
    var postJson = {};
    postJson["filename"] = filename;
    postJson["user"] = this.state.userName;
    xmlrequest.send(JSON.stringify(postJson));
  }

  handleAnnotatedFileChange(e){
    var filename = e.value;
    this.setState({selectedFileName: filename});
    this.setState({checkSelections: false});
    var xmlrequest = new XMLHttpRequest();
    xmlrequest.open('POST', URL_GET_FILE, true);
    xmlrequest.setRequestHeader("Content-type", "application/json");
    xmlrequest.onreadystatechange = () => {
      if(xmlrequest.readyState === 4){
        var text = xmlrequest.responseText;
        var obj = JSON.parse(text);
        var xml2js = require('xml2js');
        var parser = new xml2js.Parser({trim: true});
        parser.parseString(obj['data'], (err, result) => {
          var titleArray = [];
          var titleSpanArray = [];
          var textSpanArray = [];
          var dataArray = [[]];
          var subtitleIndexArray = [[]];
          var subtitleArray = [];
          var selectionValues = [[]];
          var curSentenceIndex = 1;
          var curSectionIndex = 0;
          selectionValues[curSectionIndex] = [];
          var docTitle = result.document.sentence[1].text[0]._;
          for (var section of result.document.section){
            if(titleArray.length > 0) {
              var lastSectionEndSpan = textSpanArray[textSpanArray.length - 1];
              var thisSectionStartSpan = section.$.textSpan.split('-')[0];
              if(parseInt(thisSectionStartSpan) - parseInt(lastSectionEndSpan) > 10) {
                titleArray.push("UNNAMED");
                titleSpanArray.push((parseInt(lastSectionEndSpan) + 1).toString());
                textSpanArray.push((parseInt(thisSectionStartSpan) - 1).toString());
              }
            }
            titleArray.push(section.$.title);
            titleSpanArray.push(section.$.titleSpan.split('-')[0]);
            textSpanArray.push(section.$.textSpan.split('-')[1]);
            if (section.section) {
              Array.prototype.push.apply(subtitleArray, this.getSubTitles(section.section));
            }
          }
          for (var sentence of result.document.sentence){
            let spans = sentence.$.charOffset.split('-');
            let start = spans[0];
            let span = spans[1];
            if (!titleSpanArray.includes(start)) {
              if(parseInt(span) <= parseInt(textSpanArray[curSectionIndex])){
                dataArray[curSectionIndex].push({id: curSentenceIndex, sentence: sentence.text[0]._, sentence_id: sentence.$.id});
                if (subtitleArray.includes(sentence.text[0]._)) {
                  subtitleIndexArray[curSectionIndex].push(curSentenceIndex);
                }
              }else{
                curSectionIndex = curSectionIndex + 1;
                curSentenceIndex = 1;
                selectionValues[curSectionIndex] = [];
                dataArray[curSectionIndex] = [];
                dataArray[curSectionIndex].push({id: curSentenceIndex, sentence: sentence.text[0]._, sentence_id: sentence.$.id});
                subtitleIndexArray[curSectionIndex] = [];
                if (subtitleArray.includes(sentence.text[0]._)) {
                  subtitleIndexArray[curSectionIndex].push(curSentenceIndex);
                }
              }

              if (!selectionValues[curSectionIndex]) {
                selectionValues[curSectionIndex] = [];
              }
              if(sentence.$.selection) {
                selectionValues[curSectionIndex][curSentenceIndex-1] = sentence.$.selection;
              }
              curSentenceIndex = curSentenceIndex + 1;
            }
          }
          this.setState({titles: titleArray, data: dataArray, selectedFileName: filename,
            xmlParsedJson: result, documentTitle: docTitle, selectionValues: selectionValues, subtitleIndexArray: subtitleIndexArray});
          document.getElementById('title').setAttribute("href", PDF_DIR + filename + ".pdf");
          document.getElementById('notes').value = result.document.$.note;
        });
      }
    };
    var postJson = {};
    postJson["filename"] = filename;
    postJson["user"] = this.state.userName;
    xmlrequest.send(JSON.stringify(postJson));
  }

  getSubTitles(section) {
    var subtitles = [];
    for ( var sec of section) {
      subtitles.push(sec.$.title);
      if (sec.section) {
        Array.prototype.push.apply(subtitles, this.getSubTitles(sec.section));
      }
    }
    return subtitles;
  }

  loadFile(fileObject){
    var reader = new FileReader();
    reader.onload = (e) => {
      var text = reader.result;
      var xml2js = require('xml2js');
      var parser = new xml2js.Parser({explicitArray: false});
      parser.parseString(text, (err, result) => {
        var titleArray = [];
        var textSpanArray = [];
        var dataArray = [[]];
        var curSentenceIndex = 1;
        var curSectionIndex = 0;
        console.log(err);
        for (var section of result.document.section.section){
          titleArray.push(section.$.title);
          textSpanArray.push(section.$.textSpan.split('-')[1]);
        }
        for (var sentence of result.document.sentence){
          let span = sentence.$.charOffset.split('-')[1];
          if (!titleArray.includes(sentence.text._)){
            if(parseInt(span) <= parseInt(textSpanArray[curSectionIndex])){
              dataArray[curSectionIndex].push({id: curSentenceIndex, sentence: sentence.text._, sentence_id: sentence.$.id});
              curSentenceIndex = curSentenceIndex + 1;
            }else{
              curSectionIndex = curSectionIndex + 1;
              dataArray[curSectionIndex] = [];
              dataArray[curSectionIndex].push({id: 1, sentence: sentence.text._, sentence_id: sentence.$.id});
              curSentenceIndex = 2;
            }
          }
        }
        this.setState({titles: titleArray, data: dataArray});
      });
    };
    reader.readAsText(fileObject);
  }

  handleUserSelectionSubmit(e){
    this.setState({userName: this.state.selectedUserName});
    this.retrieveFileNames(this.state.selectedUserName);
  }

  checkAllSelection(){
    // var selectionValues = this.state.selectionValues;
    // if (selectionValues == undefined) {
    //   return false;
    // }
    // for (var i = 0; i < this.state.data.length; i++) {
    //   if (selectionValues[i] == undefined) {
    //     return false;
    //   }
    //   for (var j = 0; j < this.state.data[i].length; j++) {
    //     if (selectionValues[i][j] == undefined) {
    //       return false;
    //     }
    //   }
    // }
    return true;
  }

  findSentenceIndex(sentence_id){
    var json = this.state.xmlParsedJson;
    var i = 0;
    while ( i < json.document.sentence.length) {
      if (json.document.sentence[i].$.id == sentence_id) {
        return i;
      }
      i++;
    }
    return -1;
  }

  saveSelectionValues(){
    var xml2js = require('xml2js');
    var builder = new xml2js.Builder();
    var json = this.state.xmlParsedJson;
    var note = document.getElementById("notes").value;
    var selection;
    json.document.$.note = note;
    for (var i = 0; i < this.state.data.length; i++){
      for (var j = 0; j < this.state.data[i].length; j++) {
        var index = this.findSentenceIndex(this.state.data[i][j].sentence_id);
        if (index != -1) {
          if (this.state.selectionValues[i]) {
            if (this.state.selectionValues[i][j]) {
              selection = this.state.selectionValues[i][j];
              json.document.sentence[index].$.selection = selection;
            }else{
              json.document.sentence[index].$.selection = '';
            }
          }else {
            json.document.sentence[index].$.selection = '';
          }
        }
      }
    }
    var xml = builder.buildObject(json);
    var postJsonRequest= new XMLHttpRequest();
    postJsonRequest.open("POST", URL_POST_JSON, true);
    postJsonRequest.setRequestHeader("Content-type", "text/xml");
    postJsonRequest.onreadystatechange = () => {
      if(postJsonRequest.readyState === 4){
        var response = postJsonRequest.responseText;
        this.retrieveFileNames(this.state.userName);
        alert(`Successfully saved.`);
      }
    };
    var postJson = {};
    postJson["xml"] = xml;
    postJson["user"] = this.state.userName;
    postJson["filename"] = this.state.selectedFileName;

    postJsonRequest.send(JSON.stringify(postJson));
  }

  handleAnnotationSubmit(e){
    if(this.checkAllSelection()){
      this.saveSelectionValues();
    }else{
      this.setState({checkSelections: true});
      alert(`Please make all selections before submitting.`);
    }
  }

  handleUserSelectionChange(e){
    this.setState({selectedUserName: e.value});
  }

  handleSelectChange(i, rowIndex, e){
    var valueArray = this.state.selectionValues || [[]];
    if (e) {
      var columnArray = valueArray[i] || [];
      var selection = '';
      for (var k = 0; k < e.length; k++) {
        selection = selection + e[k].index + ' ';
      }
      columnArray[rowIndex] = selection.trim();
      valueArray[i] = columnArray;
      this.setState({selectionValues: valueArray});
    }else{
      valueArray[i][rowIndex] = null;
      this.setState({selectionValues: valueArray});
    }
    this.setState({checkSelections: false});
  }

  handleTabChange(tabIndex) {
    this.setState({tabIndex: tabIndex});
  }

  findItemIndex() {
    var index = new Set();
    for(var i = 0; i < this.state.data.length; i++) {
      if(this.state.selectionValues){
        if(this.state.selectionValues[i]) {
          var selections = this.state.selectionValues[i];
          for(var j = 0; j < selections.length; j++) {
            if(selections[j]) {
              var selecs = selections[j].split(" ");
              for (var s of selecs) {
                if(!index.has(s)) {
                  index.add(s);
                }
              }
            }
          }
        }
      }
    }
    return index;
  }

  handleItemCheck() {
    const options = [
      { value: '1a', label: 'Title (Randomized) (1a)', index: 1},
      { value: '1b', label: 'Structured Abstract (1b)', index: 2},
      { value: 'introduction', label: 'Introduction', disabled: true, index: 3},
      { value: '2a', label: 'Background (2a)', index: 4},
      { value: '2b', label: 'Objective (2b)', index: 5},
      { value: 'methods', label: 'Methods', disabled: true, index: 6},
      { value: '3a', label: 'Trial Design (3a)', index: 7},
      { value: '3b', label: 'Changes TO Trial Design (3b)', index: 8},
      { value: '4a', label: 'Eligibility Criteria (4a)', index: 9},
      { value: '4b', label: 'Data Collection Setting (4b)', index: 10},
      { value: '5', label: 'Interventions (5)', index: 11},
      { value: '6a', label: 'Outcomes (6a)', index: 12},
      { value: '6b', label: 'Changes to Outcomes (6b)', index: 13},
      { value: '7a', label: 'Sample Size Determination (7a)', index: 14},
      { value: '7b', label: 'Interim Analyses/Stopping Guidelines (7b)', index: 15},
      { value: '8a', label: 'Random Allocation Sequence Generation (8a)', index: 16},
      { value: '8b', label: 'Randomization Type (8b)', index: 17},
      { value: '9', label: 'Allocation Concealment Mechanism (9)', index: 18},
      { value: '10', label: 'Randomization Implementation (10)', index: 19},
      { value: '11a', label: 'Blinding Procedure (11a)', index: 20},
      { value: '11b', label: 'Similarity of Interventions (11b)', index: 21},
      { value: '12a', label: 'Statistical Methods for Outcome Comparison (12a)', index: 22},
      { value: '12b', label: 'Statistical Methods for Other Analyses (12b)', index: 23},
      { value: 'results', label: 'Results', disabled: true, index: 24},
      { value: '13a', label: 'Participant Flow (13a)', index: 25},
      { value: '13b', label: 'Participant Loss and Exclusion (13b)', index: 26},
      { value: '14a', label: 'Recruitment Period/Follow-Up (14a)', index: 27},
      { value: '14b', label: 'Trial Stopping (14b)', index: 28},
      { value: '15', label: 'Baseline Data (15)', index: 29},
      { value: '16', label: 'Numbers Analyzed (16)', index: 30},
      { value: '17a', label: 'Outcome Results (17a)', index: 31},
      { value: '17b', label: 'Binary Outcome Results (17b)', index: 32},
      { value: '18', label: 'Ancillary Analyses (18)', index: 33},
      { value: '19', label: 'Harms (19)', index: 34},
      { value: 'discussion', label: 'Discussion', disabled: true, index: 35},
      { value: '20', label: 'Limitations (20)', index: 36},
      { value: '21', label: 'Generalizability (21)', index: 37},
      { value: '22', label: 'Interpretation (22)', index: 38},
      { value: 'other', label: 'Other', disabled: true, index: 39},
      { value: '23', label: 'Registry/Number (23)', index: 40},
      { value: '24', label: 'Protocol Access (24)', index: 41},
      { value: '25', label: 'Funding (25)', index: 42},
    ];
    if(!this.state.selectedFileName) {
      alert(`Please select a file first.`);
    }else {
      let params = "scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=1000,height=1300,left=200,top=100";
      var selectedItemIndex = this.findItemIndex();
      var win = window.open("", "itemcheckwindow", params);
      win.document.write("<table width='100%' border='1'>");
      win.document.write("<tr style='font-size: 18px;font-weight: bold'><td>" + this.state.selectedFileName + "</br>" + this.state.data[0][0]['sentence'] + "</td><td>Item No</td></tr>");
      for(var i = 0; i < options.length; i++) {
        if (i == 0) {
          win.document.write("<tr style='font-size: 20px;font-weight: bold'><td>Title</td></tr>");
        }
        if (i == 1) {
          win.document.write("<tr style='font-size: 20px;font-weight: bold'><td>Abstract</td></tr>");
        }
        if (i == 2) {
          win.document.write("<tr style='font-size: 20px;font-weight: bold'><td>Introduction</td></tr>");
          continue;
        }
        if (i == 5) {
          win.document.write("<tr style='font-size: 20px;font-weight: bold'><td>Methods</td></tr>");
          continue;
        }
        if (i == 23) {
          win.document.write("<tr style='font-size: 20px;font-weight: bold'><td>Results</td></tr>");
          continue;
        }
        if (i == 34) {
          win.document.write("<tr style='font-size: 20px;font-weight: bold'><td>Discussion</td></tr>");
          continue;
        }
        if (i == 38) {
          win.document.write("<tr style='font-size: 20px;font-weight: bold'><td>Other</td></tr>");
          continue;
        }
        if(selectedItemIndex.has((i+1).toString())){
          win.document.write("<tr bgcolor='#b7deb8' style='font-size: 18px'><td>" + options[i]['label'] + "</td><td>" + options[i]['value'] + "</td></tr>");
        }
        else {
          win.document.write("<tr bgcolor='#f44f0d' style='font-size: 18px'><td>" + options[i]['label'] + "</td><td>" + options[i]['value'] + "</td></tr>");
        }
      }
      win.document.write("</table>");
    }
  }

  noUserSelectedInterface(){
    const currentSelection = this.state.selectedUserName || "Select Your Name";
    return (
      <div>
        <h1 align="center" id="bigtitle"> CONSORT Annotation Tool </h1>
        <Select options={this.state.users} searchable={false} onSelectResetsInput={false} clearable={false}
          value={currentSelection} className="dropdown" onChange={this.handleUserSelectionChange}/>
        <div id="buttonwrapper">
          <button onClick={this.handleUserSelectionSubmit}> Submit </button>
        </div>
      </div>
    );
  }

  renderTable() {
    return (
      <div>
        <div class="row">
          {/*
          <div class="column left">
            <embed type="application/pdf" height="800dp" width="100%" id="pdf"/>
            <h3> Notes: </h3>
            <textarea id="notes"/>
          </div>

          <div class="column right">
            {/*<div id="filepickerwrapper">
              <FileInput  onFileLoaded={this.handleFileLoaded}/>
            </div>*/}
          <div id="titlediv">
            <a target="_blank" id="title">{this.state.documentTitle}</a>
            {/*<h2 id="title">{this.state.documentTitle}</h2>*/}
          </div>
          <div id="tabtablewrapper">
            <TabTable titles={this.state.titles} data={this.state.data} onSelectChange={this.handleSelectChange}
                selectionValues={this.state.selectionValues} checkSelections={this.state.checkSelections}
                subtitleIndexArray={this.state.subtitleIndexArray} tabIndex={this.state.tabIndex}
                handleTabIndexChange={this.handleTabChange}/>
          </div>
        </div>

        <div>
          <div class="bottom notewrapper">
            <h3> Notes: </h3>
            <textarea id="notes"/>
          </div>
          <div class="bottom submitbuttonwrapper">
            <button onClick={this.handleAnnotationSubmit}> Submit </button>
          </div>
        </div>
      </div>
    );
  }

  userSelectedInterface(){
    const currentFileName = this.state.selectedFileName || "Select File";
    return (
      <div>
        <div>
          <h1 align="center" id="header"> CONSORT Annotation Tool</h1>
          <a href="CONSORT-guideline.pdf" target="_blank" align="right">See Guideline</a>
          <div class="infos">
            <div class="filedropdown">
              <Dropdown options={this.state.fileOptions} placeholder={currentFileName} onChange={this.handleFileChange}/>
            </div>
            <div class="progressbar">
              <h3>{this.state.numAnnotated} out of {this.state.numTotal} partially annotated</h3>
              {/*<progress value={this.state.numAnnotated} max={this.state.numTotal} />*/}
            </div>
            <div class="itemcheckbuttonwrapper">
              <button class="itemcheckbutton" onClick={this.handleItemCheck}> Item Check </button>
            </div>
          </div>
        </div>
        {this.state.selectedFileName ? this.renderTable() : <h1> no table available </h1>}
      </div>
    );
  }

  render(){
    return this.state.userName ? this.userSelectedInterface() : this.noUserSelectedInterface();
  }
}
