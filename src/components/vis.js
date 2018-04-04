import React, {Component} from "react";
import axios from "axios";
import _ from "lodash";

import StoryCurve from "./story-curve";
import CharacterVis from "./character-vis";
import StoryDetailContainer from "./story-detail-container";

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
      adjust_viewed_character: [], //By color
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
  }

  componentWillMount(){
    axios.get("./src/data/simple.json")
      .then((response)=>{
        var { data }  = response;
        this.setState({
          ...this.state,
          story_detail_data: data,
          data: data.events.sort((a, b) => { return a.y - b.y }),
          current_x_window: data.events.length,
          default_x_window: data.events.length,
        });
      })
  }

  handleMouseOver(data) {
    this.setState({ 
      ...this.state,
      highlighted_data : data
    });
  }

  onZoomIn() {
    if ((this.state.current_x_window - this.state.current_x0_window) > (this.state.default_x_window/8)) {
      this.setState({
        ...this.state,
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
        ...this.state,
        current_x_window: ((current_x_window > this.state.default_x_window) ? this.state.default_x_window : current_x_window),
        current_x0_window: ((current_x0_window < this.state.default_x0_window) ? this.state.default_x0_window : current_x0_window)
      });
    }
  }

  onPanLeft() {
    const current_x0_window = this.state.current_x0_window - this.state.default_x_window / 128;
    const current_x_window = this.state.current_x_window - this.state.default_x_window / 128;
    if (this.state.current_x0_window > this.state.default_x0_window) {
      this.setState({
        ...this.state,
        current_x0_window: ((current_x0_window < this.state.default_x0_window) ? this.state.default_x0_window : current_x0_window),
        current_x_window: current_x_window,
      });
    }
  }

  onPanRight() {
    const current_x0_window = this.state.current_x0_window + this.state.default_x_window / 128;
    const current_x_window = this.state.current_x_window + this.state.default_x_window / 128;
    if (this.state.current_x_window < this.state.default_x_window) {
      this.setState({
        ...this.state,
        current_x0_window: current_x0_window,
        current_x_window: ((current_x_window > this.state.default_x_window) ? this.state.default_x_window : current_x_window),
      });
    }
  }

  onResetZoom() {
    this.setState({
      ...this.state,
      current_x0_window: this.state.default_x0_window,
      current_x_window: this.state.default_x_window,
    });
  }

  onMouseDown(event) {
    event.preventDefault();
    this.setState({
      ...this.state,
      prev_absis: event.clientX,
      is_mouse_down: true
    });
  }
  
  onMouseUp(event) {
    event.preventDefault();
    this.setState({
      ...this.state,
      prev_absis: 0,
      is_mouse_down: false
    });
  }

  onMouseMove(event) {
    event.preventDefault();
    if(this.state.is_mouse_down){
      const diff = ((event.clientX - this.state.prev_absis) / (this.state.width - 100))*4;
      const current_x0_window = this.state.current_x0_window - diff;
      const current_x_window = this.state.current_x_window - diff;
      if ((diff < 0) && (this.state.current_x_window < this.state.default_x_window)) {
        this.setState({
          ...this.state,
          prev_absis : event.clientX,
          current_x0_window: current_x0_window,
          current_x_window: ((current_x_window > this.state.default_x_window) ? this.state.default_x_window : current_x_window),
        });
      } else if ((diff > 0) && (this.state.current_x0_window > this.state.default_x0_window)) {
        this.setState({
          ...this.state,
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
      if (color != character_color) {
        new_adjust.push(color);
      } else {
        find = true;
      }
    }
    if(!find){
      new_adjust.push(character_color);
    }
    this.setState({
      ...this.state,
      adjust_viewed_character: new_adjust
    });
  }

  onResetViewedCharacter(){
    this.setState({
      ...this.state,
      adjust_viewed_character: []
    });
  }

  renderLeftVis(){
    return (
      <div className="vis">
        <p className="title">{this.state.story_detail_data.title}</p>
        <div
          onClick={this.onPanLeft}
          className="button">
          <span className="icon">
            <i className="fas fa-arrow-left"></i>
          </span>
          </div>
        <div
          onClick={this.onPanRight}
          className="button">
          <span className="icon">
            <i className="fas fa-arrow-right"></i>
          </span>
          </div>
        <div
          onClick={this.onZoomIn}
          className="button">
          <span className="icon">
            <i className="fas fa-search-plus"></i>
          </span>
          </div>
        <div
          onClick={this.onZoomOut}
          className="button">
          <span className="icon">
            <i className="fas fa-search-minus"></i>
          </span>
          </div>
        <div
          onClick={this.onResetZoom}
          className="button">
          <span className="icon">
            <i className="fas fa-compress"></i>
          </span>
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
            adjust_viewed_character={this.state.adjust_viewed_character}
            highlighted_data={this.state.highlighted_data}
            handleMouseOver={this.handleMouseOver}
            xDomain={[this.state.current_x0_window, this.state.current_x_window]}
            width={this.state.width}
            height={400}
            data={this.state.data}
            horizontal_white_space={0.1} />
        </div>
        <CharacterVis
          onAddViewedCharacter={this.onAddViewedCharacter}
          onResetViewedCharacter={this.onResetViewedCharacter}
          highlighted_data={this.state.highlighted_data}
          handleMouseOver={this.handleMouseOver}
          xDomain={[this.state.current_x0_window, this.state.current_x_window]}
          width={this.state.width}
          height={10}
          data={this.state.data}
          horizontal_white_space={0.1}
          vertical_white_space={0.2} />
      </div>
    );
  }

  renderRight(){
    return (
      <div className="story-detail-container">
        <StoryDetailContainer
          handleMouseOver={this.handleMouseOver}
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