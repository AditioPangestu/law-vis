import React, {Component} from "react";
import PropTypes from "prop-types";
import moment from "moment";
import _ from "lodash";
import ReactDOM from 'react-dom';

import { ScrollToHOC, ScrollArea } from "react-scroll-to";

import StoryDetail from "./story-detail";

class StoryDetailContainer extends Component {
  
  constructor(props){
    super(props);

    this.state = {
      closed_details : [true,true],
      default_closed_details : [true,true],
      query : "",
      events : []
    }
    this.onChangeClose = this.onChangeClose.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
  }

  componentWillMount(){
    const length = this.props.data.events.length;
    var closed_details = []
    for (var i=0;i<length;i++){
      closed_details.push(true);
    }
    this.setState({
      closed_details: closed_details,
      default_closed_details: closed_details,
      events : this.props.data.events
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
        from: "story"
      })
    } else {
      if(this.props.clicked){
        this.props.onClickForView();
      }
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
          if(nextProps.highlighted_data.from == "story"){
            var closed_details = _.clone(this.state.default_closed_details,true);
            closed_details[index] = false;
            this.setState({
              closed_details: closed_details,
            },()=>{
              const offset_top = document.getElementById('story-detail-' + index).offsetTop;            
              this.props.scroll(0, offset_top-5);
            });
          } else {
            const length = this.props.data.events.length;
            var default_closed_details = []
            var closed_details = []
            for (var i = 0; i < length; i++) {
              closed_details.push(true);
              default_closed_details.push(true);
            }
            closed_details[index] = false;
            this.setState({
              query: "",
              events: this.props.data.events,
              closed_details: closed_details,
              default_closed_details: default_closed_details,
            }, () => {
              const offset_top = document.getElementById('story-detail-' + index).offsetTop;
              this.props.scroll(0, offset_top - 5);
            });
          }
        }
      } else if ((nextProps.highlighted_data==null) || !nextProps.highlighted_data.stay_open){
        this.setState({
          closed_details: this.state.default_closed_details,
        });
      }
    }
    if(!_.isEqual(this.props.data, nextProps.data)){
      const length = nextProps.data.events.length;
      var closed_details = []
      for (var i = 0; i < length; i++) {
        closed_details.push(true);
      }
      this.setState({
        closed_details: closed_details,
        default_closed_details: closed_details,
        events : nextProps.data.events
      });
    }
  }

  handleSearchChange(event) {
    const query = event.target.value
    this.setState({ query: query });
    if (_.size(query) != 0){
      const new_event = _.filter(this.props.data.events, (event)=>{
        return (_.includes(event.event_name.toLowerCase(),query.toLowerCase()));
      });
      const length = new_event.length;
      var closed_details = []
      for (var i = 0; i < length; i++) {
        closed_details.push(true);
      }
      this.setState({ 
        events: new_event,
        closed_details: closed_details,
        default_closed_details: closed_details,
      });
    } else {
      const length = this.props.data.events.length;
      var closed_details = []
      for (var i = 0; i < length; i++) {
        closed_details.push(true);
      }
      this.setState({ 
        events: this.props.data.events,
        closed_details: closed_details,
        default_closed_details: closed_details,
      });
    }
  }

  render(){
    return (
      <div className="story-detail-container">
        <figure className="image is-16by9">
          <img src={this.props.data.image_url}/>
        </figure>
        <div className="field"
          style={{
            margin: ".5rem 0rem"
          }}>
          <p className="control has-icons-right">
            <input
              disabled={this.props.clicked}
              value={this.state.query}
              onFocus={() => this.props.handleMouseOver({})}
              onChange={this.handleSearchChange}
              className="input is-small" type="text" placeholder="Masukkan nama kejadian"/>
              <span className="icon is-small is-right">
              <i className="fas fa-search"></i>
              </span>
          </p>
        </div>
        <ScrollArea 
          style={{
            position: "relative",
            flex : 2,            
            overflowY:"scroll",
            height: ((222 + 25*3 + 18*(this.props.location_length + this.props.time_length + this.props.character_length))+"px")
          }}>
          {_.map(this.state.events,(datum,index)=>{
            return (
            <StoryDetail
              key={index}
              index={index}
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
              onMouseLeave={()=> {
                if (!this.props.clicked) {
                  this.props.handleMouseOver({stay_open:true})
                }
              }}
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