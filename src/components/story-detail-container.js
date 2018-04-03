import React, {Component} from "react";
import PropTypes from "prop-types";
import moment from "moment";
import _ from "lodash";

import StoryDetail from "./story-detail";

class StoryDetailContainer extends Component {
  
  constructor(props){
    super(props);

    this.state = {
      opened_detail_position : [],
    }
  }

  render(){
    return (
      <div>
        <figure className="image is-16by9">
          <img src="https://bulma.io/images/placeholders/640x360.png"/>
        </figure>
        <div>
          {_.map(this.props.data,(datum,index)=>{

            return 
          })}
        </div>
      </div>
    );
  }
}