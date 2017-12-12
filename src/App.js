import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UserDashboardPage from './pages/UserDashboardPage';
import MeetingDashboardPage from './pages/MeetingDashboardPage';

import firebase from 'firebase/app';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      loading : true
    }
  }

  componentDidMount() {
    this.unregisterFunction = firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        this.setState({ user: firebaseUser });
        firebase.database().ref("members").child(firebaseUser.uid).child("displayName").set(firebaseUser.displayName);
      } else {
        this.setState({ user: null });
      }
      this.setState({loading : false})
    });
  }
  // Sign out handle to log user out of application
  handleSignOut() {
    this.setState({ errorMessage: null }); //clear any old errors

    /* TODO: sign out user here */
    firebase.auth().signOut()
      .catch((err) => console.log(err.message));
  }

  render() {

    const styles = {
      page: {
        height: "100%",
        width: "100%"
      }
    }

    let renderLoginPage = (routerProps) => {
      return <LoginPage {...routerProps} signoutHandle={() => this.handleSignOut()} newAccount={false} currentUser={this.state.user} />
    };

    let renderSignupPage = (routerProps) => {
      return <LoginPage {...routerProps} signoutHandle={() => this.handleSignOut()} newAccount={true} currentUser={this.state.user} />
    };

    let renderUserdashboardPage = (routerProps) => {
      return <UserDashboardPage {...routerProps} signoutHandle={() => this.handleSignOut()} currentUser={this.state.user} />
    };

    let renderMeetingDashboardPage = (routerProps) => {
      return <MeetingDashboardPage {...routerProps} signoutHandle={() => this.handleSignOut()} currentUser={this.state.user} />
    };

    return (
      <BrowserRouter basename={process.env.PUBLIC_URL + '/'}>
        <div style={styles.page}>
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 100 }}>
            <nav className="navbar bg-dark" style={{ paddingLeft: "5%", paddingRight: "5%" }}>
              <Link className="navbar-brand" style={{ color: "white" }} to='/'>Mello</Link>
            </nav>
          </div>
          {
            this.state.user !== null &&
            <Switch>
              <Route exact path='/welcome' component={renderUserdashboardPage} />
              <Route exact path="/meeting/:meetingId" component={renderMeetingDashboardPage} />
              <Redirect to="/welcome" />
            </Switch>
          }
          {
            this.state.user === null && this.state.loading === false &&
            <Switch>
              <Route exact path='/login' component={renderLoginPage} />
              <Route exact path='/signup' component={renderSignupPage} />
              <Redirect to="/login" />
            </Switch>
          }
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
