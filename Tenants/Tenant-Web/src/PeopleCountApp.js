
import './App.css';
import mqtt from 'mqtt';


import DataFrame from "dataframe-js";

import React from 'react';

class PeopleCountApp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {people_count:0};

    this.df = new DataFrame([], ["Timestamp","data"])


  }


  componentDidMount(){

    const client = mqtt.connect('ws://192.168.99.104:8888',{username: this.props.username,password: this.props.password});

    client.on('connect', function () {
          console.log("Connected")
      
          client.subscribe('/smartcity/camera/people_count/usa/ohio/store_x/city_ai', function (err) {           
              
          })
    });


    client.on('message', (topic, payload, packet) => {

      // console.log(payload.toString());

      this.df= this.df.push([Date.now(),  payload.toString()])

      this.df.show();

      const last_5mins = Date.now() - 5*60*1000



      this.setState({
        people_count: payload.toString(),
        max_5mins: this.df.filter(row => row.get('Timestamp') > last_5mins).stat.max("data")
      });

    });
          
      

  }
  render() {
    
  return (
    
        
        <span>
          People Count: {this.state.people_count || 0}  (Max last 5 minutes: <span className="text-danger"> {this.state.max_5mins || 0} </span>)
        </span>
        
     
  );
  }
}


export default PeopleCountApp;
