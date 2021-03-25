// File Description:
// This is the main react component in this one page application that contains all the other sub components into one view

// importing any libraries and components
import './App.css';
import './bootstrap.min.css';
import './index.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import React from 'react';
import BarChart from "./barChart.js";
import ResultsTable from "./resultsTable.js";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Map from './Map.js';
import StatusBanner from './statusBanner.js';

// main class that is rendered by index.html
class App extends React.Component {

  // declaring all methods and state variables needed by the application
  constructor(props){
    super(props)
    // this main state acts as the basis for any data passed to the components as props
    this.state = {
      // this will populate with the data returned from the API fetch request. 
      disasterDetails: [],
      // these arrays are used to format the data correctly for the bar/scatter graph
      x : [],
      y: [],
      // this boolean value is used to change the state of the refresh dashboard button
      loading: false,
      // this location array of objects is used for plotting the returned locations on the map
      // in future these would be pulled from an external dataset of locations rather than being hard-coded
      locationLatAndLongs: [
                            {"latitude": "38.934441", "longitude" : "-74.922371"},
                            {"latitude": "40.534969", "longitude" : "-74.299507"},
                            {"latitude": "40.338539", "longitude" : "-74.063721"},
                            {"latitude": "42.631569", "longitude" : "-70.783791"},
                            {"latitude": "39.360611", "longitude" : "-74.431877"},
                            {"latitude": "41.043916", "longitude" : "-74.103379"},
                            {"latitude": "40.711946", "longitude" : "-73.999958"}
                          ],
      // this array is used to format the data correctly for the map view
      mapData: [],
      // this status string is used to change top banner state. The default status is 'warning' which states the dash is empty
      status: 'warning',
    }

    // we're explicitly binding the state to the method so when we call the method it knows what 'this' is referring to
    this.getModelPredictions = this.getModelPredictions.bind(this)
    this.addPredictionToState = this.addPredictionToState.bind(this)
  }

  // This method runs on first render of the page and automatically trigger the dashboard prediction method
  componentDidMount() {
    this.getModelPredictions()
  }
  // This method is called by getModelPredictions() if the fetch request is a success
  addPredictionToState(result){
    // declaring all variables needed in the method 
    // its crucial that you make a copy to change rather than changing the current state itself as this messes with react's abiltiy to know what to render (Immutable State)
    let disasterDetailsCopy = this.state.disasterDetails.slice()
    let xCopy = this.state.x.slice()
    let yCopy = this.state.y.slice()
    let loadingCopy = this.state.loading
    let locationLatAndLongs = this.state.locationLatAndLongs
    let statusCopy = this.state.status.slice()
    let mapDataArray = []
    var i

    // if a value of 0 is returned from AWS that means no disasters are detected
    if(Object.is(result, "0")){
      statusCopy = 'success'

    }
    // otherwise a potential disaster is being detected
    else {

      // disasterDetails is set as the reult of the fetch
      disasterDetailsCopy = result
      // status is changed to danger which updates the top status banner
      statusCopy = 'danger'

      // This for loop separates the data into locations & tweet count & added to the x and y arrays for the graph UI
      // Also stores each individual object in the disasterDetails array to the map data array to be formatted for the map UI 
      for (i = 0; i < disasterDetailsCopy.length; i++) {

        // Appending the latLong to the map data so they can be plotted on the map UI
        let anothObject = { ...disasterDetailsCopy[i], ...locationLatAndLongs[i] };
        mapDataArray.push(anothObject)

        for (const [key, value] of Object.entries(disasterDetailsCopy[i])) {

          if(key === "disasterLocation"){
            var locationSplit = value.split(",");
            xCopy.push(locationSplit[0])
          }
          else if(key === "tweetCount"){
            yCopy.push(value)
          }
        }
      }
    }
    // Once loading is complete boolean value this will re enable the refresh dashboard button
    loadingCopy = false

    // This is updating all the state values so we can dynamically update the dashboard with the API results
    this.setState({
      loading: loadingCopy,
      disasterDetails : disasterDetailsCopy,
      mapData : mapDataArray,
      y : yCopy,
      x : xCopy,
      status: statusCopy
    })
  }

  // this method is called on click of the refresh dashboard button
  getModelPredictions() {
    try {
      // declaring all variables needed in the method 
      let loadingCopy = this.state.loading
      let statusCopy = this.state.status
      loadingCopy = true
      statusCopy = 'loading'
      // Updating the state values
      this.setState({loading : loadingCopy, status: statusCopy})
      // sending a fetch request via API Gateway to a lambda function that returns the disaster detection results
      fetch('https://m84d283bij.execute-api.eu-west-2.amazonaws.com/prod/detect-disaster', {
        method: 'GET',
        headers: {
        // Without this security key access will be denied
        'x-api-key' : '7djDhHzHvi584q2VgHvzc36NGq2TtbueaTPy1Y3x'    
        },
      })
      .then(response => response.json())
      .then(result => {
        // if the request was a success a method will be called to do all of the returned data processing 
        this.addPredictionToState(result);
        console.log('Success:', result);
      })
    } catch (error) {
      // if an error occurs an error banner will appear and the refresh button  will be enabled again
      let loadingCopy = this.state.loading
      let statusCopy = this.state.status
      statusCopy = 'error'
      loadingCopy = false
      // Updating the state values
      this.setState({loading : loadingCopy, status: statusCopy})
      // error is logged for testing & reporting purposes
      console.error(error);
    }
  }
// This is the JSX that is rendered as the dashboard UI
  render() {
  return (
      <div className="App">
        <Navbar collapseOnSelect expand="lg" className="justify-content-between color-nav">
          <Form inline>
            <Navbar.Brand className="nav-title">Natural Disaster Early Warning System</Navbar.Brand>
          </Form>
          <Form inline>
          <Button onClick={this.getModelPredictions} disabled={this.state.loading} className="custom-btn">
            {/* if the loading boolean is true then the button is disabled and reads as 'refreshing', else its enabled and reads 'refresh dashboard' */}
            {this.state.loading ? 'Refreshing…' : 'Refresh Dashboard'}
          </Button>
          </Form>
        </Navbar>
        <Container fluid>
          <Row className="status-banner"><StatusBanner data={this.state.status}></StatusBanner></Row>
          <Row style={{marginTop:'40px'}}>
            <Col>Geographical Representation of Potential Disaster Affected Areas</Col>
           <Col className="fill-horizontal" xs={12}><Map data={this.state.mapData}/></Col>
          </Row>
          <Row>
            <Col style={{marginTop:'20px'}} xs={12} lg={6}><BarChart x={this.state.x} y={this.state.y}/></Col>
            <Col style={{marginTop:'40px'}} xs={12} lg={6}><ResultsTable data={this.state.disasterDetails}/></Col>
          </Row>
        </Container>
      </div>
    );
  }
}
// App.js is the traditional and actual entry point for all node apps
export default App;
