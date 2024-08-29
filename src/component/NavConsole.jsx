import React, { Component } from 'react'
import Config from './config/config';
import * as Three from "three"
import { Row, Col, ButtonGroup, Button } from 'react-bootstrap'
class NavConsole extends Component {
    state =
        {
            connected: false,
            ros: null,
            x: 0.0,
            y: 0.0,
            yaw: 0.0,


        }

    constructor() {
        super()
        this.init_connection()
    }

    init_connection() {
        this.state.ros = new window.ROSLIB.Ros()
        console.log(this.state.ros)

        this.state.ros.on(
            "connection",
            () => {
                console.log("Connection is established")
                this.setState({ connected: true })
            }
        )

        this.state.ros.on(
            "error",
            (error) => {
                console.log("Connection has problem")
            }
        )

        this.state.ros.on(
            "close",
            () => {
                console.log("Connection closed!!")
                this.setState({ connected: false })


                setTimeout(() => {
                    try {
                        this.state.ros.connect(
                            "ws://" +
                            Config.ROSBRIDGE_IP +
                            ":9090"
                        )
                    }
                    catch (error) {
                        console.log("Connection problem")
                    }
                }, 1000)

            }
        )

        try {
            this.state.ros.connect(
                "ws://" +
                Config.ROSBRIDGE_IP +
                ":9090"
            )
        }
        catch (error) {
            console.log("Connection problem")
        }
    }


    getEulerFromQuat(quat) {
        var q = new Three.Quaternion(
            quat.x,
            quat.y,
            quat.z,
            quat.w,
        )

        var rpy = new Three.Euler().setFromQuaternion(q)
        return rpy["_z"] * (180 / 3.14159)
    }

    yawSlideHandle = (event) => {
        this.setState({ yaw: parseFloat(event.target.value) })
        //console.log(this.state.yaw)
    }

    getNavPoint() {
        var point_subscriber = new window.ROSLIB.Topic(
            {
                ros: this.state.ros,
                name: Config.MAPCLICK_TOPIC,
                messageType: "geometry_msgs/Vector3"
            }
        )

        point_subscriber.subscribe(
            (message) => {
                this.setState({ x: message.x.toFixed(3) })
                this.setState({ y: message.y.toFixed(3) })
            }
        )
    }

    sendNavPoint = () =>
        {
            var navp2p_pub = new window.ROSLIB.Topic(
                {
                    ros: this.state.ros,
                    name: Config.NAVP2P_TOPIC,
                    messageType: "geometry_msgs/Vector3"
                }
            )

            var navp2p_msg = new window.ROSLIB.Message(
                {
                    x: parseFloat(this.state.x),
                    y: parseFloat(this.state.y),
                    z: parseFloat(this.state.yaw)
                }
            )

            navp2p_pub.publish(navp2p_msg)
        }

    gotoGoal=(event)=> 
        {
            var navgo_pub = new window.ROSLIB.Topic(
                {
                    ros: this.state.ros,
                    name: Config.NAVGO_TOPIC,
                    messageType: "std_msgs/Int8"
                }
            )
            var navgo_msg = new window.ROSLIB.Message(
                {
                   data: 1 
                }
            )
            navgo_pub.publish(navgo_msg)
        }
    
        setNamedTarget(point_name)
        {
            var navnamed_pub = new window.ROSLIB.Topic(
                {
                    ros: this.state.ros,
                    name: Config.NAVNAME_TOPIC,
                    messageType: "std_msgs/String"
                }
            )

            var navnamed_msg = new window.ROSLIB.Message(
                {
                    data: point_name
                }
            )

            navnamed_pub.publish(navnamed_msg)
        }



    componentDidMount() {
        this.getNavPoint()
    }


    render() {
        return (
            <div>
                <Row>
                    <h4>Navigation Console</h4>
                </Row>

                <Row>
                    <Col sm={3}>
                        <h5><b>X[m]:</b> {this.state.x}</h5>
                    </Col>
                    <Col sm={3}>
                        <h5><b>Y[m]:</b> {this.state.y}</h5>
                    </Col>
                    <Col sm={3}>
                        <h5><b>Yaw [deg]:</b> {this.state.yaw}</h5>
                        <input type="range" class="form-range" id="customRange1"
                            min="-180" max="180" step="5" onChange={this.yawSlideHandle}
                        />
                    </Col>
                    <Col sm = {3}>
                        <button type="button" class="btn btn-info btn-lg"
                        onClick={this.sendNavPoint}>SET TARGET</button>
                    </Col>


                </Row>
                
                <Row>

                <Col sm={5}>
                    <Row>
                        <button type="button" class="btn btn-outline-info"
                        onClick={(e)=>this.setNamedTarget("A")}>
                            <h4>Point A</h4>
                        </button>
                    </Row>

                    <Row>
                        <button type="button" class="btn btn-outline-info"
                        onClick={(e)=>this.setNamedTarget("B")}>
                            <h4>Point B</h4>
                        </button>

                    </Row>

                </Col>


                <Col sm={5}>
                    <Row>
                        <button type="button" class="btn btn-success" 
                        onClick = {this.gotoGoal}>
                            <h4>GO TO GOAL</h4>
                        </button>
                    </Row>
                    <Row>
                        <button type="button" class="btn btn-warning"
                        onClick ={(e)=>this.setNamedTarget("home")}>
                            <h4>HOME</h4>
                        </button>
                    </Row>


                </Col>

                </Row>

            </div >


        )
    }
}

export default NavConsole