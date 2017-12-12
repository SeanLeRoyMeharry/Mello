import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import firebase from 'firebase/app';
import React, { Component } from 'react';

BigCalendar.momentLocalizer(moment); // or globalizeLocalizer

export default class Calendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            meetings: {},
            tasks: {},
            events: []
        }
    }

    componentDidMount() {
        if (this.props.currentUser) {
            this.taskRef = firebase.database().ref("tasks").child(this.props.currentUser.uid);

            this.taskRef.on("value", (snapshot) => {
                this.setState({ tasks: snapshot.val() });
                this.gatherEvents();
            });


            this.memberRef = firebase.database().ref("members").child(this.props.currentUser.uid).child("permissions");
            this.memberRef.on("value", (snapshot) => {
                this.setState({ meetings: snapshot.val() });
                this.gatherEvents();
            });
        }
    }

    gatherEvents() {
        let events = [];
        if (this.state.tasks && this.state.tasks != null) {
            let taskIds = Object.keys(this.state.tasks);
            taskIds.map((id) => {
                let date = new Date(this.state.tasks[id].dueDate);
                let endDate = new Date(date);
                endDate.setDate(date.getDate() + 1);

                events.push({
                    'title': this.state.tasks[id].taskName,
                    'start': date,
                    'end': endDate,
                    'allDay': true
                })
            })
        }

        if (this.state.meetings && this.state.meetings != null) {
            let meetingIds = Object.keys(this.state.meetings);
            meetingIds.map((id) => {
                let date = new Date(this.state.meetings[id].date);
                let endDate = new Date(date);
                endDate.setHours(date.getHours() + 2);

                events.push({
                    'title': this.state.meetings[id].name,
                    'start': date,
                    'end': endDate,
                })
            })
        }
        this.setState({ events: events });
    }

    componentWillUnmount() {
        this.memberRef.off();
        this.taskRef.off();
    }

    render() {
        return (
            <div style={{ width: "100%", maxHeight: "100%", overflowY:"auto"  }}>
                <BigCalendar style={{ width: "100%", height: "100%"}}
                    {...this.props}
                    events={this.state.events}
                    views={["month", "day"]}
                    step={60}
                    defaultDate={new Date()}
                />
            </div>
        )
    }
}
