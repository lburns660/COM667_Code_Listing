// File Description: 
// This component is the bar/scatter plot that is imported into the app.js file & rendered on the dashboard

// import statements
import React from 'react'
import Plot from 'react-plotly.js';

class BarChart extends React.Component{
    render(){
        return(
            <Plot
                config = {{
                    responsive: true,
                }}
                style={{width:'100%', marginLeft: 'auto', marginRight: 'auto'}}
                // Identfiying that the scatter and bar chart plots should use the x & y arrays passed in from the main state via props
                data={[
                    {
                        name: "Scatter Graph",
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: {color: 'black'},
                        x : this.props.x,
                        y: this.props.y
                    },
                    {
                        name: "Bar Chart", 
                        type: 'bar', 
                        marker: {color: '#5B7B6E'}, 
                        x: this.props.x, 
                        y: this.props.y
                    },
                ]}
                // Setting the stylings of the graph
                layout={ 
                    {
                        hovermode: "closest",
                        title: '<b>Scatter Plot & Bar Chart Analysis</b>',
                        yaxis: {
                            title: "<b>TWEET COUNT</b>", 
                            titlefont: {
                                family: 'Arial, sans-serif',
                                size: 18,
                                color: '#5B7B6E'
                            
                              },
                            showticklabels: true,
                            tickangle: 0,
                            tickfont: {
                                family: 'Arial, sans-serif',
                                size: 14,
                                color: 'black'
                            },
                        },
                        xaxis: {
                            title: "<b>CITY AFFECTED</b>",
                            titlefont: {
                                family: 'Arial, sans-serif',
                                size: 18,
                                color: '#5B7B6E'
                            },
                            showticklabels: true,
                            tickangle: 20,
                            tickfont: {
                                family: 'Arial, sans-serif',
                                size: 14,
                                color: 'black'
                            }
                        }
                    } 
                }
            />
        );
    }
}
export default BarChart;