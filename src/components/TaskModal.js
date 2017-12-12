/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Container, Row, Col } from 'reactstrap';
import moment from 'moment';
import InfiniteCalendar from 'react-infinite-calendar';
import 'react-infinite-calendar/styles.css'; // only needs to be imported once
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import DynamicInput from './DynamicInput'

import MultiSelect from './MultiSelect'

import firebase from 'firebase/app';

// Author: Matthew Li
// TaskModal component allows the user to create new tasks
// and assign the task to other members.
export default class TaskModal extends Component {

    // Sets up default state
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            date: new Date(),
            m: moment(),
            title: "",
            time: "10:30",
            blocking: false,
            selectedOption: '',
            selectedUsers: [],
            users: [],
            requirements: [],
            rSelected: null
        };
        this.toggle = this.toggle.bind(this);
    }

    // Creates references to the firebase database.
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

    // Updates task modal with a pre-populated title
    componentWillReceiveProps(nextProps) {
        if (nextProps.showModal) {
            this.toggleWithTitle(nextProps.title);
        }
    }

    // Kills the references.
    componentWillUnmount() {
        this.userRef.off();
    }

    toggleWithTitle = (newTitle) => {
        this.setState({
            modal: !this.state.modal,
            description: "",
            time: "10:30",
            title: newTitle,
            blocking: false,
            selectedUsers: [],
            rSelected: null
        });
    }

    toggle() {
        this.toggleWithTitle("");
    }

    // Logic for creating a task and assigning it to the assigned members.
    createTask() {
        if (this.allValid()) {
            let tempDate = this.state.date;
            let timeArray = this.state.time.split(":");

            tempDate.setHours(timeArray[0], timeArray[0]);

            let time = tempDate.getTime();

            let userArray = this.state.selectedUsers.split(',');

            let newTask = {
                taskName: this.state.title,
                dueDate: time,
                requirements: this.state.requirements,
                priority: this.state.rSelected,
                progress: 0,
                assignee: this.props.currentUser.uid,
                meetingId: this.props.meetingId
            }

            this.toggleBlocking();

            var ref = firebase.database().ref("tasks");
            var secondary = firebase.database().ref("meetings").child(this.props.meetingId).child("tasks");
            
            for(let i = 0; i < userArray.length; i++) {
                var newChildRef = ref.child(userArray[i]).push();
                var secondaryChildRef = secondary.push();
    
                secondaryChildRef.set({...newTask, ...{meetingTaskId: secondaryChildRef.key,  userTaskId: newChildRef.key}, ...{assignedTo: userArray[i]}});
                newChildRef.set({...newTask, ...{meetingTaskId: secondaryChildRef.key, userTaskId: newChildRef.key}, ...{assignedTo: userArray[i]}});
            }

            this.toggle();
            this.props.updatePage({ taskModal: false });
            this.toggleBlocking();
        }
    }

    // Toggles the blocking ui, to ensure user does not mess with UI while
    // creating the event
    toggleBlocking() {
        this.setState({ blocking: !this.state.blocking });
    }

    // Verifies whether the current input state is valid or not.
    allValid() {
        return (this.state.rSelected != null && this.state.title.length > 0 && this.state.time.length > 0 && this.state.selectedUsers.length > 0)
    }

    // Updates date input
    handleDateSelect(date) {
        this.setState({ date: date });
    }

    // Updates time input
    handleTimeSelect(e) {
        this.setState({ time: e.target.value });
    }

    // Updates title input
    handleTitleChange(e) {
        this.setState({ title: e.target.value });
    }

    // Updates description input
    handleDescriptionChange(e) {
        this.setState({ description: e.target.value });
    }

    // Updates select change
    handleSelectChange(value) {
        this.setState({ selectedUsers: value })
    }

    // Updates dynamic input change
    handleDynamicInput(value) {
        this.setState({ requirements: value });
    }

    // Handles radio button selection
    onRadioBtnClick(rSelected) {
        this.setState({ rSelected });
    }

    // Renders UI modal.
    render() {
        // Custom component styles
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
                        <ModalHeader toggle={this.toggle}>Create Task:</ModalHeader>
                        <ModalBody>
                            <Container>
                                <Row>
                                    <Col xs={12} md={6}>
                                        <InfiniteCalendar
                                            width={"100%"} height={250} selected={this.state.date} onSelect={(date) => { this.handleDateSelect(date) }} />
                                        <FormGroup>
                                            <Label for="exampleTime">Due</Label>
                                            <Input type="time" name="time" id="exampleTime" value={this.state.time} onChange={(e) => this.handleTimeSelect(e)} />
                                        </FormGroup>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <FormGroup>
                                            <Label style={styles.marginTop} for="meetingTitle">Task Name: *</Label>
                                            <Input onChange={(e) => this.handleTitleChange(e)} name="meetingTitle" value={this.state.title} />
                                            <Label style={styles.marginTop} for="exampleText">Task Requirements: *</Label>
                                            <DynamicInput callback={(value) => this.handleDynamicInput(value)} />
                                            <Label style={styles.marginTop} for="exampleText">Priority: *</Label>
                                            <div style={{display:"block"}}>
                                                <Button color="primary" onClick={() => this.onRadioBtnClick(0)} active={this.state.rSelected === 0}>One</Button> {"  "}
                                                <Button color="primary" onClick={() => this.onRadioBtnClick(1)} active={this.state.rSelected === 1}>Two</Button> {"  "}
                                                <Button color="primary" onClick={() => this.onRadioBtnClick(2)} active={this.state.rSelected === 2}>Three</Button>
                                            </div>
                                            <Label style={styles.marginTop} for="exampleSelectMulti">Delegate to: *</Label>
                                            <MultiSelect selected={this.state.selectedUsers} options={this.state.users} handleSelectChange={(value) => this.handleSelectChange(value)} />
                                            <Label style={styles.marginTop} >* required</Label>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Container>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" disabled={!this.allValid()} onClick={() => this.createTask()}>Create</Button>{' '}
                            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                        </ModalFooter>
                    </BlockUi>
                </Modal>
            </div>
        );
    }
}
