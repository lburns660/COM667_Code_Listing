// File Description:
// This is the resultsTable component that is imported into the app.js file  and returns a 2 columned table of prediction results to the dashboard

// importing any libraries and components
import React from 'react'
import BootstrapTable from 'react-bootstrap-table-next';

// main class
class ResultsTable extends React.Component{

    render(){
        return(
            // setting the props data, stylings & titles for the table & columns
            <BootstrapTable
                style={{font: 'American Typewriter, serif'}}
                striped 
                bordered 
                keyField="disasterLocation"
                data={this.props.data} 
                // dynamically adding a row number column
                selectRow={{
                    mode: 'any',
                    selectionRenderer: ({rowIndex}) => (
                      <div>{rowIndex + 1}</div>
                    )
                }}
                columns = {[
                    {
                    dataField: 'disasterLocation',
                    text: 'City Affected',
                    }, 
                    {
                    dataField: 'tweetCount',
                    text: 'Disaster Related Tweet Count',
                    order: 'asc',
                    // makes the data appear in ascending order by tweet count
                    sortFunc: (a, b, order, dataField, rowA, rowB) => {
                        if (order === 'asc') {
                          return b - a;
                        }
                        return a - b; // desc
                      }
                    },
                ]}
            />
        );
    }
}
export default ResultsTable;