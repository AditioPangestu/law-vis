import React, {Component} from "react";
import axios from "axios";
import _ from "lodash";

import StoryCurve from "./story-curve";
import CharacterVis from "./character-vis";

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
        <div>
          <StoryCurve
            width={500}
            height={300}
            data={this.state.data}
            horizontal_white_space={0.1}/>
          <CharacterVis
            width={500}
            height={100}
            data={this.state.data}
            horizontal_white_space={0.1}
            vertical_white_space={0.2}/>
        </div>
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