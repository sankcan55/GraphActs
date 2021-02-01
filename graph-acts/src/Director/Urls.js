import React from 'react'
import {Route, Switch} from 'react-router-dom'
import BarChartRace from '../Pages/BarChartRace/index'

function Urls() {
    return (
        <React.Fragment>
            <Switch>
                <Route path='/bar-chart-race' component={BarChartRace} />
            </Switch>
        </React.Fragment>
    )
}

export default Urls
