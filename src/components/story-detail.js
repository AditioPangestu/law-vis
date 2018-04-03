import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import _ from "lodash";

class StoryDetail extends Component {

  render(){
    return(
      <div
        className="card"
        onMouseOver={this.props.onMouseOver}
        onClick={this.props.onChangeClose}>
        <header className="card-header">
          <p className="card-header-title">
            {this.props.event_name}
          </p>
          {(()=>{
            if(this.props.close){
              return (
                <a className="card-header-icon" aria-label="more options">
                  <span className="icon">
                    <i className="fas fa-angle-down" aria-hidden="true"></i>
                  </span>
                </a>
              );
            } else {
              return (
                <a className="card-header-icon" aria-label="more options">
                  <span className="icon">
                    <i className="fas fa-angle-up" aria-hidden="true"></i>
                  </span>
                </a>
              );
            }
          })()}
        </header>
        {(() => {
          if (!this.props.close) {
            return (
              <div>
                <div className="card-content">
                  <div className="content">
                    {_.map(this.props.event_components, (event_component, index) => {
                      return (
                        <div key={index}>
                          <p><b>{event_component.term}</b></p>
                          <p>{event_component.definition}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <footer className="card-footer">
                  <p className="card-footer-item has-text-right">
                    <span>
                      Lihat detail <a href={this.props.url}>di sini</a>.
                    </span>
                  </p>
                </footer>
              </div>
            );
          }
        })()}
      </div>
    );
  }
}

StoryDetail.propTypes = {
  event_name: PropTypes.string.isRequired,
  published_date: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  close: PropTypes.bool.isRequired,
  event_components: PropTypes.array.isRequired,
  onMouseOver: PropTypes.func.isRequired,
  onChangeClose: PropTypes.func.isRequired,
};

export default StoryDetail;