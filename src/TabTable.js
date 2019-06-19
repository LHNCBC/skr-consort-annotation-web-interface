import React, { Component } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './TabTable.css';
import MyTable from './MyTable'

export default class TabTable extends Component {
  render() {
    return (
      <div>
        <Tabs selectedIndex={this.props.tabIndex} onSelect={this.props.handleTabIndexChange}>
          <TabList>
            {Array(this.props.titles.length).fill().map((e,i) => <Tab> {this.props.titles[i]} </Tab>)}
          </TabList>

          <div>
          {Array(this.props.titles.length).fill().map(
            (e,i) =>
                      this.props.selectionValues ?
                      <TabPanel>
                        <MyTable KeyField="id" data={this.props.data[i]} columnValues={this.props.selectionValues[i]} tabID={i}
                        onSelectChange={this.props.onSelectChange.bind(this, i)} checkSelections={this.props.checkSelections}
                        subtitleIndexArray={this.props.subtitleIndexArray[i]}/>
                      </TabPanel>
                      :
                      <TabPanel>
                        <MyTable KeyField="id" data={this.props.data[i]} tabID={i}
                        onSelectChange={this.props.onSelectChange.bind(this, i)} checkSelections={this.props.checkSelections}
                        subtitleIndexArray={this.props.subtitleIndexArray[i]}/>
                      </TabPanel>)}

          </div>
        </Tabs>
      </div>
    );
  }
}
