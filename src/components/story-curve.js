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
  YAxis
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
      stage_tic_names : []
    }
    this.preprocessRectData = this.preprocessRectData.bind(this);
    this.generateLawStageTic = this.generateLawStageTic.bind(this);
    this.generateDateTic = this.generateDateTic.bind(this);
    this.stageTicFormat = this.stageTicFormat.bind(this);
    this.dateTicFormat = this.dateTicFormat.bind(this);
  }

  componentWillMount(){
    const event_positions = this.preprocessRectData(this.props.data);
    const { date_tic_values, date_tic_names } = this.generateDateTic(this.props.data);
    const { stage_tic_values, stage_tic_names } = this.generateLawStageTic(this.props.data);
    this.setState({
      event_positions: event_positions,
      date_tic_values: date_tic_values,
      date_tic_names: date_tic_names,
      stage_tic_values: stage_tic_values,
      stage_tic_names: stage_tic_names,
    });
  }

  preprocessRectData(data){
    var event_positions = []
    for(var i=0;i<data.length;i++){
      const datum = data[i];
      var y_base = datum.y;
      for (var j = 0; j < datum.n; j++) {
        event_positions.push({
          x0: (datum.x - 1),
          x: datum.x,
          y0: y_base,
          y: (y_base + 1),
          color: datum.characters[j].color
        });
        y_base++;
      }
    }
    return event_positions;
  }
  
  generateLawStageTic(data){
    var stage_tic_names = [];
    var stage_tic_values = [];
    if(data.length >= 2) {
      var prev_stage = data[0].law_stage;
      var curr_stage = "";
      var prev_idx = 0;
      stage_tic_names.push(prev_stage);
      for (var i = 1; i < data.length; i++) {
        const datum = data[i];
        curr_stage = datum.law_stage;
        if(curr_stage != prev_stage){
          stage_tic_values.push((prev_idx+i-1)/2);
          prev_idx = i;
          stage_tic_names.push(curr_stage);
        }
        prev_stage = curr_stage;
      }
      stage_tic_values.push((prev_idx+i-1)/2);
    } else if (data.length == 1) {
      stage_tic_values = [0];
      stage_tic_names = [data[0].law_stage];
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
        width={300}
        height={300}>
        <VerticalRectSeries
          data={this.state.event_positions}/>
        <YAxis hideTicks tickValues={this.state.stage_tic_values} tickFormat={this.stageTicFormat} />
        <XAxis top={0} hideTicks tickValues={this.state.date_tic_values} tickFormat={this.dateTicFormat}/>
        <VerticalGridLines/>
        <HorizontalGridLines/>
      </XYPlot>
    );
  }

}

StoryCurve.propTypes  = { 
  data: PropTypes.array.isRequired 
};

export default StoryCurve;



