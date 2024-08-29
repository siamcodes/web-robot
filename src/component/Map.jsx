import React, { Component } from 'react'
import Config from './config/config';
import * as Three from "three"
import {Row, Col, ButtonGroup, Button} from 'react-bootstrap'
import { BsZoomIn, BsZoomOut, BsFillCaretLeftFill,
        BsFillCaretRightFill,BsFillCaretUpFill,BsFillCaretDownFill
        } from 'react-icons/bs';
class Map extends Component {
    state =
        {
            connected: false,
            ros: null,
            viewer: null,  
            map_x: 0.0,
            map_y: 0.0,
            map_yaw: 0.0,    
            goal_x: 0.0,
            goal_y: 0.0,
            goal_yaw: 0.0,      
           
        }

    constructor() {
        super()
        this.init_connection()
        this.view_map = this.view_map.bind(this)
        
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

    view_map()
    {
        var viewer = new window.ROS2D.Viewer
        (
            {
                divID: "map_show",
                width: 1000,
                height: 600,
            }
        )
        this.setState({viewer})

        var mapClient = new window.ROS2D.OccupancyGridClient
        (
            {
                ros: this.state.ros,
                rootObject: viewer.scene,
                topic: Config.MAP_TOPIC,
                continuous: true,
            }
        )

        mapClient.on
        ('change', function()
        {
            viewer.scaleToDimensions(mapClient.currentGrid.width,
                mapClient.currentGrid.height,
                1)
            viewer.shift(mapClient.currentGrid.pose.position.x,
                mapClient.currentGrid.pose.position.y
            )
        })

        viewer.addRobot(0,0,0.5,0.5, '#cc0066')
        viewer.addCurrentGoal(0,0,0.5, ' #138d75 ')
    }

    map_zoom(factor)
    {
        if(this.state.viewer)
            {
                if(factor>0)
                    {
                        factor = factor + 1
                        this.state.viewer.zoomIn(factor)
                    }
                else if(factor < 0)
                    {
                        this.state.viewer.zoomOut(1.1)
                    }
            }
    }

    map_pan(dx,dy)
    {
        if(this.state.viewer)
            {
                this.state.viewer.shift(dx,dy)
            }
    }

    getMapPose() {
        var pose_sub = new window.ROSLIB.Topic
        (
            {
            ros: this.state.ros,
            name: Config.MAPPOSE_TOPIC,
            messageType: "geometry_msgs/PoseWithCovarianceStamped",
            }
        )
         pose_sub.subscribe(
            (message) => {
                this.setState({map_x: message.pose.pose.position.x.toFixed(2)})
                this.setState({map_y: message.pose.pose.position.y.toFixed(2)})
               
                this.setState({map_yaw: this.getEulerFromQuat(message.pose.pose.orientation).toFixed(2) })
            console.log(this.state.map_yaw)
            this.updateRobotPosition(this.state.map_x, this.state.map_y, 180-this.state.map_yaw)

            }
         )

         this.getNavGoal()


    }

    sendMapClickPosition(x,y)
    {
        var map_click_pub = new window.ROSLIB.Topic(
            {
                ros: this.state.ros,
                name: Config.MAPCLICK_TOPIC,
                messageType: "geometry_msgs/Vector3",
            }
        )

        var poseclick_msg = new window.ROSLIB.Message(
            {
                x: parseFloat(x),
                y: parseFloat(y),
                z: 0.0,
            }
        )

        map_click_pub.publish(poseclick_msg)
    }

    updateRobotPosition(x,y,yaw)

    {
        if(this.state.viewer)
            {
                this.state.viewer.updateArrowPosition(0,x,y)
                this.state.viewer.updateArrowRotation(0,yaw)
                
                var clickPos = this.state.viewer.getMapClickPosition();
                this.sendMapClickPosition(clickPos.x, clickPos.y)
            
            }
        
    }

    update_goal_position(x,y)
    {
        if (this.state.viewer)
            {
                this.state.viewer.updateGoalPosition(0, x,y)
            }
    }

    getNavGoal()
    {
        var goal_subscriber = new window.ROSLIB.Topic(
            {
                ros: this.state.ros,
                name: Config.NAVP2P_TOPIC,
                messageType: "geometry_msgs/Vector3",
            }
        )

        goal_subscriber.subscribe(
           (message)=>{
                this.setState({goal_x: message.x.toFixed(2)})
                this.setState({goal_y: message.y.toFixed(2)})
                this.setState({goal_yaw: message.z.toFixed(2)})
            this.update_goal_position(message.x, message.y)
            } 
           
        )
        
        
    }
    componentDidMount()
    {   
        this.view_map()
        this.getMapPose()
       
    }


    render() {
        return (
            <div>
                <Row>
                    <div id = "map_show"></div>
                </Row>

                <Row>
                    
                   
                    <ButtonGroup>
                        <Button variant="outline-primary" onClick={()=>this.map_zoom(-0.1)}><BsZoomOut/></Button>
                        <Button variant="outline-primary" onClick={()=>this.map_zoom(0.1)}><BsZoomIn/></Button>
                        <Button variant="outline-primary" onClick={()=>this.map_pan(0.5, 0.0)}><BsFillCaretLeftFill/></Button>
                        <Button variant="outline-primary" onClick={()=>this.map_pan(-0.5, 0.0)}><BsFillCaretRightFill/></Button>
                        <Button variant="outline-primary" onClick={()=>this.map_pan(0.0, -0.5)}><BsFillCaretUpFill/></Button>
                        <Button variant="outline-primary" onClick={()=>this.map_pan(0.0, 0.5)}><BsFillCaretDownFill/></Button>

                    </ButtonGroup>
         
                   
                </Row>
                 

            </div>


        )
    }
}

export default Map;