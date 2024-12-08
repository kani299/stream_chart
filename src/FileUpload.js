import React, { Component } from "react";

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
    };
  }

  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const json = this.csvToJson(text);
        this.props.set_data(json); // Pass parsed data to parent
      };
      reader.readAsText(file);
    }
  };

  csvToJson = (csv) => {
    const lines = csv.split("\n").map((line) => line.trim()); 
    const headers = lines[0].split(",").map((header) => header.trim()); 
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(",").map((value) => value.trim());
      if (currentLine.length === headers.length) 
      { 
        const row = {};
        headers.forEach((header, index) => {
          if (header === "Date") 
          {
            row[header] = currentLine[index]; 
          } else 
          {
            row[header] = parseFloat(currentLine[index]) || 0; 
          }
        });
        result.push(row);
      }
    }

    return result;
  };

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 20 }}>
        <h2>Upload a CSV File</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input
            type="file"
            accept=".csv"
            onChange={(event) => this.setState({ file: event.target.files[0] })}
          />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;
