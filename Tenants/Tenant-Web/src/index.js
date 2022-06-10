import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';


import 'bootstrap/dist/css/bootstrap.min.css';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";



ReactDOM.render(
  <Router>
      

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>

        <Route path="/home">

          <React.StrictMode>
            <div class="container">

              <div class="row center">
                <div class="col ">
                  <h1>University of Dayton</h1>
                  <h2>Context-Based Multi-Tenancy Policy Enforcement For Data Sharing In Iot Systems</h2>
                  <h2>July, 2021</h2>
                  
                </div>
              </div>

              <div class="row p-1">

                

                <div class="col-6 border border-secondary">
                <iframe title="tenant-2" src="/tenant-2" width="640" height="450"></iframe>
                </div>

                <div class="col-6 border border-success">
                <iframe title="tenant-3" src="/tenant-3" width="640" height="450"></iframe>
                </div>

              </div>

              <div class="row p-1">
               

                <div class="col-6 border border-warning">
                <iframe title="tenant-4" src="/tenant-4" width="640" height="450"></iframe>
                </div>
              </div>
          </div>
            
          </React.StrictMode>
            
        </Route>
          
          <Route path="/context_sensing">
            {/* <App username="context_sensing" password="123456" msg="HAHA"/> */}
          </Route>

          <Route path="/tenant-2">
            <App username="tenant-2" password="123456" msg="This tenant has access to the video all the time for analyzing"/>
          </Route>

          <Route path="/tenant-3">
            <App username="tenant-3" password="123456" msg="This tenant has access to the video if the people count >= 15"/>
          </Route>

          <Route path="/tenant-4">
            <App username="tenant-4" password="123456" msg="This tenant has access to the video if the people count >- 30"/>
          </Route>
          
        </Switch>
      
    </Router>,
  document.getElementById('root')
);





// ReactDOM.render(
//   <React.StrictMode>
//     <div class="container">

//       <div class="row">
//         <div class="col">
//           Context-based 
//         </div>
//       </div>

//       <div class="row p-1">

//         <div class="col-6 border border-primary">
//           <App username="context_sensing" password="123456" msg="HAHA"/>
//         </div>

//         <div class="col-6 border border-secondary">
//           <App username="tenant-3" password="123456" msg="HAHA" />
//         </div>

//       </div>

//       <div class="row p-1">

//         <div class="col-6 border border-success">
//           <App username="tenant-4" password="123456" msg="HAHA"/>
//         </div>

//         <div class="col-6 border border-warning">
//           <App username="tenant-2" password="123456" msg="HAHA"/>
//         </div>

//       </div>
//   </div>
    
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

