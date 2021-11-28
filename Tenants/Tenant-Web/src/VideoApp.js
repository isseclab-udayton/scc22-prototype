
import './App.css';

import ReactHlsPlayer from 'react-hls-player';

import React from 'react';



class VideoApp extends React.Component {

  constructor(props) {
    super(props);
    this.playerRef = React.createRef();

    this.video_status = false;

    this.state = {
      reload: false
    };

    this.reloadpage_interval= undefined

    

  }

  componentDidMount() {

    

    let reloadpage_interval = setInterval(() => {
      console.log("Reloading Video Component");
      this.setState(
        {reload: true},
        () => this.setState({reload: false})
      )
    }, 10000);


    this.playerRef.current.addEventListener('play', function(){
      console.log("Clearing Interval")
      clearInterval(reloadpage_interval)
      
    });

    this.playerRef.current.defaultMuted = true;
    this.playerRef.current.muted = true;


    
  }


  

  render() {

  return (    
          <ReactHlsPlayer
          id={this.props.username}
        src={`http://192.168.99.104:8088/hls/smartcity.camera.stream.usa.ohio.store_x.city_surveillance.m3u8?username=${this.props.username}&password=${this.props.password}`}
        autoPlay={true}
        controls={true}
        width="550"
        height="auto"
        playerRef={this.playerRef}
        hlsConfig={{
          autoStartLoad: true,
          startPosition: 0,
          debug: false,
          volume: 0
          // ...
        }}
      />      
  );
  }
}

export default VideoApp;
