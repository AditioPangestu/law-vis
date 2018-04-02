import React, {Component} from "react";
import axios from "axios";
import _ from "lodash";

import StoryCurve from "./story-curve";
import CharacterVis from "./character-vis";

class Vis extends Component {
  constructor(props){
    super(props);
    this.state = { data : [], highlighted_data : {}};
    this.handleMouseOver = this.handleMouseOver.bind(this);
  }

  componentWillMount(){
    axios.get("./src/data/simple.json")
      .then((response)=>{
        var { data }  = response;
        this.setState({
          ...this.state,
          data: data.sort((a, b) => { return a.y - b.y })
        });
      })
  }

  handleMouseOver(data) {
    this.setState({ 
      ...this.state,
      highlighted_data : data
    });
  }

  render(){
    if (this.state.data.length){
      return (
        <div>
          <StoryCurve
            highlighted_data={this.state.highlighted_data}
            handleMouseOver={this.handleMouseOver}
            xDomain={[0, this.state.data.length]}
            width={800}
            height={300}
            data={this.state.data}
            horizontal_white_space={0.1}/>
          <CharacterVis
            highlighted_data={this.state.highlighted_data}
            handleMouseOver={this.handleMouseOver}
            xDomain={[0, this.state.data.length]}
            width={800}
            height={20}
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