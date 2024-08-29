import React,{Component} from 'react'
import Connection from './Connection';
import RobotSwitch from './RobotSwitch';
import RobotState from './RobotState';
import Teleoperation from './Teleoperation';
import {Row, Col} from 'react-bootstrap'
import Map from './Map'
import NavConsole from './NavConsole';
class Home extends Component{
   


    render()
    {
        return(
            <div>
                <Row>
                    <Col xs={2} sm={2} md={2} lg={2} xl={2}><Connection></Connection></Col>
                    <Col xs={6} sm={6} md={6} lg={6} xl={6}><RobotSwitch></RobotSwitch></Col>
                
                
                </Row>

                <Row >
                    <Col>
                        <Map></Map>
                    </Col>
                    <Col xs={5} sm={5} md={5} lg={5} xl={5} >

                    <NavConsole></NavConsole>
                    <RobotState></RobotState>
                    <Teleoperation ></Teleoperation>
                    </Col>
                
                </Row>
                
                
           
            </div>

            
        )
    }
}

export default Home;