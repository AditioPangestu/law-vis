import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import moment from "moment";
import { 
  XYPlot,
  VerticalRectSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  Borders
} from 'react-vis';

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
    this.state = {
      event_positions : [],
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
    }
    this.preprocessRectData = this.preprocessRectData.bind(this);
    this.generateLawStageTic = this.generateLawStageTic.bind(this);
    this.generateDateTic = this.generateDateTic.bind(this);
    this.stageTicFormat = this.stageTicFormat.bind(this);
    this.dateTicFormat = this.dateTicFormat.bind(this);
  }

  componentWillMount(){
    const {event_positions, stage_areas} = this.preprocessRectData(this.props.data);
    const { stage_tic_values, stage_tic_names } = this.generateLawStageTic(stage_areas);
    const { date_tic_values, date_tic_names } = this.generateDateTic(this.props.data);
    this.setState({
      event_positions: event_positions,
      stage_areas: stage_areas,
      date_tic_values: date_tic_values,
      date_tic_names: date_tic_names,
      stage_tic_values: stage_tic_values,
      stage_tic_names: stage_tic_names,
    });
  }

  preprocessRectData(data){
    var event_positions = []
    var stage_areas = [];
    var stage_area = {};
    var prev_datum = {};
    for(var i=0;i<data.length;i++){
      const datum = data[i];
      if(i == 0){
        var y_base = datum.y - datum.n/2;
        stage_area.start = y_base;
        stage_area.law_stage = datum.law_stage;
        for (var j = 0; j < datum.n; j++) {
          event_positions.push({
            x0: (datum.x),
            x: (datum.x+1),
            y0: y_base,
            y: (y_base + 1),
            color: datum.characters[j].color
          });
          y_base++;
        }
      } else {
        if (prev_datum.law_stage == datum.law_stage){
          var y_base = event_positions[event_positions.length - 1].y - (prev_datum.n / 2) + 1 - (datum.n / 2);
          for (var j = 0; j < datum.n; j++) {
            event_positions.push({
              x0: (datum.x),
              x: (datum.x + 1),
              y0: y_base,
              y: (y_base + 1),
              color: datum.characters[j].color
            });
            y_base++;
          }
        } else {
          stage_area.end = event_positions[event_positions.length - 1].y;
          stage_areas.push({...stage_area});
          stage_area.start = event_positions[event_positions.length - 1].y;
          stage_area.law_stage = datum.law_stage;
          var y_base = stage_area.start;
          for (var j = 0; j < datum.n; j++) {
            event_positions.push({
              x0: (datum.x),
              x: (datum.x + 1),
              y0: y_base,
              y: (y_base + 1),
              color: datum.characters[j].color
            });
            y_base++;
          }
        }
      }
      prev_datum = datum;
    }
    stage_area.end = event_positions[event_positions.length - 1].y;
    stage_areas.push({ ...stage_area });
    return {
      event_positions,
      stage_areas
    };
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
    if (data.length >= 2) {
      var prev_date = data[0].published_date;
      var curr_date = "";
      var prev_idx = 0;
      date_tic_names.push(moment(prev_date).format("DD MMM YYYY"));
      for (var i = 1; i < data.length; i++) {
        const datum = data[i];
        curr_date = datum.law_stage;
        if (moment(prev_date).isSame(curr_date,'day')) {
          date_tic_values.push((prev_idx + i - 1) / 2);
          prev_idx = i;
          date_tic_names.push(moment(curr_date).format("DD MMM YYYY"));
        }
        prev_date = curr_date;
      }
      date_tic_values.push((prev_idx + i - 1) / 2);
    } else if (data.length == 1) {
      date_tic_values = [0];
      date_tic_names = [data[0].published_date];
    }
    return {
      date_tic_values,
      date_tic_names
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

  render(){
    return (
      <XYPlot
        margin={{ left: 100 }}
        width={500}
        height={300}>
        <VerticalRectSeries
          data={this.state.event_positions}/>
        <Borders style={{
          bottom: { fill: '#fff' },
          left: { fill: '#fff' },
          right: { fill: '#fff' },
          top: { fill: '#fff' }
        }}/>
        <YAxis 
          tickValues={this.state.stage_tic_values}
          tickFormat={this.stageTicFormat}/>
        <YAxis
          tickValues={_.map(this.state.stage_areas, (stage_area) => { return stage_area.end })}
          tickFormat={(value)=>{return ""}} />        
        <HorizontalGridLines 
          tickValues={_.map(this.state.stage_areas, (stage_area) => { return stage_area.end})}
          style={{ borderStyle: "dashed"}}/>
        <XAxis tickValues={this.state.date_tic_values}
          tickFormat={this.dateTicFormat}/>
        <VerticalGridLines/>
      </XYPlot>
    );
  }

}

StoryCurve.propTypes  = { 
  data: PropTypes.array.isRequired 
};

export default StoryCurve;



