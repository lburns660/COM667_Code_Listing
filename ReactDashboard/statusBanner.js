// File Description:
// This is the statusBanner component that is imported into the app.js file  and returns a banner for the top of the dashboard to provide feedback to the user on the current dashbaord state

// importing any libraries and components
import React from 'react'
import Alert from 'react-bootstrap/Alert'

class StatusBanner extends React.Component{
    // setting state data needed for the status banner component
    constructor(props) {
        super(props);
        this.state = {
            alertType: 'warning',
        };
    }
    // this method sets the alert status passed from the props into the component state so the banner can be dynamically updated
    updateStateAndNotify(props){
        let alertTypeCopy = this.state.alertType.slice()
        alertTypeCopy = props.data
        this.setState({alertType: alertTypeCopy});
    }

    // this method is triggered every time the application state changes, enabling the banner to update dynamically
    componentDidUpdate(prevProps) {
        // this is checking if the map data has updated. If so then then the map needs updated and updateStateAndNotify() is called
        if (this.props.data !== prevProps.data) {
            this.updateStateAndNotify(this.props);
        }
    }
    // this is what is returned when you import this component
    render(){
        // this switch statement checks for various different status strings and return the correct banner based on its value
        var alert = this.state.alertType
        switch (alert) {
            case 'warning':
                return <Alert className="status-banner" variant={alert}>Your dashboard appears to be empty! Please select 'refresh dashboard' to receive a prediction</Alert>
            case 'loading':
                return <Alert className="status-banner" variant={'warning'}>Fetching predictions: this usually takes 20 seconds...</Alert>      
            case 'success':
                return <Alert className="status-banner" variant={alert}>No disasters have been predicted</Alert>
            case 'danger':
                return <Alert className="status-banner" variant={alert}>We are detecting a potential disaster</Alert> 
            default:
                return <Alert className="status-banner" variant={'danger'}>A problem has occured. Please try again in a few minutes</Alert>
        }
    }
}
export default StatusBanner;