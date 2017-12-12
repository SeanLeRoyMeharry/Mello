import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Redirect } from 'react-router'
import NotesContainer from '../components/NotesContainer'
import Calendar from '../components/Calendar'
import TaskList from '../components/TaskList'
import TaskModal from '../components/TaskModal'
import InviteModal from '../components/InviteModal'
import MeetingModal from '../components/MeetingModal'

import { RingLoader } from 'react-spinners';

import firebase from 'firebase/app';


export default class MeetingDashboardPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            meeting: {},
            isMember: false,
            loading: true
        }
    }

    componentDidMount() {
        this.meetingRef = firebase.database().ref("meetings").child(this.props.match.params.meetingId);
        this.meetingRef.on("value", (snapshot) => {
            this.setState({ meeting: snapshot.val() });
            this.checkMember(snapshot.val().members);
        })
    }

    checkMember(members) {
        var BreakException = {};
        members.forEach((member) => {
            if (member.localeCompare(this.props.currentUser.uid) === 0) {
                this.setState({ isMember: true })
                throw BreakException;
            };
        })
        this.setState({ loading: false })
    }

    componentWillUnmount() {
        this.meetingRef.off()
    }

    updateMeetingDashboard = (state) => {
        this.setState(state);
    }

    toggleTaskModal = (messageContent) => {
        let newTitle = this.getTitle(messageContent);
        this.setState({
            taskModal: !this.state.taskModal,
            title: newTitle,
        });
    }

    getTitle = (str) => {
        let headings = [];

        for (let i = 1; i <= 6; i++) {
            headings.push(str.indexOf("<h" + i + ">"));
        }

        for (let i = 0; i < 6; i++) {
            if (headings[i] !== -1) {
                return str.substring(
                    str.indexOf("<h" + (i + 1) + ">") + 4,
                    str.indexOf("</h" + (i + 1) + ">")
                );
            }
        }

        return "";
    }

    render() {
        const styles = {
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
            }
        }

        if (this.props.currentUser != null && this.state.isMember === true) {
            return (
                <div style={{ height: "100%", padding: "5%" }}>
                    <Row style={{ height: "95%" }}>
                        <Col style={{ height: "100%" }} xs={6}>
                            <Row>
                                <div style={{ margin: 15 }}>
                                    <TaskModal
                                        buttonLabel={"Create Task"}
                                        currentUser={this.props.currentUser}
                                        meetingId={this.props.match.params.meetingId}
                                        showModal={this.state.taskModal}
                                        updatePage={this.updateMeetingDashboard}
                                        title={this.state.title}
                                    />
                                </div>
                                <div style={{ margin: 15 }}>
                                    <MeetingModal style={{ float: "right" }} buttonLabel={"Create Meeting"} currentUser={this.props.currentUser} />
                                </div>
                                <div style={{ margin: 15 }}>
                                    <InviteModal meeting={this.state.meeting} meetingId={this.props.match.params.meetingId}/>
                                </div>
                            </Row>
                            <Row style={{ height: "50%" }}>
                                <Container style={{ height: "95%" , overflowY:"auto"}}>
                                    <TaskList aria-live="polite" currentUser={this.props.currentUser} tasks={this.state.meeting.tasks} showModal={this.state.showModal} updatePage={this.updateMeetingDashboard}/>
                                </Container>
                            </Row>
                            <Row style={{ height: "50%" }}>
                                <Container style={{ height: "100%", width: "95%" }}>
                                    <Calendar aria-live="polite" currentUser={this.props.currentUser} />
                                </Container>
                            </Row>
                        </Col>
                        <Col style={{ height: "100%"}} xs={6}>
                            <NotesContainer
                                currentUser={this.props.currentUser}
                                meetingId={this.props.match.params.meetingId}
                                toggleModal={this.toggleTaskModal}
                            />
                        </Col>
                    </Row>
                </div>

            );
        } else {
            return (
                <div>
                    {this.state.loading ?
                        (<Container style={styles.spinner}>
                            <RingLoader
                                size={100}
                                color={'#123abc'}
                                loading={true}
                            />
                        </Container>) :
                        (<Redirect to="/welcome" />)}
                </div>
            );
        }
    }
}