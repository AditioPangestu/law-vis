import React, {Component} from "react";
import axios from "axios";
import _ from "lodash";

import StoryCurve from "./story-curve";

class Vis extends Component {
  constructor(props){
    super(props);
    this.state = { data : []};
  }

  componentWillMount(){
    axios.get("../data/simple.json")
      .then((response)=>{
        var { data }  = response;
        this.state({
          data: _.sortBy(data, (value) => {
            return value.y;
          })
        });
      })
  }

  render(){
    if (this.state.data.length){
      return (
        <StoryCurve data={this.state.data}/>
      );
    } else {
      return (
        <div>
          Loading...
        </div>
      )
    }
  }
}
