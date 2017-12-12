import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label } from 'reactstrap';
import 'react-infinite-calendar/styles.css'; // only needs to be imported once
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import MultiSelect from './MultiSelect'
import firebase from 'firebase/app';

export default class InviteModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            blocking: false,
            selectedOption: '',
            selectedUsers: this.props.meeting.members,
            users: []
        };
        this.toggle = this.toggle.bind(this);
    }

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

    componentWillUnmount() {
        this.userRef.off();
    }

    toggle() {
        this.setState({
            modal: !this.state.modal,
            blocking: false,
            selectedUsers: this.props.meeting.members
        });
    }

    editMeeting() {
        if (this.props.meeting) {
            let userArray = this.state.selectedUsers.split(',');
            let newMeeting = {
                meetingName: this.props.meeting.meetingName,
                date: this.props.meeting.date,
                description: this.props.meeting.description,
                members: userArray
        }

            this.toggleBlocking();

            var ref = firebase.database().ref("meetings");
            // this new, empty ref only exists locally
            var newChildRef = ref.child(this.props.meetingId);

            // we can get its id using key()
            newChildRef.set(newMeeting);

            newMeeting.id = this.props.meetingId;

            for (let i = 0; i < userArray.length; i++) {
                if (userArray[i].length > 0) {
                    firebase.database().ref("members").child(userArray[i]).child("permissions").child(this.props.meetingId).set({name: newMeeting.meetingName, date: newMeeting.date, id: newMeeting.id});
                }
            }

            this.toggle();
            this.toggleBlocking();
            this.userRef.on("value", (snapshot) => {
                let data = snapshot.val()
                let userArray = Object.keys(data).map((key) => {
                    return { label: data[key].displayName, value: key }
                });
                this.setState({ users: userArray });
            });
        }
    }

    toggleBlocking() {
        this.setState({ blocking: !this.state.blocking });
    }

    handleSelectChange(value) {
        this.setState({ selectedUsers: value })
    }

    render() {
        const styles = {
            marginTop: {
                marginTop: 5
            }
        }

        return (
            <div style={{ height: "90%" }}>
                <Button style={{display:"inline"}} color="primary" onClick={this.toggle}>Add Attendees</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} size='lg'>
                    <BlockUi tag="div" blocking={this.state.blocking}>
                        <ModalHeader toggle={this.toggle}>Edit Meeting Attendees:</ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label style={styles.marginTop} for="exampleSelectMulti">Add Attendees</Label>
                                <MultiSelect selected={this.state.selectedUsers} options={this.state.users} handleSelectChange={(value) => this.handleSelectChange(value)} />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.editMeeting()}>Update</Button>{' '}
                            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                        </ModalFooter>
                    </BlockUi>
                </Modal>
            </div>
        );
    }
}