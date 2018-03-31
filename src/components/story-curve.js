import PropTypes from "prop-types";
import _ from "lodash";
import moment from "moment";
import { 
  XYPlot,
  HorizontalRectSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  MarkSeries
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
    tic_names = data[0].law_stage;
  }
  return {
    tic_values,
    tic_names
  };
}

function generateDateTic(data){
  
}

function StoryCurve({ data }) {
  const rect_data = preprocessRectData(data);

  return (
    
  );
}

StoryCurve.StoryCurve = { 
  data: PropTypes.array.isRequired 
};

export default StoryCurve;



