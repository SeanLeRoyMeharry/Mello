import React, { Component } from 'react';

import { Button, Input, Row, Col } from 'reactstrap';

// Author: Matthew Li
// Component functions as a dynamic input. User is able to add more
// fields by pressing "Add button". Output is handled by returning array, 
// with each index representing user input of one field.

export default class DynamicInput extends Component {
    constructor(props) {
        super(props);
        this.state = { value: [], count: 1 };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(i, event) {
        let value = this.state.value.slice();
        value[i] = event.target.value;
        this.setState({ value });
        this.props.callback(value);
    }

    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }

    addClick() {
        this.setState({ count: this.state.count + 1 })
    }

    removeClick(i) {
        let value = this.state.value.slice();
        value.splice(i, 1);
        this.setState({
            count: this.state.count - 1,
            value
        })
    }

    createUI() {
        let uiItems = [];
        for (let i = 0; i < this.state.count; i++) {
            uiItems.push(
                <Row key={i} style={{marginTop:5, marginBottom:5}}>
                    <Col xs="8">
                        <Input style={{ width: "100%", display: "inline" }} type="text" value={this.state.value[i] || ''} onChange={this.handleChange.bind(this, i)} />
                    </Col>
                    <Col xs="3">
                        <Button style={{ display: "inline" }} color="danger" onClick={this.removeClick.bind(this, i)}>Remove</Button>
                    </Col>
                </Row>
            )
        }
        return uiItems || null;
    }

    render() {
        return (
            <div style={{ textAlign: "left" }}>
                {this.createUI()}
                <Button style={{marginTop:10, marginBottom:10}}color='primary' onClick={this.addClick.bind(this)}>Add</Button>
            </div>
        );
    }
}
