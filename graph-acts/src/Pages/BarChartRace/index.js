import React, { Component } from 'react'
import BarChartRace from '../../Components/BarChartRace'

class index extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             user_ids: '',
             composed_data: []
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event){
        this.setState({[event.target.name]: event.target.value});
    }

    async handleSubmit(event){
        var self=this
        this.setState({composed_data: []})
        this.state.user_ids.split(',').map(async function (user_id){
            var url = 'https://codeforces.com/api/user.rating?handle='+user_id
            let response=await fetch(url)
            let response_body = await response.json();
            if(response.ok){
                var tmp=self.state.composed_data;
                tmp.push(response_body['result'])
                self.setState({composed_data: tmp})
            }
        })
        event.preventDefault();
    }
    
    render() {
        return (
            <React.Fragment>
                <form onSubmit={this.handleSubmit}>
                    <input placeholder='usernames with , seperated' type="text" name="user_ids" value={this.state.user_ids} onChange={this.handleChange}/>
                    <button type="submit">Get Data</button>
                </form>
                <BarChartRace data={this.state.composed_data}/>
            </React.Fragment>
        )
    }
}

export default index
