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
  Borders,
  Hint
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
      highlighted_data : [],
      hint_position : {},
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
      ...this.state,
      character_positions : character_positions,
      character_hints: character_hints,
      character_tic_names: character_tic_names,
      character_tic_values: character_tic_values,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.highlighted_data, nextProps.highlighted_data)) {
      var highlighted_data = [];
      var hint_position = {};
      if (!_.isEmpty(nextProps.highlighted_data)) {
        highlighted_data = [{
          x0: nextProps.highlighted_data.x0,
          x: nextProps.highlighted_data.x,
          y0: 0,
          y: 1,
          color: "transparent"
        }];
        hint_position = {
          x: nextProps.highlighted_data.x,
          y: 1,
        }
      }
      this.setState({
        ...this.state,
        highlighted_data: highlighted_data,
        hint_position: hint_position,
      });
    }
  }

  render(){
    const { RIGHT, TOP } = Hint.ALIGN;
    const { handleMouseOver } = this.props;
    return (
      _.map(this.state.character_positions, (character_position, index)=>{
        return (
          <XYPlot
            colorType="literal"
            key={index}
            margin={{ left: 100, top: 0, bottom: 20, right: 0 }}
            width={this.props.width}
            height={this.props.height}
            xDomain={this.props.xDomain}
            onMouseLeave={() => handleMouseOver({})}
            yRange={[0, this.props.height - 10]}>
            <VerticalRectSeries
              data={[{
                x0: (this.props.xDomain[0]),
                x: (this.props.xDomain[1]),
                y: 0,
                y: 1,
                color: "#f1f1f1"
              }]} />
            <VerticalRectSeries
              data={character_position.positions}/>
            {(()=>{
              if (this.state.highlighted_data.length != 0){
                const hightlight_index = _.findIndex(character_position.positions, (value) => {
                  return ((value.x == this.state.highlighted_data[0].x) && (value.x0 == this.state.highlighted_data[0].x0));
                });
                if (hightlight_index != -1){
                  return (
                    <VerticalRectSeries
                      data={this.state.highlighted_data}
                      stroke="#363636"
                      style={{strokeWidth : 3}}/>
                  );
                } else {
                  var temp = _.clone(this.state.highlighted_data,true);
                  temp[0].color = "#363636"
                  return (
                    <VerticalRectSeries
                      data={temp}
                      style={{ opacity: .1 }} />
                  )
                }
              }
            })()}
            <Borders style={{
              bottom: { fill: 'transparent' },
              left: { fill: '#fff' },
              right: { fill: 'transparent' },
              top: { fill: 'transparent' }
            }}/>
            <VerticalRectSeries
              opacity={0}
              onValueMouseOver={(datapoint, { index }) => handleMouseOver(datapoint)}
              data={character_position.positions} />
            <YAxis
              hideLine
              tickSize={0}
              tickValues={[0.5]}
              tickFormat={(tick_value) => { return this.state.character_tic_names[index] }} />
            {/* Component for display hint */}
            {(() => {
              if (!_.isEmpty(this.state.hint_position)) {
                const hint_index = _.findIndex(character_position.positions, (value) => {
                  return ((value.x == this.state.highlighted_data[0].x) && (value.x0 == this.state.highlighted_data[0].x0));
                });
                if (hint_index!=-1){
                  const hint_text=this.state.character_hints[index][hint_index];
                  return (
                    <Hint
                      align={{
                        horizontal: RIGHT,
                        vertical: TOP
                      }}
                      value={this.state.hint_position}>
                      <div className="tags has-addons character-vis-hint">
                        <span className="arrow-left"></span>
                        <span className="tag is-dark has-text-warning">{hint_text.role}</span>
                        <span className="tag is-success">{hint_text.name}</span>
                      </div>
                    </Hint>
                  );
                }
              }
            })()}
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
  highlighted_data: PropTypes.object,
  handleMouseOver: PropTypes.func.isRequired,
};

export default CharacterVis;