import React, { Component } from 'react';
import firebase from 'firebase/app';
import { Button, Input, Label } from 'reactstrap';

export class MeetingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: true,
      meetingName: ''
    }
    this.toggle = this.toggle.bind(this);
  }
  toggle() {
    this.setState({isModalOpen: !this.state.isModalOpen});
  }
  create() {
    let newMeeting = {
      meetingName: this.state.meetingName,
      date: this.state.date,
      members: ['firebase.auth().currentUser']
    }
    firebase.database().ref('meetings').push(newMeeting); 
    this.toggle();
  }
  onChange(e) {
    let newState = {};
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }
  render() {
    return (
      <div>
        <Button onClick={this.toggle}>Create a Meeting</Button>      
        <Modal isOpen={this.state.isModalOpen} onClose={() => this.toggle()}>
          <h1>Create a Meeting</h1>
          <Label for="meetingName">Meeting Name</Label>
          <Input name='meetingName' onChange={(e) => this.onChange(e)} />
          <Label for="date">Meeting Date</Label>
          <Input type="date" name="date" id="date" placeholder="date placeholder" onChange={(e) => this.onChange(e)} />
          <div className='left'>
            <Button id='close' onClick={() => this.toggle()}>Close</Button>
          </div>
          <div className='right'>
           <Button disabled={this.state.meetingName === ''} color='success' id='create' onClick={() => this.create()}>Create</Button>
          </div>
        </Modal>
      </div>
    );
  }
}

// I think this can be generalized more to handle both meeting and task
export class TaskModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      taskName: undefined,
      dueDate: undefined,
      requirements: undefined,
      priority: 1,
      meetingKey: '-L-kQ5S_sTpEhNeC92Ky',
      memberAssignedTo: undefined,
      userKey: 'X6gdgCz7NmPGOVcdQSKgkzXAerk1'
    }
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    if (this.state.isModalOpen) {
      this.addRequirement()
    }
    this.setState({isModalOpen: !this.state.isModalOpen});
  }
  
  create() {
    let newTask = {
      taskName: this.state.taskName,
      progress: 0,
      memberAssignedTo: this.state.memberAssignedTo,
      dueDate: new Date(this.state.dueDate).getTime(),
      requirements: this.state.requirements.split(', '),
      taskTrue: true,
      priority: this.state.priority - 1,
      members: []
    }
    firebase.database().ref('meetings/'+this.state.meetingKey).push(newTask); 
    firebase.database().ref('members/'+this.state.userKey+'/tasks').push(newTask);
    this.toggle();
  }

  onChange(e) {
    let newState = {};
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }
  
  componentWillMount() {
    let members = [];
    let memberNames = [];
    firebase.database().ref('meetings/'+this.props.meetingKey+'/members').on('value', (snapshot) => {
      members = snapshot.val();
      if (members) {
        members.map( member => {
          firebase.database().ref('members/'+member).on('value', (memberSnapshot) => {
            memberNames.push(memberSnapshot.val());
            this.setState({members: memberNames});
          })
        })
      }
      return null;
    });
  }

  optionChange(member) {
    this.setState({memberAssignedTo: member.userId});
  }
  render() {
    return(
      <div id='create-meeting' >
        <Button id='create-task' onClick={this.toggle}>Create Task</Button>
        <Modal isOpen={this.state.isModalOpen} onClose={() => this.toggle()}>
          <h1>Create Task</h1>
          <Label for="taskName">Task Name</Label>
          <Input name='taskName' onChange={(e) => this.onChange(e)} placeholder="Fix Bug #34"/>
          <Label for="memberAssignedTo">Member Assigned to Task</Label>
          <Input type="select" name='memberAssignedTo' onChange={(e) => this.onChange(e)}>
          {this.state.members && this.state.members.map(member => {
            return <option onClick={(member) => this.optionChange(member)} key={member.userId}>{member.displayName}</option>
          })}
          </Input>
          <Label for="dueDate">Due Date</Label>
          <Input type="date" name="dueDate" id="exampleDate" placeholder="date placeholder" onChange={(e) => this.onChange(e)} />
          <Label for="requirements">Task Requirement</Label>
           <Input id='left' name='requirements' onChange={(e) => this.onChange(e)} placeholder="Doesn't slow app down"/>
          <Label for="priority">Priority (1 is low)</Label>
          <Input type="select" name="priority" id="exampleSelect" onChange={(e) => this.onChange(e)}>
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </Input>
          <Button id='close' onClick={() => this.toggle()}>Close</Button>
          <Button color='success' disabled={!(this.state.taskName && this.state.dueDate)} id='create' onClick={() => this.create()}>Create</Button>
        </Modal>
      </div>
    );
  }
}
// Contains all the tasks and its functions
export class Modal extends Component {
    render() {
      if (this.props.isOpen === false)
        return null
  
      let modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: '9999',
        background: '#fff',
        padding: '3rem',
        textAlign: 'center',
        borderRadius: '20px',
        boxShadow: '10px 10px 5px grey'
      }
  
      if (this.props.width && this.props.height) {
        modalStyle.width = this.props.width + 'px'
        modalStyle.height = this.props.height + 'px'
        modalStyle.marginLeft = '-' + (this.props.width/2) + 'px'
        modalStyle.marginTop = '-' + (this.props.height/2) + 'px'
        modalStyle.transform = null
      }
  
      if (this.props.style) {
        for (let key in this.props.style) {
          modalStyle[key] = this.props.style[key]
        }
      }
  
      let backdropStyle = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: '0px',
        left: '0px',
        zIndex: '9998',
        background: 'rgba(0, 0, 0, 0.3)',
        margin: '3px',
      }
  
      if (this.props.backdropStyle) {
        for (let key in this.props.backdropStyle) {
          backdropStyle[key] = this.props.backdropStyle[key]
        }
      }
  
      return (
        <div className={this.props.containerClassName}>
          <div className={this.props.className} style={modalStyle}>
            {this.props.children}
          </div>
          {!this.props.noBackdrop &&
              <div className={this.props.backdropClassName} style={backdropStyle}
                   onClick={e => this.close(e)}/>}
        </div>
      )
    }
    close(e) {
      e.preventDefault()
  
      if (this.props.onClose) {
        this.props.onClose()
      }
    }
  }

export class DeleteModal extends Component {
    render() {
        return (
            <Modal isOpen={this.props.isModalOpen} onClose={() => this.props.toggle()}>
                <h2>Are you sure you want to delete this post?</h2>
                <p><Button id='close' onClick={() => this.props.toggle()}>Close</Button></p>
                <p><Button id='delete' onClick={() => this.props.delete()}>Delete</Button></p>
            </Modal>
        );
    }
}