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
    n : number of characters,
    published_date : date,
    law_stage : penyelidikan/penyidikan/penyidikan+praperadilan/penuntutan/penuntutan+praperadilan/praperadilan/pemeriksaan/upaya hukum ,
    characters : [
      {
        color : color of representation,
        name : name,
        role : saksi, tersangka, terdakwa, penasihat hukum , penyelidik, penyidik, penuntut umum, hakim
        social_status : [

        ]
      }
    ]
  }
*/

class CharacterVis extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      character_hints : [
      /*
        [
          {
            name : name,
            role : saksi, tersangka, terdakwa, penasihat hukum , penyelidik, penyidik, penuntut umum, hakim
            social_status : [

            ]
          },
        ],
      */
      ],
      character_positions: [
        /*
          {
            role : saksi, tersangka, terdakwa, penasihat hukum , penyelidik, penyidik, penuntut umum, hakim
            positions : [
              {
                x0 : horizontal position start,
                x : horizontal position end,
                y0 : vertical position start,
                y : vertical position end,
                color : color of representation,
              }
            ],
          },
        */
      ],
      character_tic_names: [

      ],
      character_tic_values: [

      ],
    }
    this.preprocessData = this.preprocessData.bind(this);
  }

  componentWillMount(){
    this.preprocessData(this.props.data);
  }

  preprocessData(data){
    var character_positions = [];
    var character_hints = [];
    var character_tic_names = [];
    var character_tic_values = [];
    var character_index = 0;
    for(var i = 0; i < data.length; i++){
      const datum = data[i];
      for(var j=0; j<datum.n;j++){
        const character_datum = datum.characters[j];
        const index = _.findIndex(character_positions, (value)=>{
          return (value.role == character_datum.role);
        });
        if(index == -1){
          character_tic_names.push(character_datum.role);
          character_tic_values.push(character_index);
          character_index++;
          character_positions.push({
            role: character_datum.role,
            positions : [
              {
                x0 : (datum.x + this.props.horizontal_white_space),
                x: (datum.x + 1 - this.props.horizontal_white_space),
                y0: 0,
                y: 1,
                color: character_datum.color
              }
            ]
          });
          character_hints.push([
            {
              name: character_datum.name,
              role: character_datum.role,
              social_status: character_datum.social_status,
            }
          ]);
        } else {
          character_positions[index].positions.push({
            x0: (datum.x + this.props.horizontal_white_space),
            x: (datum.x + 1 - this.props.horizontal_white_space),
            y0: 0,
            y: 1,
            color: character_datum.color
          });
          character_hints[index].push({
            name: character_datum.name,
            role: character_datum.role,
            social_status: character_datum.social_status,
          })
        }
      }
    }
    this.setState({
      character_positions : character_positions,
      character_hints: character_hints,
      character_tic_names: character_tic_names,
      character_tic_values: character_tic_values,
    });
  }

  render(){
    return (
      _.map(this.state.character_positions, (character_position, index)=>{
        return (
          <XYPlot
            colorType="literal"
            key={index}
            margin={{ left: 100, top: 0, bottom: 10 }}
            width={this.props.width}
            height={this.props.height}
            xDomain={this.props.xDomain}
            yRange={[0, this.props.height - 10]}>
            <YAxis 
              tickSize={0}
              tickValues={[0.5]}
              tickFormat={(tick_value) => { return this.state.character_tic_names[index]}} />
            <VerticalRectSeries
              data={[{
                x0: (this.props.xDomain[0] + this.props.horizontal_white_space),
                x: (this.props.xDomain[1] - this.props.horizontal_white_space),
                y: 0,
                y: 1,
                color: "#f1f1f1"
              }]} />
            <VerticalRectSeries
              data={character_position.positions}/>
          </XYPlot>
        )
      })
    );
  }
}

CharacterVis.propTypes  = {
  data: PropTypes.array.isRequired,
  xDomain: PropTypes.array.isRequired,
  horizontal_white_space: PropTypes.number.isRequired,
  vertical_white_space: PropTypes.number.isRequired,  
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default CharacterVis;