import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import Select from 'react-select'
import 'react-select/dist/react-select.css';
import './MyTable.css';

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


export default class MyTable extends Component {

  constructor(props) {
    super(props);
    //this.trStyle = this.trStyle.bind(this);
    this.state = {
      columns: [{dataField: "id", text: "ID", attrs: {width: "3%", textAlign: "center"}},
                {dataField: "sentence", text: "SENTENCE", attrs: {width: "72%"}, classes: (cell, row, rowIndex, colIndex) => {
                  return this.props.subtitleIndexArray.includes(rowIndex+1) ? 'example1' : 'example2';
                }},
                {dataField: "category", text: "CATEGORY", formatter: (cell, row, rowIndex, colIndex) => {
                    return this.props.columnValues && this.props.columnValues[rowIndex] ?
                      <Select options={options} closeOnSelect={true} multi removeSelected={true} searchable ={true}
                      width="25%" onChange={this.props.onSelectChange.bind(this, rowIndex)} value={this.getSelectionTurples(this.props.columnValues[rowIndex])}/>
                      :
                      (this.props.checkSelections ?
                      <Select options={options} closeOnSelect={true} multi removeSelected={true} searchable ={true}
                      width="25%" onChange={this.props.onSelectChange.bind(this, rowIndex)} id="unselected"/>
                      :
                      <Select options={options} closeOnSelect={true} multi removeSelected={true} searchable ={true}
                      width="25%" onChange={this.props.onSelectChange.bind(this, rowIndex)}/>);
                  }}]
      };
  }

  getSelectionTurples(turpleString) {
    var turpleIndexArray = turpleString.split(' ');
    var turples = turpleIndexArray.map(i => options[parseInt(i)-1]);
    return turples;
  }

  // trStyle = (row, rowIndex) => {
  //   return this.props.columnValues && this.props.columnValues[rowIndex] ?
  //     { backgroundColor: '#40E0D0' }
  //     :
  //     { backgroundColor: '#D3D3D3' };
  // }

  render() {
    return (
      <BootstrapTable keyField="id" //rowStyle={this.trStyle}
        data={this.props.data} columns={this.state.columns}
        striped hover condensed>
      </BootstrapTable>
    );
  }
}
