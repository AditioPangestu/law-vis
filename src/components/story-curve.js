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
    n : number of stack,
    colors : color of stack,
    published_date : date,
    law_stage : penyelidikan/penyidikan/penyidikan+praperadilan/penuntutan/penuntutan+praperadilan/praperadilan/pemeriksaan/upaya hukum ,
  }
*/

function preprocessRectData(data){
  var rect_data = []
  for(var i=0;i<data.length;i++){
    const datum = data[i];
    var y_base = datum.y - (n / 2);
    for (var j = 0; j < n; j++) {
      rect_data.append({
        x0: (datum.x - 1),
        x: datum.x,
        y0: y_base,
        y: (y_base + 1),
        color: datum.color[j]
      });
      y_base++;
    }
  }
  return rect_data;
}

function generateLawStageTic(data){
  var tic_values = [];
  var tic_names = [];
  if(data.length >= 2) {
    var prev_stage = data[0].law_stage;
    var curr_stage = "";
    var prev_idx = 0;
    tic_names.append(prev_stage);
    for (var i = 1; i < data.length; i++) {
      const datum = data[i];
      curr_stage = datum.law_stage;
      if(curr_stage != prev_stage){
        tic_values.append((prev_idx+i-1)/2);
        prev_idx = i;
        tic_names.append(curr_stage);
      }
      prev_stage = curr_stage;
    }
    tic_values.append((prev_idx+i-1)/2);
  } else if (data.length == 1) {
    tic_values = [0];
    tic_names = [data[0].law_stage];
  }
  return {
    stage_tic_values,
    stage_tic_names
  };
}

function generateDateTic(data){
  var tic_names = [];
  var tic_values = [];
  if (data.length >= 2) {
    var prev_date = data[0].published_date;
    var curr_date = "";
    var prev_idx = 0;
    tic_names.append(moment(prev_date).format("DD MMM YYYY"));
    for (var i = 1; i < data.length; i++) {
      const datum = data[i];
      curr_date = datum.law_stage;
      if (moment(prev_date).isSame(curr_date,'day')) {
        tic_values.append((prev_idx + i - 1) / 2);
        prev_idx = i;
        tic_names.append(moment(curr_date).format("DD MMM YYYY"));
      }
      prev_date = curr_date;
    }
    tic_values.append((prev_idx + i - 1) / 2);
  } else if (data.length == 1) {
    tic_values = [0];
    tic_names = [data[0].published_date];
  }
  return {
    date_tic_values,
    date_tic_names
  };
}

function StoryCurve({ data }) {
  const rect_data = preprocessRectData(data);
  const { date_tic_values, date_tic_names } = generateDateTic(data);
  const { stage_tic_values, stage_tic_names } = generateLawStageTic(data);
  return (
    <XYPlot
      width={300}
      height={300}>
      <VerticalRectSeries
        data={rect_data}/>
      <YAxis hideTicks tickValues={stage_tic_values} tickFormat={stage_tic_names} />
      <XAxis top={0} hideTicks tickValues={date_tic_values} tickFormat={date_tic_names}></XAxis>
      <VerticalGridLines/>
      <HorizontalGridLines/>
    </XYPlot>
  );
}

StoryCurve.StoryCurve = { 
  data: PropTypes.array.isRequired 
};

export default StoryCurve;



