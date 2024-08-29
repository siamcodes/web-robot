import React, { Component } from 'react'
import Config from './config/config';
import * as Three from "three"
import {Row, Col} from 'react-bootstrap'
class RobotState extends Component {
    state =
        {
            connected: false,
            ros: null,
            info_msg: "",
            x: 0,
            y: 0,
            yaw: 0,
            linear_vel: 0,
            angular_vel: 0,
           
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

    getRobotInfo() {
        var info_sub = new window.ROSLIB.Topic
        (
            {
            ros: this.state.ros,
            name: Config.INFO_TOPIC,
            messageType: "std_msgs/String",
            }
        )
         info_sub.subscribe(
            (message) => {
                this.setState({info_msg: message.data})
            }
         )

    }

    getRobotState() {
        var pose_sub = new window.ROSLIB.Topic
        (
            {
            ros: this.state.ros,
            name: Config.ODOM_TOPIC,
            messageType: "nav_msgs/Odometry",
            }
        )
         pose_sub.subscribe(
            (message) => {
                this.setState({x: message.pose.pose.position.x.toFixed(2)})
                this.setState({y: message.pose.pose.position.y.toFixed(2)})
                this.setState({linear_vel: message.twist.twist.linear.x.toFixed(2)})
                this.setState({angular_vel: message.twist.twist.angular.z.toFixed(2)})
                this.setState({yaw: this.getEulerFromQuat(message.pose.pose.orientation).toFixed(2) })
            }
         )

    }

    getEulerFromQuat(quat)
    {
        var q = new Three.Quaternion(
            quat.x,
            quat.y,
            quat.z,
            quat.w,
        )

        var rpy = new Three.Euler().setFromQuaternion(q)
        return rpy["_z"] * (180 / 3.14159)
    }

    componentDidMount()
    {
        this.getRobotInfo()
        this.getRobotState()
    }


    render() {
        return (
            <div>
                
                <p>{this.state.info_msg}</p>     
                <h2>Odometry</h2>
                <Row>
                <Col>
                <p>x: {this.state.x}</p>  
                <p>y: {this.state.y}</p>  
                <p>yaw: {this.state.yaw}</p> 
                </Col>

                <Col>
                <p>linear velocity: {this.state.linear_vel}</p>  
                <p>angular velocity: {this.state.angular_vel}</p>  
                </Col>
                </Row>
               
                 
                

            </div>


        )
    }
}

export default RobotState;