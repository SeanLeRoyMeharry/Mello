/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Container, Row, Col } from 'reactstrap';
import moment from 'moment';
import InfiniteCalendar from 'react-infinite-calendar';
import 'react-infinite-calendar/styles.css'; // only needs to be imported once
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';

import MultiSelect from './MultiSelect'

import firebase from 'firebase/app';

// Author: Matthew Li
// Component serves as the modal in which user can create new meetings.
// Modal is rendered on both the meeting dashboard page and the user
// dashboard page. Contains various inputs for defining the meeting. 
// Updates the firebase database accordingly to give users permissions etc.

class MeetingModal extends React.Component {

    // Defaults for Modal.
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            date: new Date(),
            m: moment(),
            description: "",
            title: "",
            time: "10:30",
            blocking: false,
            selectedOption: '',
            selectedUsers: this.props.currentUser.uid,
            users: []
        };
        this.toggle = this.toggle.bind(this);
    }

    // Creates a reference to the firebase database in order to 
    // populate the dropdown for users to invite.
    componentDidMount() {
        this.userRef = firebase.database().ref("members");
        this.userRef.on("value", (snapshot) => {
            let data = snapshot.val()
            let userArray = Object.keys(data).map((key) => {
                return { label: data[key].displayName, value: key }
            });
            this.setState({ users: userArray });
        });
    }

    // Kills the user ref.
    componentWillUnmount() {
        this.userRef.off();
    }

    // Toggles the modal open and closed. Resets to defaults each time 
    // toggle is triggered.
    toggle() {
        this.setState({
            modal: !this.state.modal,
            description: "",
            time: "10:30",
            title: "",
            blocking: false,
            selectedUsers: this.props.currentUser.uid
        });
    }

    // Logic for adding meetings to the firebase database as well as updating
    // each user invited's permissions.
    createMeeting() {
        if (this.allValid()) {
            let tempDate = this.state.date;
            let timeArray = this.state.time.split(":");

            tempDate.setHours(timeArray[0], timeArray[0]);

            let time = tempDate.getTime();

            let userArray = this.state.selectedUsers.split(',');

            let newMeeting = {
                meetingName: this.state.title,
                date: time,
                description: this.state.description,
                members: userArray
            }

            this.toggleBlocking();

            var ref = firebase.database().ref("meetings");
            // this new, empty ref only exists locally
            var newChildRef = ref.push();
            // we can get its id using key()
            newChildRef.set(newMeeting)

            newMeeting.id = newChildRef.key;

            for (let i = 0; i < userArray.length; i++) {
                if (userArray[i].length > 0) {
                    firebase.database().ref("members").child(userArray[i]).child("permissions")
                    .push({name: newMeeting.meetingName, date: newMeeting.date, id: newMeeting.id});
                }
            }

            this.toggle();
            this.toggleBlocking();
        }
    }

    toggleBlocking() {
        this.setState({ blocking: !this.state.blocking });
    }

    // Verifies whether the input is valid or not
    allValid() {
        return (this.state.description.length > 0 &&
            this.state.title.length > 0 && this.state.time.length > 0)
    }

    // Handles data updating
    handleDateSelect(date) {
        this.setState({ date: date });
    }

    // Handles time updating
    handleTimeSelect(e) {
        this.setState({ time: e.target.value });
    }

    // Handles header updates
    handleTitleChange(e) {
        this.setState({ title: e.target.value });
    }

    // Handles description updates
    handleDescriptionChange(e) {
        this.setState({ description: e.target.value });
    }

    // handles invitees changes
    handleSelectChange(value) {
        this.setState({ selectedUsers: value })
    }

    // Renders the Modal
    render() {
        const styles = {
            marginTop: {
                marginTop: 5
            }
        }

        return (
            <div style={{ height: "90%" }}>
                <Button style={{display:"inline"}} color="primary" onClick={this.toggle}>{this.props.buttonLabel}</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} size='lg'>
                    <BlockUi tag="div" blocking={this.state.blocking}>
                        <ModalHeader toggle={this.toggle}>Create Meeting:</ModalHeader>
                        <ModalBody>
                            <Container>
                                <Row>
                                    <Col xs={12} md={6}>
                                        <InfiniteCalendar
                                            width={"100%"} height={250} selected={this.state.date} onSelect={(date) => { this.handleDateSelect(date) }} />
                                        <FormGroup>
                                            <Label for="exampleTime">Time</Label>
                                            <Input type="time" name="time" id="exampleTime" value={this.state.time} onChange={(e) => this.handleTimeSelect(e)} />
                                        </FormGroup>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <FormGroup>
                                            <Label style={styles.marginTop} for="meetingTitle">Meeting: *</Label>
                                            <Input onChange={(e) => this.handleTitleChange(e)} name="meetingTitle" value={this.state.title} />
                                            <Label style={styles.marginTop} for="exampleText">Meeting Objectives: *</Label>
                                            <Input onChange={(e) => this.handleDescriptionChange(e)} value={this.state.description} type="textarea" rows={6} name="text" id="exampleText" />
                                            <Label style={styles.marginTop} for="exampleSelectMulti">Select Attendees</Label>
                                            <MultiSelect selected={this.state.selectedUsers} options={this.state.users} handleSelectChange={(value) => this.handleSelectChange(value)} />
                                            <Label style={styles.marginTop} >* required</Label>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Container>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" disabled={!this.allValid()} onClick={() => this.createMeeting()}>Create</Button>{' '}
                            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                        </ModalFooter>
                    </BlockUi>
                </Modal>
            </div>
        );
    }
}

export default MeetingModal;