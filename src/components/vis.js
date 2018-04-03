import React, {Component} from "react";
import axios from "axios";
import _ from "lodash";

import StoryCurve from "./story-curve";
import CharacterVis from "./character-vis";

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
  }

  componentWillMount(){
    axios.get("./src/data/simple.json")
      .then((response)=>{
        var { data }  = response;
        this.setState({
          ...this.state,
          data: data.sort((a, b) => { return a.y - b.y }),
          current_x_window: data.length,
          default_x_window: data.length,
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

  render(){
    if (this.state.data.length){
      return (
        <div className="vis">
          <div 
            onClick={this.onPanLeft}
            className="button">
            Pan left
          </div>
          <div
            onClick={this.onPanRight}
            className="button">
            Pan right
          </div>
          <div 
            onClick={this.onZoomIn}
            className="button">
            Zoom in
          </div>
          <div
            onClick={this.onZoomOut}
            className="button">
            Zoom out
          </div>
          <div
            onClick={this.onResetZoom}
            className="button">
            Reset Zoom
          </div>
          <div
            onWheel={this.onWheel}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onMouseMove={this.onMouseMove}
            style={{
              width:this.state.width,
            }}>
            <StoryCurve
              highlighted_data={this.state.highlighted_data}
              handleMouseOver={this.handleMouseOver}
              xDomain={[this.state.current_x0_window, this.state.current_x_window]}
              width={this.state.width}
              height={300}
              data={this.state.data}
              horizontal_white_space={0.1}/>
          </div>
          <CharacterVis
            highlighted_data={this.state.highlighted_data}
            handleMouseOver={this.handleMouseOver}
            xDomain={[this.state.current_x0_window, this.state.current_x_window]}
            width={this.state.width}
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