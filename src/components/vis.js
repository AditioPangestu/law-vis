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
    axios.get("./src/data/simple.json")
      .then((response)=>{
        var { data }  = response;
        this.setState({
          data: data.sort((a, b) => { return a.y - b.y })
        });
      })
  }

  render(){
    if (this.state.data.length){
      return (
        <StoryCurve
          data={this.state.data}
          horizontal_white_space={0.1}/>
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

export default Vis;