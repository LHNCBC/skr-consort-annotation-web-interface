import React, { Component } from 'react';
import "./fileinput.css"

export default class FileInput extends Component {

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onFileLoaded(this.fileInput.files[0]);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} id="filepickerwrapper">
        <label>
          Upload file:
          <input
            type="file"
            ref={input => {
              this.fileInput = input;
            }}
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    );
  }
}
