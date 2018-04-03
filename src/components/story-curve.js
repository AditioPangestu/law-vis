import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import moment from "moment";
import { 
  XYPlot,
  VerticalRectSeries,
  LineSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  Borders,
  Hint
} from 'react-vis';
import verticalBarSeries from "react-vis/dist/plot/series/vertical-bar-series";

/*
  data = array of datum
  datum = {
    x : horizontal position,
    y : vertical position,
    event_name : name of event,
    n : number of characters,
    characters : [
      {
        color : color of representation,
        name : name,
        role : saksi, tersangka, terdakwa, penasihat hukum , penyelidik, penyidik, penuntut umum, hakim
        social_status : [

        ]
      }
    ],
    published_date : date,
    law_stage : penyelidikan/penyidikan/penyidikan+praperadilan/penuntutan/penuntutan+praperadilan/praperadilan/pemeriksaan/upaya hukum ,
  }
*/

class StoryCurve extends Component {

  constructor(props){
    super(props);
    this.rect_height = 1;
    this.state = {
      event_positions : [],
      line_data : [],
      date_tic_values : [],
      date_tic_names : [], 
      stage_tic_values : [], 
      stage_tic_names : [],
      stage_areas : [
        /* 
          {
            stage : law stage
            start : start,
            end : end,
          } 
        */
      ],
      date_areas : [],
      y_max : 0,
      y_min : 0,
      hint_position : {}
    }
    this.preprocessRectData = this.preprocessRectData.bind(this);
    this.preprocessLineData = this.preprocessLineData.bind(this);
    this.generateLawStageTic = this.generateLawStageTic.bind(this);
    this.generateDateTic = this.generateDateTic.bind(this);
    this.stageTicFormat = this.stageTicFormat.bind(this);
    this.dateTicFormat = this.dateTicFormat.bind(this);
  }

  componentWillMount(){
    const { event_positions, stage_areas, line_data} = this.preprocessRectData(this.props.data);
    const { stage_tic_values, stage_tic_names } = this.generateLawStageTic(stage_areas);
    const { date_tic_values, date_tic_names, date_areas } = this.generateDateTic(this.props.data);
    const y_max = _.max(event_positions, (event_position) => { return event_position.y}).y;
    const y_min = _.min(event_positions, (event_position) => { return event_position.y0}).y0;
    this.setState({
      ...this.state,
      event_positions: event_positions,
      stage_areas: stage_areas,
      stage_tic_values: stage_tic_values,
      stage_tic_names: stage_tic_names,
      date_tic_values: date_tic_values,
      date_tic_names: date_tic_names,
      date_areas: date_areas,
      line_data: line_data,
      y_max: y_max,
      y_min: y_min,
    });
  }

  preprocessRectData(data){
    var line_data = [];
    var event_positions = [];
    var stage_areas = [];
    var stage_area = {};
    var prev_datum = {};
    for(var i=0;i<data.length;i++){
      const datum = data[i];
      if(i == 0){
        var y_base = datum.y - this.rect_height*datum.n/2;
        line_data.push({
          x : datum.x,
          y: (y_base + (this.rect_height*datum.n/2)),
        });
        stage_area.start = y_base;
        stage_area.law_stage = datum.law_stage;
        for (var j = 0; j < datum.n; j++) {
          event_positions.push({
            x0: (datum.x + this.props.horizontal_white_space),
            x: (datum.x + 1 - this.props.horizontal_white_space),
            y0: (y_base),
            y: (y_base + this.rect_height),
            color: datum.characters[j].color
          });
          y_base += this.rect_height;
        }
      } else {
        if (prev_datum.law_stage == datum.law_stage){
          var y_base = event_positions[event_positions.length - 1].y - (this.rect_height * prev_datum.n / 2) + this.rect_height - (this.rect_height*datum.n / 2);
          line_data.push({
            x: datum.x,
            y: (y_base + this.rect_height * datum.n / 2),
          });
          for (var j = 0; j < datum.n; j++) {
            event_positions.push({
              x0: (datum.x + this.props.horizontal_white_space),
              x: (datum.x + 1 - this.props.horizontal_white_space),
              y0: (y_base),
              y: (y_base + this.rect_height),
              color: datum.characters[j].color
            });
            y_base+=this.rect_height;
          }
        } else {
          stage_area.end = event_positions[event_positions.length - 1].y;
          stage_areas.push({...stage_area});
          stage_area.start = event_positions[event_positions.length - 1].y;
          stage_area.law_stage = datum.law_stage;
          var y_base = stage_area.start;
          line_data.push({
            x: datum.x,
            y: (y_base + this.rect_height * datum.n / 2),
          });
          for (var j = 0; j < datum.n; j++) {
            event_positions.push({
              x0: (datum.x + this.props.horizontal_white_space),
              x: (datum.x + 1 - this.props.horizontal_white_space),
              y0: (y_base),
              y: (y_base + this.rect_height),
              color: datum.characters[j].color
            });
            y_base += this.rect_height;
          }
        }
      }
      prev_datum = datum;
    }
    stage_area.end = event_positions[event_positions.length - 1].y;
    stage_areas.push({ ...stage_area });
    line_data = line_data.sort((a, b) => { return a.x - b.x });
    const last_line_data = line_data[line_data.length - 1];
    line_data.push({
      x: (last_line_data.x+1),
      y: last_line_data.y,
    })
    return {
      event_positions,
      stage_areas,
      line_data
    };
  }

  preprocessLineData(data){
    const sorted_data = data.sort((a, b) => { return a.x - b.x });
    var line_data = [];
    var i = 0;
    for(i = 0; i<data.length;i++){
      const datum = data[i];
      line_data.push({
        x : datum.x,
        y : datum.y
      });
    }
    return line_data;
  }

  generateLawStageTic(stage_areas){
    var stage_tic_names = [];
    var stage_tic_values = [];
    for(var i=0;i<stage_areas.length;i++){
      const stage_area = stage_areas[i];
      stage_tic_names.push(stage_area.law_stage);
      stage_tic_values.push((stage_area.start + stage_area.end)/2);
    }
    return {
      stage_tic_values,
      stage_tic_names
    };
  }
  
  generateDateTic(data){
    var date_tic_names = [];
    var date_tic_values = [];
    var date_areas = [];
    var date_area = {};
    if (data.length >= 2) {
      var prev_date = data[0].published_date;
      var curr_date = "";
      var prev_idx = 0;
      date_tic_names.push(moment(prev_date, "YYYY-MM-DD").format("DD MMM YY"));
      date_area.start = 0;
      var i = 1
      for (i = 1; i < data.length; i++) {
        const datum = data[i];
        curr_date = datum.published_date;
        if (!moment(prev_date, "YYYY-MM-DD").isSame(curr_date,'day')) {
          date_tic_values.push((prev_idx + i) / 2);
          date_area.end = i;
          date_areas.push({...date_area});
          date_area.start = prev_idx + i;
          prev_idx = i;
          date_tic_names.push(moment(curr_date, "YYYY-MM-DD").format("DD MMM YY"));
        }
        prev_date = curr_date;
      }
      date_tic_values.push((prev_idx + i) / 2);
      date_area.end = i;
      date_areas.push({...date_area});
    } else if (data.length == 1) {
      date_tic_values = [0];
      date_tic_names = [data[0].published_date];
      date_areas.push({
        start : 0,
        end : 1
      });
    }
    return {
      date_tic_values,
      date_tic_names,
      date_areas
    };
  }
  
  stageTicFormat(value){
    const index = _.findIndex(this.state.stage_tic_values, (stage_tic_value) => {
      return (stage_tic_value == value);
    });
    if (index != -1) {
      return this.state.stage_tic_names[index];
    }
  }

  dateTicFormat(value){
    const index = _.findIndex(this.state.date_tic_values, (date_tic_value) => {
      return (date_tic_value == value);
    });
    if (index != -1) {
      return this.state.date_tic_names[index];
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.highlighted_data, nextProps.highlighted_data)){
      var horizontal_highlighted_data = [];
      var highlighted_data = [];
      var hint_position = {};
      if (!_.isEmpty(nextProps.highlighted_data)) {
        horizontal_highlighted_data = [{
          x0: nextProps.highlighted_data.x0,
          x: nextProps.highlighted_data.x,
          y0: this.state.y_min,
          y: this.state.y_max,
          color: "#363636",
          opacity: .1
        }];
        highlighted_data = _.filter(this.state.event_positions, (datum)=>{
          return ((datum.x0 == nextProps.highlighted_data.x0) && (datum.x == nextProps.highlighted_data.x));
        });
        if(highlighted_data.length % 2 == 0){
          const mid_index = highlighted_data.length/2;
          hint_position = {
            y: highlighted_data[mid_index].y0,
            x: (highlighted_data[mid_index].x + this.props.horizontal_white_space)
          }
        } else {
          const mid_index = (highlighted_data.length-1) / 2;
          hint_position = {
            y: (highlighted_data[mid_index].y0 + highlighted_data[mid_index].y)/2,
            x: (highlighted_data[mid_index].x + this.props.horizontal_white_space)
          }
        }
      }
      this.setState({
        ...this.state,
        horizontal_highlighted_data: horizontal_highlighted_data,
        highlighted_data: highlighted_data,
        hint_position: hint_position
      });
    }
  }

  render(){
    const { RIGHT, TOP } = Hint.ALIGN;
    const {handleMouseOver} = this.props;
    return (
      <XYPlot
        colorType="literal"
        margin={{ left: 100, top: 50, bottom: 10, right:0  }}
        width={this.props.width}
        height={this.props.height}
        xDomain={this.props.xDomain}
        onMouseLeave={() => handleMouseOver({})}
        yRange={[0, this.props.height-60]}>
        <HorizontalGridLines 
          tickValues={_.map(this.state.stage_areas, (stage_area) => { return stage_area.end})}/>
        {/* Component for display horizontal highlight */}
        <VerticalRectSeries
          data={this.state.horizontal_highlighted_data}
          stroke="#363636"/>
        {/* Component for display plot */}
        <LineSeries
          curve={'curveStepAfter'}
          data={this.state.line_data} />
        {/* Component for display events */}
        <VerticalRectSeries
          data={this.state.event_positions} />
        {/* Component for handle mouse over */}
        <VerticalRectSeries
          onValueMouseOver={(datapoint, { index }) => handleMouseOver(datapoint)}
          data={_.map(this.props.data,(datum)=>{
            return {
              x0: (datum.x + this.props.horizontal_white_space),
              x: (datum.x + 1 - this.props.horizontal_white_space),
              y0: this.state.y_min,
              y: this.state.y_max,
            }
          })}
          opacity={0}/>
        {/* Component for display rect highlight */}
        <VerticalRectSeries
          data={this.state.highlighted_data}
          stroke="#363636"
          style={{ strokeWidth: 3 }}/>
        {/* Component for display hint */}
        {(()=>{
          if (!_.isEmpty(this.state.hint_position)){
            return (
              <Hint 
                align={{
                  horizontal: RIGHT,
                  vertical: TOP
                }}
                value={{ x: (this.state.hint_position.x - this.props.horizontal_white_space), y: this.state.hint_position.y}}>
                <div className="tags has-addons story-curve-hint">
                  <span className="arrow-left"></span>
                  <span className="tag is-dark has-text-warning">( X, Y )</span>
                  <span className="tag is-success">{"( "+this.state.hint_position.x+", "+this.state.hint_position.y+" )"}</span>
                </div>
              </Hint>
            );
          }
        })()}
        <XAxis
          orientation="top"
          tickValues={this.state.date_tic_values}
          tickFormat={this.dateTicFormat} />
        <XAxis
          hideTicks />
        <Borders style={{
          bottom: { fill: '#fff' },
          left: { fill: '#fff' },
          right: { fill: 'transparent' },
          top: { fill: 'transparent' }
        }}/>
        <YAxis
          tickSize={0}
          tickValues={this.state.stage_tic_values}
          tickFormat={this.stageTicFormat}
          style={{backgroundColor:"white"}}/>
        <YAxis
          tickValues={_.map(this.state.stage_areas, (stage_area) => { return stage_area.end })}
          tickFormat={(value) => { return "" }} />
      </XYPlot>
    );
  }

}

StoryCurve.propTypes  = { 
  data: PropTypes.array.isRequired, 
  xDomain: PropTypes.array.isRequired, 
  horizontal_white_space: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  highlighted_data: PropTypes.object,
  handleMouseOver: PropTypes.func.isRequired,
};

export default StoryCurve;



