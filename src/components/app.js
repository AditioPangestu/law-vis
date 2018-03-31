import React, { Component } from 'react';
import { XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines, XAxis, YAxis, MarkSeries  } from 'react-vis';

export default class App extends Component {

  constructor(props){
    super(props);
    this.state={width:300}
    this.onClick = this.onClick.bind(this);
    this.onNearestXY = this.onNearestXY.bind(this);
  }

  onClick(){
    const width = this.state.width + 100;
    this.setState({ width: width});
  }

  onNearestXY(datapoint, event){
    console.log(event);
  }

  render() {
    const data = [
      { x: 0, y: 8, color:1 },
      { x: 1, y: 5, color:2 },
      { x: 2, y: 4, color:3 },
      { x: 3, y: 9, color:4 },
      { x: 4, y: 1, color:5 },
      { x: 5, y: 7, color:6 },
      { x: 6, y: 6, color:7 },
      { x: 7, y: 3, color:8 },
      { x: 8, y: 2, color:9 },
      { x: 9, y: 0, color:10 }
    ];
    return (
      <div style={{width:500,overflowX:"overlay"}}>
        <XYPlot height={300} width={this.state.width} colorType="category">
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          <LineSeries data={data} onNearestX={this.onNearestXY}/>
          <MarkSeries data={data} />
        </XYPlot>
        <p onClick={()=>this.onClick()}>Click sini ya</p>
      </div>
    );
  }
}
