import React, { Component } from 'react';
import { Collapse, Button, CardBody, Card, ListGroupItem, ListGroup, ListGroupItemHeading, Row, Col } from 'reactstrap';
import Time from 'react-time';

import firebase from 'firebase/app'


// Author: Matthew Li
// TaskList component renders a list of tasks passed to it. Tasks are 
// represented as TaskItems which are individual components.

export default class TaskList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tasks: {}
        }
    }

    // Initializes the task items and produces the output.
    render() {
        if (this.props.tasks) {
            let items = Object.keys(this.props.tasks);

            const order = {
                '0': 1,
                '1': 0,
                '2': 2
            }

            // Sorts tasks first based on progress, priority, and then date.
            items.sort((a, b) => {
                if (order[this.props.tasks[a].progress] < order[this.props.tasks[b].progress]) {
                    return -1;
                } else if (order[this.props.tasks[a].progress] > order[this.props.tasks[b].progress]) {
                    return 1;
                } else if (this.props.tasks[a].priority - this.props.tasks[b].priority !== 0) {
                    return this.props.tasks[b].priority - this.props.tasks[a].priority;
                } else {
                    return this.props.tasks[a].date - this.props.tasks[b].date;
                }
            });

            let taskItems = items.map((task) => {
                return <TaskItem key={task} task={this.props.tasks[task]} />
            });

            return (
                <ListGroup>
                    {taskItems}
                </ListGroup>
            );
        } else {
            return (<div>
                No Tasks
            </div>)
        }
    }
}

// Author: Matthew Li
// Taskitem component displays the contents of one task.
// Each task has various fields
class TaskItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapse: false,
            taskStatus: 1,
            assignedTo: null
        };
    }

    // Creates references to the firebase database to gather information about the task
    componentDidMount() {
        this.taskRef = firebase.database().ref("tasks").child(this.props.task.assignedTo).child(this.props.task.userTaskId);
        this.meetingTaskRef = firebase.database().ref("meetings").child(this.props.task.meetingId).child("tasks").child(this.props.task.meetingTaskId);

        firebase.database().ref("members").child(this.props.task.assignedTo).once('value', (snapshot) => {
            this.setState({assignedTo: snapshot.val()});
        })
    }

    // Kills the references to the firebase database.
    componentWillUnmount() {
        this.taskRef.off();
        this.meetingTaskRef.off();
    }

    // Toggles the task open / closed
    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    toggleTask() {
        this.setState({ taskStatus: this.state.taskStatus + 1 });
    }

    // Updates the task ref progress, "todo, in progress, complete"
    changeProgress() {
        let tempTask = this.props.task;
        tempTask.progress = (tempTask.progress + 1) % 3;

        this.taskRef.set(tempTask);
        this.meetingTaskRef.set(tempTask);
    }

    // Performs rendering of actual component.
    render() {
        // Reference arrays for index/value
        const progressColor = ["primary", "warning", "success"];
        const progressText = ["TODO", "In Progress", "Completed"];
        const iconPriority = ["fa-arrow-down", "fa-minus", "fa-arrow-up"];

        // Custom styling
        const styles = {
            button: {
                width: "100%"
            },
            inline: {
                display: "inline"
            },
            box: {
                marginTop: 10
            },
            icon: {
                marginLeft: 10,
                marginRight: 10,
                colors: {
                    '0': { color: "blue" },
                    '1': { color: "yellow" },
                    '2': { color: "red" }
                }

            },
            wrap: {
                wordWrap: "break-word"
            }
        }

        let listItems;
        if (this.props.task.requirements !== null && this.props.task.requirements !== undefined) {
            listItems = Object.keys(this.props.task.requirements).map((key, index) => {
                return <li key={index}>{this.props.task.requirements[key]}</li>
            });
        }

        return (
            <ListGroupItem tag="a" action aria-live="polite">
                <Row>
                    <Col>
                        <Button color={progressColor[this.props.task.progress]} onClick={() => this.changeProgress()}
                            size="sm"><span style={styles.scale}>{progressText[this.props.task.progress]}</span></Button>
                    </Col>
                    <Col style={{ textAlign: "right" }}><Time value={this.props.task.dueDate} format="MM/DD/YYYY" /></Col>
                </Row>
                <Row style={{ marginTop: 10 }} onClick={() => this.toggle()}>
                    <Col xs={10} md={11}>
                        <ListGroupItemHeading style={{ ...styles.inline, ...styles.wrap }}>{this.props.task.taskName}</ListGroupItemHeading>
                    </Col>
                    <Col xs={2} md={1}>
                        <span style={{ float: "right" }}>
                            <i className={"fa " + iconPriority[this.props.task.priority]} style={{ ...styles.icon, ...styles.icon.colors[this.props.task.priority] }} aria-hidden="true"></i>
                        </span>
                    </Col>
                </Row>
                <div>
                    <Collapse
                        isOpen={this.state.collapse}
                        style={styles.box}
                    >
                        <Card>
                            <CardBody>
                                <p><strong>Assigned to: </strong>
                                { this.state.assignedTo != null &&
                                    this.state.assignedTo.displayName
                                }
                                </p>
                                <p><strong>Subtasks: </strong></p>
                                <ol>
                                    {listItems}
                                </ol>
                            </CardBody>
                        </Card>
                    </Collapse>
                </div>
            </ListGroupItem>
        );
    }
}

