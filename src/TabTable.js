import React, { Component } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import BootstrapTable from 'react-bootstrap-table-next'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import 'react-tabs/style/react-tabs.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import './TabTable.css';

const options = ["one", "two", "three"]

export default class TabTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [{id: 1, sentence: "s1"}, {id: 2, sentence: "s2"},
        {id: 3, sentence: "s3"}],
      columns: [{dataField: "id", text: "ID", attrs: {width: "10%", textAlign: "center"}},
                {dataField: "sentence", text: "SENTENCE", attrs: {width: "65%"}},
                {dataField: "critique", text: "CRITIQUE", formatter: (cell, row, rowIndex, colIndex) => {
                  return <Dropdown options={options} placeholder="Select an option" width="25%"/>;
        }}],

    };
  }

  render() {
    return (
      <div>
        <Tabs>
          <TabList>
            {Array(this.props.titles.length).fill().map((e,i) => <Tab> {this.props.titles[i]} </Tab>)}
          </TabList>

          <div>
          {Array(this.props.titles.length).fill().map(
            (e,i) =>  <TabPanel>
                        <BootstrapTable keyField="id" data={this.props.data[i]} columns={this.state.columns}
                        striped hover condensed/>
                      </TabPanel>)}
          </div>
        </Tabs>
      </div>
    );
  }
}
