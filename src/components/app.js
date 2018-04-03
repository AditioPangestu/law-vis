import React, { Component } from 'react';
import Vis from "./vis";

export default class App extends Component {

  constructor(props){
    super(props);
  }
  
  render() {
    return (
      <section className="section">
        <div className="columns">
          <div className="column is-9">
            <Vis/>
          </div>
          <div className="column is-3">
            Test
          </div>
        </div>
      </section>
    );
  }
}
