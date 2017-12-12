import React, { Component } from 'react';
import AuthProvider from '../components/AuthProvider';
import { Link} from 'react-router-dom';
import {Container} from 'reactstrap';
import userPhoto from '../images/user.png';

export default class LoginPage extends Component {

    render() {
        const styles = {
            image : {
                marginLeft: "auto",
                marginRight: "auto",
                width: "35%",
                maxWidth: 300,
                height: "auto",
                marginTop: 100
            },
            container : {
                paddingTop: 100,
                textAlign: "center"
            }
        }

        //if (this.props.currentUser === null) {
            return (
                <Container style={styles.container}>
                    {!this.props.newAccount && 
                    <div>
                        <h1>Hey! Join the meeting!</h1>
                        <h2>Let's get you logged in...</h2>
                    </div>
                    } 
                    {this.props.newAccount &&

                    <h1>Let's make you an account!</h1>
                    }

                    <img style={styles.image} src={userPhoto} alt="unknown user"/>
                    <AuthProvider />
                    {
                        this.props.newAccount &&
                        <Link to="/login">I already have an account.</Link>
                    }
                    {
                        !this.props.newAccount &&
                        <Link to="/signup">I don't have an account.</Link>
                    }
                </Container>
            );
        /*} else {
            return (
                <Redirect to='/welcome' />
            );
        } */
    }
}