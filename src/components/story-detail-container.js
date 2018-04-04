import React, {Component} from "react";
import PropTypes from "prop-types";
import moment from "moment";
import _ from "lodash";

import StoryDetail from "./story-detail";

class StoryDetailContainer extends Component {
  
  constructor(props){
    super(props);

    this.state = {
      closed_details : [true,true],
    }
    this.onChangeClose = this.onChangeClose.bind(this);
  }

  componentWillMount(){
    const length = this.props.data.events.length;
    var closed_details = []
    for (var i=0;i<length;i++){
      closed_details.push(true);
    }
    this.setState({
      ...this.state,
      closed_details: closed_details
    });
  }

  onChangeClose(index){
    var temp = _.clone(this.state.closed_details,true);
    temp[index] = !temp[index];
    this.setState({
      ...this.state,
      closed_details : temp
    });
  }

  render(){
    return (
      <div>
        <figure className="image is-16by9">
          <img src={this.props.data.image_url}/>
        </figure>
        <div>
          {_.map(this.props.data.events,(datum,index)=>{
            return (
            <StoryDetail
              key={index}
              onChangeClose={()=>this.onChangeClose(index)}
              onMouseOver={() => this.props.handleMouseOver({
                x0: (datum.x + this.props.horizontal_white_space),
                x: (datum.x + 1 - this.props.horizontal_white_space),
              })}
              onMouseLeave={()=>this.props.handleMouseOver(null)}
              close={this.state.closed_details[index]}
              event_components={datum.event_components}
              url={datum.url}
              event_name={datum.event_name}
              published_date={datum.published_date}/>
            );
          })}
        </div>
      </div>
    );
  }
}

StoryDetailContainer.propTypes = {
  handleMouseOver: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  horizontal_white_space: PropTypes.number.isRequired,
};

export default StoryDetailContainer;