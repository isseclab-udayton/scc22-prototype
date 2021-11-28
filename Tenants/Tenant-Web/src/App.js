
import React from 'react';

import PeopleCountApp from './PeopleCountApp';
import VideoApp from './VideoApp';


import { Card} from 'react-bootstrap';

class App extends React.Component {


  render() {

    return (
      <div className="App">
        <Card >
          <VideoApp  username={this.props.username} password={this.props.password}  />          
          <Card.Body>
            <Card.Title>[{this.props.username}]  <PeopleCountApp username={this.props.username} password={this.props.password} /></Card.Title> 
            <Card.Text>
            {this.props.msg}
            </Card.Text>            
          </Card.Body>
        </Card>
    </div>
  );
  }
}

export default App;
