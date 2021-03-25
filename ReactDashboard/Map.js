// File Description:
// This is the map component that is imported into the app.js file  and returns the map UI on the dashboard

// importing any libraries and components
import React from 'react'
import Plot from 'react-plotly.js';

// this method takes an array of objects (rows) passed in, checks each object and pulls out the value which corresponds with the key parameter (key/value pairs)
function unpack(rows, key) {
    return rows.map(function(row) {
        return row[key];
    });
}

// main component class
class Map extends React.Component{
    // declaring all state variables needed by the component
    constructor(props) {
        super(props);
        this.state = {
            inputData: [],
            inputLayout: {},
        };
    }
    // this method is triggered every time the application state changes, enabling the map to update dynamically
    componentDidUpdate(prevProps) {
        // this is checking if the map data has updated. If so then then the map needs updated and createUpdateMapView() is called
        if (this.props.data !== prevProps.data) {
            this.createUpdateMapView();
        }
    }
    // this method sets all the information needed to render the map correctly
    createUpdateMapView() {
        let inputDataCopy = this.state.inputData
        let inputLayoutCopy = this.state.inputLayout

        // setting the map points data based on props
        inputDataCopy = [
            {
                type:'scattermapbox',
                lat:unpack(this.props.data, "latitude"),
                lon:unpack(this.props.data, "longitude"),
                text : unpack(this.props.data, "disasterLocation"), 
                hover_data: unpack(this.props.data, "tweetCount"),
                mode:'markers',
                marker: {
                    color: "#5B7B6E",
                    size:20
                },
            }
        ];
        // setting the map type, the default location fo the map & setting the autosize to true so it can re-render for mobile screens
        inputLayoutCopy = {
            dragmode: "zoom",
            mapbox: { style: "open-street-map", center: { lat: 38, lon: -90 }, zoom: 3, height: 300 },
            margin: { r: 0, t: 0, b: 0, l: 0 },
            hovermode: "closest",   
            autosize: true,
        };

        this.setState({inputData: inputDataCopy, inputLayout: inputLayoutCopy});
    }
    // this method runs on first render of the page
    componentDidMount() {
        this.createUpdateMapView();
    }
    // this is what is returned when you import this component
    render(){
        // setting all the information initalised above to the correct plot attributes. The userResizeHandlee also enables the map to resize
        return <Plot style={{width:'100%'}} useResizeHandler key={this.props.data} data={this.state.inputData}layout={this.state.inputLayout}/>
    }
}
export default Map;