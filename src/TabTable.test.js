import React from 'react';
import ReactDOM from 'react-dom';
import TabTable from './TabTable';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<TabTable />, div);
  ReactDOM.unmountComponentAtNode(div);
});
