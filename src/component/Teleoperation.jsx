import React, { Component } from 'react'
import Config from './config/config';
import { Joystick } from 'react-joystick-component';
import Joy_img from './image/joy_img.jpg'
class Teleoperation extends Component {
    state =
        {
            connected: false,
            ros: null
        }

    constructor() {
        super()
        this.init_connection()
        this.handleMove = this.handleMove.bind(this)
        this.handleStop = this.handleStop.bind(this)
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

    handleMove(event)
    {
        var vel_pub = new window.ROSLIB.Topic(
            {
                ros: this.state.ros,
                name: Config.VEL_TOPIC,
                messageType: "geometry_msgs/Twist"
            }
        )

        var twist_msg = new window.ROSLIB.Message
        (
            {
                linear:
                {
                    x: event.y*0.5,
                    y: 0.0,
                    z: 0.0,

                },
                angular:
                {
                    x: 0.0,
                    y: 0.0,
                    z: -event.x*0.5
                }
            }
        )
        vel_pub.publish(twist_msg)
    }

    handleStop(event)
    {
        var vel_pub = new window.ROSLIB.Topic(
            {
                ros: this.state.ros,
                name: Config.VEL_TOPIC,
                messageType: "geometry_msgs/Twist"
            }
        )

        var twist_msg = new window.ROSLIB.Message
        (
            {
                linear:
                {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0,

                },
                angular:
                {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                }
            }
        )
        vel_pub.publish(twist_msg)
    }


    render() {
        return (
            <div>
                <Joystick
                    size={200}
                    sticky={false}
                    baseColor="black"
                    stickColor='white'
                    move ={this.handleMove}
                    stop = {this.handleStop}
                    stickImage={Joy_img}
                    
                >

                </Joystick>
            </div>


        )
    }
}

export default Teleoperation;