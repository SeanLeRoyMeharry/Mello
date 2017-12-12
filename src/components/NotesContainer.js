import React, { Component } from 'react';
import { StyleSheet, css } from 'aphrodite';
import { DeleteModal } from "./Modal";
import NoteItem from "./NoteItem";
import { Container, ListGroup, Navbar, Input,NavbarBrand} from 'reactstrap';

import firebase from 'firebase/app';
import 'firebase/database';

export default class NotesContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalOpen: false,
            message: "",
            selectedMessageId: undefined,
        };
    }

    componentDidMount() {
        this.setState({ loading: true });

        this.chatRef = firebase.database().ref("messages/" + this.props.meetingId);

        this.chatRef.on('value', (snapshot) => {
            this.setState({ messages: snapshot.val(), loading: false });
        });
    }

    componentWillUnmount() {
        this.chatRef.off();
    }

    handleKeyPress = (event) => {
        if (event.charCode === 13 && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();

            this.chatRef.push({
                user: this.props.currentUser.displayName,
                message: this.state.message,
                time: firebase.database.ServerValue.TIMESTAMP,
                edited: false
            }).catch((error) => console.log(error.message))

            this.setState({ message: "" });
        }
    }

    updateSelectedMessage = (message) => {
        this.setState({ selectedMessageId: message });
    }

    toggle = (noteId) => {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
            selectedMessageId: noteId
        });
    }

    handleOnChange = (event) => {
        this.setState({ message: event.target.value });
    }

    delete = () => {
        this.chatRef.child(this.state.selectedMessageId).remove()
            .then(() => this.setState({ isModalOpen: !this.state.isModalOpen }));
    }

    render() {
        const styles = StyleSheet.create({
            textarea: {
                minHeight: "15%",
                display: "fixed",
                marginTop: "1em",
                position: "relative",
                width: "100%"
            },
            container: {
                position: "relative",
                width: "100%"
            },
            listGroup: {
                height: "100%",
                overflowY: "scroll"
            },
            navbar: {
                height: "5%",
                margin: 0,
                borderRadius: 0
            },
            noteContainer: {
                minHeight: "80%",
                maxHeight: "80%",
                overflowY: "auto"
            }
        });

        let noteItems = null;

        if (this.state.messages !== undefined && this.state.messages !== null) {
            noteItems = Object.keys(this.state.messages).map((note) => {
                let tempNote = this.state.messages[note];
                return <NoteItem dbRef={this.chatRef} key={note} noteId={note} note={tempNote} toggle={this.toggle} updateMsg={this.updateSelectedMessage} toggleModal={this.props.toggleModal} currentUser={this.props.currentUser} />;
            });
        }

        return (
            <div style={{height: "100%"}}>
                <Navbar color="primary" className={css(styles.navbar)}>
                <NavbarBrand className="mr-auto" style={{color:"white"}}>Notes</NavbarBrand>
                </Navbar>
                <div className={css(styles.noteContainer)}>
                    <ListGroup className={css(styles.listGroup)}>
                        {noteItems}
                    </ListGroup>
                </div>
                <Container className={css(styles.textarea)}>
                    <label className="visuallyhidden">New Note:</label>
                    <Input
                        placeholder="Enter a message..."
                        type="textarea"
                        value={this.state.message}
                        onChange={this.handleOnChange}
                        onKeyPress={this.handleKeyPress}
                        className={css(styles.textarea)}
                        aria-labelledby="Enter a Message"
                        aria-live="polite"
                    />
                </Container>
                <DeleteModal
                    isModalOpen={this.state.isModalOpen}
                    toggle={this.toggle}
                    delete={this.delete}
                />
            </div>
        );
    }
}