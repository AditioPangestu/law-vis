import React, {Component} from "react";
import PropTypes from "prop-types";
import moment from "moment";
import _ from "lodash";

import { ScrollToHOC, ScrollArea } from "react-scroll-to";

import StoryDetail from "./story-detail";

class StoryDetailContainer extends Component {
  
  constructor(props){
    super(props);

    this.state = {
      closed_details : [true,true],
      default_closed_details : [true,true],
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
      closed_details: closed_details,
      default_closed_details: closed_details
    });
  }

  onChangeClose(index){
    const datum = this.props.data.events[index];
    var temp = _.clone(this.state.closed_details,true);
    temp[index] = !temp[index];
    if(!temp[index]){
      this.props.handleMouseOver({
        x0: (datum.x + this.props.horizontal_white_space),
        x: (datum.x + 1 - this.props.horizontal_white_space),
      })
    } else {
      this.props.handleMouseOver(null);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.highlighted_data, nextProps.highlighted_data)) {
      if (!_.isEmpty(nextProps.highlighted_data) && (!nextProps.highlighted_data.stay_close) && nextProps.highlighted_data.x0 && nextProps.highlighted_data.x){
        const index = _.findIndex(this.props.data.events, (datum)=>{
          return (datum.x == (Math.ceil(nextProps.highlighted_data.x0 - this.props.horizontal_white_space)));
        })
        if (index != -1) {
          const closed_details = _.clone(this.state.default_closed_details,true);
          closed_details[index] = false;
          this.setState({
            ...this.state,
            closed_details: closed_details,
          },()=>{
            this.props.scroll(0, index * (43 + index));
          });
        }
      } else if ((nextProps.highlighted_data==null) || !nextProps.highlighted_data.stay_open){
        this.setState({
          ...this.state,
          closed_details: this.state.default_closed_details,
        });
      }
    }
  }

  render(){
    return (
      <div className="story-detail-container">
        <figure className="image is-16by9">
          <img src={this.props.data.image_url}/>
        </figure>
        <ScrollArea 
          style={{
            flex : 2,            
            overflowY:"scroll",
            height:"484px"
          }}>
          {_.map(this.props.data.events,(datum,index)=>{
            return (
            <StoryDetail
              key={index}
              onChangeClose={()=>this.onChangeClose(index)}
              onMouseOver={() => {
                const opened_index = _.findIndex(this.state.closed_details, (closed_detail) => {
                  return !closed_detail;
                })
                if (opened_index == -1){
                  this.props.handleMouseOver({
                    x0: (datum.x + this.props.horizontal_white_space),
                    x: (datum.x + 1 - this.props.horizontal_white_space),
                    stay_close : true,
                  });
                } else {
                    this.props.handleMouseOver({
                      x0: (datum.x + this.props.horizontal_white_space),
                      x: (datum.x + 1 - this.props.horizontal_white_space),
                      stay_close : true,
                      stay_open : true,
                    });
                }
              }}
              onMouseLeave={()=>this.props.handleMouseOver({stay_open:true})}
              close={this.state.closed_details[index]}
              event_components={datum.event_components}
              url={datum.url}
              event_name={datum.event_name}
              published_date={datum.published_date}/>
            );
          })}
        </ScrollArea>
      </div>
    );
  }
}

StoryDetailContainer.propTypes = {
  handleMouseOver: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  horizontal_white_space: PropTypes.number.isRequired,
};

export default ScrollToHOC(StoryDetailContainer);