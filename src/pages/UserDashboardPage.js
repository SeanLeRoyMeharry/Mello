import React, { Component } from 'react';
import firebase from 'firebase/app';
import { Container, Col, Row, Button } from 'reactstrap';
import TaskList from '../components/TaskList';
import  MeetingModal from '../components/MeetingModal.js';
import Calendar from '../components/Calendar'
import { RingLoader } from 'react-spinners';


import MeetingList from '../components/MeetingList.js';

export default class UserDashboardPage extends Component {

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
            let taskRef = firebase.database().ref("tasks").child(this.props.currentUser.uid);

            taskRef.on("value", (snapshot) => {
                this.setState({ tasks: snapshot.val() });
            });

            this.setState({ loading: true })

            this.memberRef = firebase.database().ref("members").child(this.props.currentUser.uid).child("permissions");

            this.memberRef.on("value", (snapshot) => {
            
                this.setState({ meetings: snapshot.val() });
            });
        }
    }

    componentWillUnmount() {
        if (this.props.currentUser) {
            this.memberRef.off();
        }
    }

    performAdd() {
        firebase.database().ref("members").once('value', (snapshot) => { console.log(snapshot.val()) }).catch((error) => {
            console.log(error);
        })
    }

    render() {
        const styles = {
            row: {
                minHeight: "50%",
                maxHeight: "50%"
            },
            container: {
                height: "100%",
                paddingTop: 100
            },
            spinner: {
                display: "inline-block",
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                width: 100,
                height: 100,
                margin: "auto",
                paddingRight: "auto",
                paddingLeft: "auto"
            },
            overFlow: {
                maxHeight: "30%",
                overflowX: "hidden",
                overflowY: "auto"
            },
            marginTop: {
                marginTop: 40
            },
            imageCircle: {
                width: "25%",
                paddingTop: "25%",
                backgroundSize: "cover",
                display: "block",
                borderRadius: "50%",
                marginRight: "auto",
                marginLeft: "auto"
            }
        }

        if (this.props.currentUser) {
            return (
                <Container style={styles.container}>
                    <Row>
                        <Col>
                            <div className="pull-right" style={{ display: "inline-block" }}>
                                <Row>
                                    <MeetingModal style={{ display: "inline" }} buttonLabel={"Create Meeting"} currentUser={this.props.currentUser} />
                                    <Button style={{ display: "inline", marginLeft:10}} color="secondary" onClick={() => this.props.signoutHandle()}>Sign Out</Button>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        {this.props.currentUser.photoURL &&
                            <div style={{ ...styles.imageCircle, ...{ backgroundImage: 'url(' + this.props.currentUser.photoURL + ')' } }}
                                role="img" alt={"profile image for " + this.props.currentUser.displayName}></div>
                        }
                        {
                            !this.props.currentUser.photoURL &&

                            <div style={{ ...styles.imageCircle, ...{ backgroundImage: 'url(https://firebasestorage.googleapis.com/v0/b/chat-b9230.appspot.com/o/user.png?alt=media&token=d9e9621e-58fa-4c18-bd2d-c6d31b677a9d)' } }}
                                alt={"profile image for " + this.props.currentUser.displayName} role="img"></div>
                        }
                    </Row>
                    <Row style={{ ...styles.row, ...styles.marginTop, ...styles.overFlow }}>
                        <Col xs="12">
                            <p className="h3 mt-2">Tasks</p>
                            <TaskList  aria-live="polite" currentUser={this.props.currentUser} tasks={this.state.tasks} />
                        </Col>
                    </Row>
                    <Row style={{ ...styles.row, ...styles.marginTop, ...styles.overFlow }}>
                        <Col sm="12" md="6" style={{ height: 400}}>
                            <Calendar  aria-live="polite" currentUser={this.props.currentUser} />
                        </Col>
                        <Col sm="12" md="6">
                            <p className="h3 mt-2">Meetings:</p>
                            <MeetingList  aria-live="polite" currentUser={this.props.currentUser} meetings={this.state.meetings} />
                        </Col>
                    </Row>
                </Container >
            );
        } else {
            return (
                <Container style={styles.spinner}>
                    <RingLoader
                        size={100}
                        color={'#123abc'}
                        loading={true}
                    />
                </Container>
            );
        }

    }
}