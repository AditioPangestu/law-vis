import React, {Component} from "react";
import axios from "axios";
import _ from "lodash";

import StoryCurve from "./story-curve";

class VIs extends Component {
  constructor(props){
    super(props);
    this.state = { data : []};
  }

  componentWillMount(){
    axios.get("../data/simple.json")
      .then((response)=>{
        
      })
  }

  render(){
    return (

    );
  }
}
