import React, { Component } from 'react';
import { ListGroup, Collapse, ListGroupItem, ListGroupItemHeading, Card, CardBody, Row, Col, Button } from 'reactstrap';
import { NavLink } from "react-router-dom"
import Time from 'react-time'

import firebase from 'firebase/app';

// Author: Matthew Li
// Component renders and displays the user's meetings in a list format.
// Each list item, is a meeting card which can be clicked to open revealing
// extra information about the given meeting.

export default class MeetingList extends Component {

    render() {

        // Checks whether meetins have been passed into the component
        if (this.props.meetings && this.props.meetings != null) {
            const styles = {
                overFlow: {
                    maxHeight: 600,
                    overflowX: "hidden",
                    overflowY: "auto"
                }
            }

            // Sorts meetings based on their date field.
            let sortedMeetings = Object.keys(this.props.meetings).sort((a, b) => {
                return this.props.meetings[a].date - this.props.meetings[b].date;
            })

            // Produces MeetingItems for each meeting. 
            let meetingItems = sortedMeetings.map((id) => {
                return <MeetingItem key={id} id={this.props.meetings[[id]].id} />
            });

            return (
                <div style={styles.overFlow}>
                    <ListGroup>
                        {meetingItems}
                    </ListGroup>
                </div>
            )
        } else {
            return (
                <div>
                    No Meetings
            </div>
            )
        }

    }
}

// Author: Matthew Li
// MeetingItem component displays the information for a given meeting. 
// The component queries the database to display the various members,
// attending the meeting as well as other information about the meeting.

class MeetingItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            collapse: false,
            members: []
        }
    }

    componentDidMount() {
        this.meetingRef = firebase.database().ref("meetings").child(this.props.id);
        this.memberRef = firebase.database().ref("members");

        this.meetingRef.on("value", (snapshot) => {
            this.setState({ meeting: snapshot.val() });
        });
    }

    // Creates calls to the database for member's display names.
    getMembers() {
        let tempMembers = [];
        if (this.state.meeting.members && this.state.meeting.members != null) {
            Object.keys(this.state.meeting.members).map((key) => {
                this.memberRef.child(this.state.meeting.members[key]).once("value", (snapshot) => {
                    tempMembers.push(snapshot.val());
                })
            });
        }
        return tempMembers;
    }

    // Toggles the card open/close
    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    // Kills the meetingRef
    componentWillUnmount() {
        this.meetingRef.off();
    }

    // Renders the actual meeting component
    render() {
        if (this.state.meeting) {
            let memberNames = this.getMembers();

            let displayMembers = Object.keys(memberNames).map((user) => {
                return <li key={user}>{memberNames[user].displayName}</li>
            })

            return (
                <ListGroupItem action onClick={() => this.toggle()} aria-live="polite">
                    <Row style={{ marginTop: 10 }} onClick={() => this.toggle()}>
                        <Col xs={6}>
                            <ListGroupItemHeading>{this.state.meeting.meetingName}</ListGroupItemHeading>
                        </Col>
                        <Col xs={6}>
                            <span style={{ float: "right" }}>
                                <Time value={this.state.meeting.date} format="MM/DD/YYYY" />
                            </span>
                        </Col>
                    </Row>
                    <div>
                        <Collapse
                            isOpen={this.state.collapse}
                        >
                            <Button style={{ marginTop: 5, marginBottom: 5 }} color="primary"><NavLink style={{ color: "white" }} to={"/meeting/" + this.props.id}>Enter Meeting</NavLink></Button>
                            <Card>
                                <CardBody>
                                    <p className="h6">Description</p>
                                    {this.state.meeting.description}
                                    <p className="h6 mt-2">Members Attending</p>
                                    <ol>
                                        {displayMembers}
                                    </ol>
                                </CardBody>
                            </Card>
                        </Collapse>
                    </div>
                </ListGroupItem>
            )
        } else {
            ; return null;
        }
    }
}