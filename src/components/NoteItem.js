import React, { Component } from 'react';
import { StyleSheet, css } from 'aphrodite';

import {
    Container,
    CardBody,
    Card,
    ListGroupItem,
    Input,
    ButtonGroup,
    Button,
    Row,
    Col
} from 'reactstrap';

export default class NoteItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            display: false,
        }
    }

    handleMouseEnter = () => {
        this.setState({ display: true });
    }

    handleMouseLeave = () => {
        this.setState({ display: false });
    }

    handleEdit = () => {
        this.setState({ edit: true });
    }

    handleKeyPress = (event) => {
        if (event.charCode === 13 && !event.shiftKey && event.target.value !== "") {
            event.preventDefault();
            event.stopPropagation();
            this.props.dbRef.child(this.props.noteId)
                .set({
                    edited: true,
                    message: event.target.value,
                    time: this.props.note.time,
                    user: this.props.note.user
                })
                .then(() => {
                    this.setState({ edit: false });
                })
                .catch((error) => console.log(error.message));
        }
    }

    render() {
        const styles = StyleSheet.create({
            container: {
                width: "100%",
            },
            smallText: {
                fontWeight: "300"
            }
        });
        let moment = require('moment');
        let time = moment(this.props.note.time + "", "x").fromNow();
        let displayButtons = this.props.currentUser !== undefined && this.props.currentUser !== null;
        if (displayButtons) {
            displayButtons = this.props.currentUser.displayName === this.props.note.user;
        }

        return (
            <ListGroupItem
                tag="a"
                action
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
            >
                <Container className={css(styles.container)}>
                    <Card>
                        <CardBody>
                            <Row>
                                <NoteContent
                                    edit={this.state.edit}
                                    display={this.state.display}
                                    handleEdit={this.handleEdit}
                                    handleEnter={this.handleKeyPress}
                                    handleChange={this.handleChange}
                                    toggle={this.props.toggle}
                                    updateMsg={this.props.updateMsg}
                                    note={this.props.note}
                                    noteId={this.props.noteId}
                                    toggleModal={this.props.toggleModal}
                                    displayButtons={displayButtons}
                                />
                            </Row>
                            <small className={css(styles.smallText)}>
                                {this.props.note.user}, {time}. {this.props.note.edited && "(Edited)"}
                            </small>
                        </CardBody>
                    </Card>
                </Container>
            </ListGroupItem>
        );
    }
}

class Buttons extends Component {
    constructor(props) {
        super(props);
        this.toggleFn = null;
    }

    componentWillMount() {
        this.toggleFn = this.props.toggle;
    }
    render() {
        const styles = StyleSheet.create({
            hide: {
                display: "none"
            },
            hover: {
                ":hover": {
                    backgroundColor: "rgb(250,250,250)",
                    color: "black"
                }
            }
        });

        return (
            <ButtonGroup size="sm" className={css(!this.props.display && styles.hide)}>
                {this.props.displayButtons &&
                    <ButtonGroup>
                        <Button
                            onClick={this.props.handleEdit}
                            className={css(styles.hover)}
                        >
                            Edit
                    </Button>
                        <Button
                            onClick={() => this.toggleFn(this.props.noteId)}
                            className={css(styles.hover)}
                        >
                            Delete
                    </Button>
                    </ButtonGroup>
                }
                <Button
                    onClick={() => this.props.toggleModal(this.props.htmlCode)}
                    className={css(styles.hover)}
                >
                    New Task
                </Button>
            </ButtonGroup>
        );
    }
}

class NoteContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messageContent: this.props.note.message
        }
    }

    handleChange = (event) => {
        this.setState({ messageContent: event.target.value });
    }

    getHTMLCode() {
        let Remarkable = require('remarkable');
        let md = new Remarkable();
        let content = md.render(this.props.note.message);

        let regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/g;
        let links = content.match(regex);

        if (links != null) {
            links.forEach(link => {
                let newLink = "<a href='" + link + "' target='_blank'>" + link + "</a>";
                content = content.replace(link, newLink);
            });
        }
        return content;
    }

    render() {
        const styles = StyleSheet.create({
            textContent: {
                height: "15vh"
            },
            chatText: {
                fontWeight: "300",
                fontSize: "1.25em",
                paddingBottom: "1em",
            },
        });

        let content = this.getHTMLCode();

        let display = this.props.edit ?
            <div>
            <label for="takeNotes" className="visuallyhidden">Enter a Message </label>
            <Input
                className={css(styles.textContent)}

                placeholder="Enter a message..."
                type="textarea"
                value={this.state.messageContent}
                onKeyPress={this.props.handleEnter}
                onChange={this.handleChange}
                aria-labelledby="Enter a Message"
                aria-live="polite"
            /> </div> :
            <div style={{ width: "100%" }}>
                <Col xs={9} className={css(styles.chatText)} dangerouslySetInnerHTML={{ __html: content }}></Col>
                <Col xs={3}>
                    <Buttons
                        display={this.props.display}
                        handleEdit={this.props.handleEdit}
                        toggle={this.props.toggle}
                        updateMsg={this.props.updateMsg}
                        noteId={this.props.noteId}
                        toggleModal={this.props.toggleModal}
                        htmlCode={content}
                        displayButtons={this.props.displayButtons}
                    />
                </Col>
            </div>;
        return (
            display
        );
    }
}