import React, { Component } from "react";
import BarChartRace from "../../Components/BarChartRace";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user_ids: "",
      composed_data: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  epocsConvertor = (epocTime) => {
    var d = new Date(0);
    d.setUTCSeconds(epocTime);
    // console.log(d.getUTCFullYear(epocTime))
    return d.getUTCFullYear(epocTime);
  };

  async handleSubmit(event) {
    event.preventDefault();
    var self = this;
    this.setState({ composed_data: [] });
    this.state.user_ids.split(",").map(async function (user_id) {
      var url = "https://codeforces.com/api/user.rating?handle=" + user_id;
      let response = await fetch(url);
      let response_body = await response.json();
      if (response.ok) {
        self.state.composed_data[user_id]={}
        for(var i=0;i<response_body['result'].length;i++){
          var year=self.epocsConvertor(response_body['result'][i]['ratingUpdateTimeSeconds'])
          if(!self.state.composed_data[user_id][year])
            self.state.composed_data[user_id][year]=[]
          self.state.composed_data[user_id][year].push(response_body['result'][i]['newRating'])
        }
        var tmp = self.state.composed_data;
        self.setState({ composed_data: tmp });
      }
    });
  }

  render() {
    return (
      <React.Fragment>
        <form onSubmit={this.handleSubmit}>
          <input
            placeholder="usernames with , seperated"
            type="text"
            name="user_ids"
            value={this.state.user_ids}
            onChange={this.handleChange}
          />
          <button type="submit">Get Data</button>
        </form>
        <BarChartRace data={this.state.composed_data} />
      </React.Fragment>
    );
  }
}

export default index;
