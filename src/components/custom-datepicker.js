import React, { Component } from "react";
import moment from "moment";

export default class CustomDatepicker extends Component {

  render() {
    return (
      <b>
        <span style={{ borderBottom: "1.5px solid #4a4a4a" }}
          className="example-custom-input"
          onClick={this.props.onClick}>
          {this.props.value}
        </span> - Sekarang
      </b>
    );
  }
}