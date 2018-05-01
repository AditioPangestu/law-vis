import React, {Component} from "react";
import axios from "axios";
import _ from "lodash";

import StoryCurve from "./story-curve";
import CharacterVis from "./character-vis";
import LocationVis from "./location-vis";
import TimeVis from "./time-vis";
import StoryDetailContainer from "./story-detail-container";
import index from "react-vis/dist/radar-chart";

class Vis extends Component {
  constructor(props){
    super(props);
    this.state = { 
      data : [],
      highlighted_data : {},
      current_x0_window : 0,
      current_x_window : 0,
      default_x0_window : 0,
      default_x_window : 0,
      width : 800,
      prev_absis : 0,
      is_mouse_down : false,
      adjust_viewed_character: ["all"], //By color
      adjust_viewed_location: ["all"], //By color
      adjust_viewed_time: ["all"], //By color
      location_length : 0,
      character_length : 0,
      time_length : 0,
      clicked : false,
    };
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.onZoomIn = this.onZoomIn.bind(this);
    this.onZoomOut = this.onZoomOut.bind(this);
    this.onPanLeft = this.onPanLeft.bind(this);
    this.onPanRight = this.onPanRight.bind(this);
    this.onResetZoom = this.onResetZoom.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onResetViewedCharacter = this.onResetViewedCharacter.bind(this);
    this.onAddViewedCharacter = this.onAddViewedCharacter.bind(this);
    this.onHideAllCharacter = this.onHideAllCharacter.bind(this);
    this.onResetViewedLocation = this.onResetViewedLocation.bind(this);
    this.onAddViewedLocation = this.onAddViewedLocation.bind(this);
    this.onHideAllLocation = this.onHideAllLocation.bind(this);
    this.onResetViewedTime = this.onResetViewedTime.bind(this);
    this.onAddViewedTime = this.onAddViewedTime.bind(this);
    this.onHideAllTime = this.onHideAllTime.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onClick(){
    this.setState({
      clicked: !this.state.clicked
    })
  }

  componentWillMount(){
    axios.get("./src/data/color-template.json")
      .then((response)=>{
        const color_template = response.data;
        axios.get("./src/data/real-data-2.json")
          .then((response)=>{
            var { data }  = response;
            data.events = this.addColorAttribute(data.events,color_template);
            this.setState({
              
              story_detail_data: data,
              data: data.events.sort((a, b) => { return a.y - b.y }),
              current_x_window: data.events.length,
              default_x_window: data.events.length,
            });
          })
      })
  }

  addColorAttribute(events,color_template){
    var location_added = [];
    const result = _.map(events, (datum)=>{
      var temp = {...datum};
      temp.characters = _.map(datum.characters, (character)=>{
        const char_index = _.findIndex(color_template.character, 
          (value) => {return (value.role==character.role)}
        );
        if (char_index!=-1){
          character.color = color_template.character[char_index].color;
        }
        return character;
      });
      if (!_.isEmpty(temp.time)) {
        const time_index = _.findIndex(color_template.time,
          (value) => { return (value.name == datum.time.name) }
        );
        if (time_index != -1) {
          temp.time.color = color_template.time[time_index].color;
        }
      }
      if (!_.isEmpty(temp.location)) {
        const loc_index = _.findIndex(location_added,
          (value) => { return (value.name == datum.location.name) }
        );
        if (loc_index == -1){
          temp.location.color = color_template.location[location_added.length];
          location_added.push({
            name: temp.location.name,
            color: temp.location.color
          });
        } else {
          temp.location.color = location_added[loc_index].color;
        }
      }
      return temp;
    });
    return result;
  }

  handleMouseOver(data) {
    this.setState({ 
      highlighted_data : data
    });
  }

  onZoomIn() {
    if ((this.state.current_x_window - this.state.current_x0_window) > (this.state.default_x_window/8)) {
      this.setState({
        current_x_window: (this.state.current_x_window - this.state.default_x_window/32),
        current_x0_window: (this.state.current_x0_window + this.state.default_x_window / 32)
      });
    }
  }

  onZoomOut() {
    const current_x_window = this.state.current_x_window + this.state.default_x_window / 32;
    const current_x0_window = this.state.current_x0_window - this.state.default_x_window / 32;
    if ((this.state.current_x_window - this.state.current_x0_window) < this.state.default_x_window) {
      this.setState({
        
        current_x_window: ((current_x_window > this.state.default_x_window) ? this.state.default_x_window : current_x_window),
        current_x0_window: ((current_x0_window < this.state.default_x0_window) ? this.state.default_x0_window : current_x0_window)
      });
    }
  }

  onPanLeft() {
    const current_x0_window = this.state.current_x0_window - this.state.default_x_window / 8;
    const current_x_window = this.state.current_x_window - this.state.default_x_window / 8;
    if (this.state.current_x0_window > this.state.default_x0_window) {
      this.setState({
        
        current_x0_window: ((current_x0_window < this.state.default_x0_window) ? this.state.default_x0_window : current_x0_window),
        current_x_window: current_x_window,
      });
    }
  }

  onPanRight() {
    const current_x0_window = this.state.current_x0_window + this.state.default_x_window / 8;
    const current_x_window = this.state.current_x_window + this.state.default_x_window / 8;
    if (this.state.current_x_window < this.state.default_x_window) {
      this.setState({
        current_x0_window: current_x0_window,
        current_x_window: ((current_x_window > this.state.default_x_window) ? this.state.default_x_window : current_x_window),
      });
    }
  }

  onResetZoom() {
    this.setState({
      current_x0_window: this.state.default_x0_window,
      current_x_window: this.state.default_x_window,
    });
  }

  onMouseDown(event) {
    event.preventDefault();
    this.setState({
      prev_absis: event.clientX,
      is_mouse_down: true
    });
  }
  
  onMouseUp(event) {
    event.preventDefault();
    this.setState({
      prev_absis: 0,
      is_mouse_down: false
    });
  }

  onMouseMove(event) {
    event.preventDefault();
    if(this.state.is_mouse_down){
      const diff = ((event.clientX - this.state.prev_absis) / (this.state.width - 100))*16;
      const current_x0_window = this.state.current_x0_window - diff;
      const current_x_window = this.state.current_x_window - diff;
      if ((diff < 0) && (this.state.current_x_window < this.state.default_x_window)) {
        this.setState({
          prev_absis : event.clientX,
          current_x0_window: current_x0_window,
          current_x_window: ((current_x_window > this.state.default_x_window) ? this.state.default_x_window : current_x_window),
        });
      } else if ((diff > 0) && (this.state.current_x0_window > this.state.default_x0_window)) {
        this.setState({
          prev_absis: event.clientX,
          current_x0_window: ((current_x0_window < this.state.default_x0_window) ? this.state.default_x0_window : current_x0_window),
          current_x_window: current_x_window,
        });
      }
    }
  }

  onWheel(event){
    event.preventDefault();
    if(event.deltaY < 0){
      this.onZoomOut();
    } else {
      this.onZoomIn();
    }
  }

  onAddViewedCharacter(character_color){
    var find = false;
    var new_adjust = [];
    for (var i = 0; i < this.state.adjust_viewed_character.length;i++){
      const color = this.state.adjust_viewed_character[i];
      if (color != "all") {
        if (color != character_color) {
          new_adjust.push(color);
        } else {
          find = true;
        }
      }
    }
    if(!find){
      new_adjust.push(character_color);
    }
    this.setState({
      adjust_viewed_character: new_adjust
    });
  }

  onResetViewedCharacter(){
    this.setState({
      adjust_viewed_character: ["all"]
    });
  }

  onHideAllCharacter() {
    this.setState({
      adjust_viewed_character: []
    });
  }

  onAddViewedLocation(location_color) {
    var find = false;
    var new_adjust = [];
    for (var i = 0; i < this.state.adjust_viewed_location.length; i++) {
      const color = this.state.adjust_viewed_location[i];
      if(color != "all"){
        if (color != location_color) {
          new_adjust.push(color);
        } else {
          find = true;
        }
      }
    }
    if (!find) {
      new_adjust.push(location_color);
    }
    this.setState({
      adjust_viewed_location: new_adjust
    });
  }

  onResetViewedLocation() {
    this.setState({
      adjust_viewed_location: ["all"]
    });
  }

  onHideAllLocation() {
    this.setState({
      adjust_viewed_location: []
    });
  }

  onAddViewedTime(time_color) {
    var find = false;
    var new_adjust = [];
    for (var i = 0; i < this.state.adjust_viewed_time.length; i++) {
      const color = this.state.adjust_viewed_time[i];
      if(color != "all"){
        if (color != time_color) {
          new_adjust.push(color);
        } else {
          find = true;
        }
      }
    }
    if (!find) {
      new_adjust.push(time_color);
    }
    this.setState({
      adjust_viewed_time: new_adjust
    });
  }

  onResetViewedTime() {
    this.setState({
      adjust_viewed_time: ["all"]
    });
  }

  onHideAllTime() {
    this.setState({
      adjust_viewed_time: []
    });
  }

  renderLeftVis(){
    return (
      <div className="vis">
        <p className="title">{this.state.story_detail_data.title}</p>
        <div
          onClick={this.onPanLeft}
          style={{ width: "102px" }}
          className="button is-small">
          <span className="icon">
            <i className="fas fa-arrow-left"></i>
          </span>
          <span>Geser Kiri</span>
        </div>
        <div
          onClick={this.onPanRight}
          style={{ width: "102px" }}
          className="button is-small">
          <span className="icon">
            <i className="fas fa-arrow-right"></i>
          </span>
          <span>Geser Kanan</span>
        </div>
        <div
          onClick={this.onZoomIn}
          style={{ width: "102px" }}
          className="button is-small">
          <span className="icon">
            <i className="fas fa-search-plus"></i>
          </span>
          <span>Perbesar</span>
        </div>
        <div
          onClick={this.onZoomOut}
          style={{ width: "102px" }}
          className="button is-small">
          <span className="icon">
            <i className="fas fa-search-minus"></i>
          </span>
          <span>Perkecil</span>
        </div>
        <div
          onClick={this.onResetZoom}
          style={{width:"102px"}}
          className="button is-small">
          <span className="icon">
            <i className="fas fa-compress"></i>
          </span>
          <span>Ukuran Awal</span>
        </div>
        <div
          className="button is-static is-small"
          style={{ backgroundColor: "white", color:"#363636"}}>
          <span>Pertahankan Pentunjuk {` (${this.state.clicked ? "Aktif" : "Tidak Aktif"})`}</span>
        </div>
        <div
          onWheel={this.onWheel}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseMove={this.onMouseMove}
          style={{
            width: this.state.width,
          }}>
          <StoryCurve
            adjust_viewed_time={this.state.adjust_viewed_time}
            adjust_viewed_character={this.state.adjust_viewed_character}
            adjust_viewed_location={this.state.adjust_viewed_location}
            highlighted_data={this.state.highlighted_data}
            handleMouseOver={this.handleMouseOver}
            xDomain={[this.state.current_x0_window, this.state.current_x_window]}
            width={this.state.width}
            height={350}
            data={this.state.data}
            clicked={this.state.clicked}
            onClickForView={this.onClick}
            horizontal_white_space={0.1} />
        </div>
        <CharacterVis
          setCharacterLength={function(value){this.setState({character_length:value});console.log(value)}.bind(this)}
          adjust_viewed_character={this.state.adjust_viewed_character}
          onHideAllCharacter={this.onHideAllCharacter}
          onAddViewedCharacter={this.onAddViewedCharacter}
          onResetViewedCharacter={this.onResetViewedCharacter}
          highlighted_data={this.state.highlighted_data}
          handleMouseOver={this.handleMouseOver}
          xDomain={[this.state.current_x0_window, this.state.current_x_window]}
          width={this.state.width}
          height={10}
          data={this.state.data}
          clicked={this.state.clicked}
          onClickForView={this.onClick}
          horizontal_white_space={0.1}
          vertical_white_space={0.2} />
        <LocationVis
          setLocationLength={function (value) { this.setState({ location_length: value })}.bind(this)}
          adjust_viewed_location={this.state.adjust_viewed_location}
          onHideAllLocation={this.onHideAllLocation}
          onAddViewedLocation={this.onAddViewedLocation}
          onResetViewedLocation={this.onResetViewedLocation}
          highlighted_data={this.state.highlighted_data}
          handleMouseOver={this.handleMouseOver}
          xDomain={[this.state.current_x0_window, this.state.current_x_window]}
          width={this.state.width}
          height={10}
          clicked={this.state.clicked}
          onClickForView={this.onClick}
          data={this.state.data}
          horizontal_white_space={0.1}/>
        <TimeVis
          setTimeLength={function (value) { this.setState({ time_length: value }) }.bind(this)}        
          adjust_viewed_time={this.state.adjust_viewed_time}
          onHideAllTime={this.onHideAllTime}
          onAddViewedTime={this.onAddViewedTime}
          onResetViewedTime={this.onResetViewedTime}
          highlighted_data={this.state.highlighted_data}
          handleMouseOver={this.handleMouseOver}
          xDomain={[this.state.current_x0_window, this.state.current_x_window]}
          width={this.state.width}
          height={10}
          clicked={this.state.clicked}
          onClickForView={this.onClick}
          data={this.state.data}
          horizontal_white_space={0.1}/>
      </div>
    );
  }

  renderRight(){
    return (
      <div className="story-detail-container">
        <StoryDetailContainer
          clicked={this.state.clicked}
          onClickForView={this.onClick}
          location_length={this.state.location_length}
          character_length={this.state.character_length}
          time_length={this.state.time_length}
          handleMouseOver={this.handleMouseOver}
          highlighted_data={this.state.highlighted_data}
          data={this.state.story_detail_data}
          horizontal_white_space={0.1}/>
      </div>
    );
  }

  render(){
    if (this.state.data.length){
      return (
        <section className="section">
          <div className="columns">
            <div className="column is-9">
              {this.renderLeftVis()}
            </div>
            <div className="column is-3">
              {this.renderRight()}
          </div>
          </div>
        </section>
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