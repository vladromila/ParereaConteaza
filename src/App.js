import React, { Component } from 'react';
import _ from 'lodash';
import StarRatings from 'react-star-ratings'
import TextField from '@material-ui/core/TextField';
import { Button } from '../node_modules/@material-ui/core';
import firebase from 'firebase'
import LazyLoad from 'react-lazy-load';


import './App.css';
var config = {
  apiKey: "AIzaSyARKv3IusgBPVRPeWeio2x3zvgKCVww2Is",
  authDomain: "parereatelespectatorilor.firebaseapp.com",
  databaseURL: "https://parereatelespectatorilor.firebaseio.com",
  projectId: "parereatelespectatorilor",
  storageBucket: "parereatelespectatorilor.appspot.com",
  messagingSenderId: "537648099285"
};
firebase.initializeApp(config);

class App extends Component {
  constructor() {
    super();
    this.state = {
      sentRating: 0,
      rating: 0,
      input: '',
      success: false,
      showGraph: false,
      showContent: false,
      loading: true
    }
  }
  componentWillMount() {
    firebase.auth().signInAnonymously()
      .then(() => {
        firebase.database().ref(`/users/${firebase.auth().currentUser.uid}/hasClickedBefore`)
          .on('value', snapshot => {
            if (snapshot.val() === true)
              this.setState({ loading: false, showContent: false })
            else
              this.setState({ loading: false, showContent: true })
          })
      })
      ;
    firebase.database().ref('/votes')
      .on('value', snapshot => {
        let nota = 0;
        let nr = 0;
        _.map(snapshot.val(), (val, uid) => {
          nr++;
          nota = nota + val.rating;
        })
        let n = nota / nr;
        this.setState({ sentRating: n })
      })
  }
  onDoneClick = () => {
    if (this.state.success === false && this.state.rating !== 0)
      firebase.database().ref(`/users/${firebase.auth().currentUser.uid}/hasClickedBefore`)
        .set(true)
        .then(() => firebase.database().ref('/votes/').push({ rating: this.state.rating, parere: this.state.input })
          .then(() => this.setState({ success: true, showGraph: true, showContent: true })))

  }

  render() {
    return (
      <div className="App">
        {this.state.loading === true ?
          <LazyLoad height={'100%'} offsetVertical={300}>
            <img src='https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif' />
          </LazyLoad>
          : this.state.showContent === true ?
            <div>
              {this.state.success === false ?
                <div>
                  <h3>Pentru că ținem la părerea telespectatorilor, dorim să ne oferiți o notă!</h3>
                  <StarRatings
                    rating={this.state.rating}
                    starRatedColor="blue"
                    changeRating={rating => {
                      this.setState({ rating: rating })
                      if (rating === 5)
                        this.setState({ input: '' })
                    }}
                    starDimension="50px"
                    numberOfStars={5}
                  /></div> : null}
              {this.state.rating < 5 && this.state.rating !== 0 && this.state.success === false ? <div>
                <h5>Știm ca nu suntem perfecți, dar dorim sa știm ce ar trebui sa facem ca sa devenim mai buni!</h5>
                <TextField
                  style={{ width: '90%' }}
                  id="with-placeholder"
                  label="Aveți o sugestie? (fără înjurături)"
                  placeholder="Aveti o sugestie? (fără înjurături)"
                  margin="normal"
                  onChange={(event) => this.setState({ input: event.target.value })}
                /></div> : null}
              {this.state.showGraph === false ?
                <Button style={this.state.success === true ? { color: 'green' } : null} onClick={this.onDoneClick}>{this.state.success === false ? 'Gata' : 'Multumim pentru sprijin'}</Button> : null}
              {
                this.state.showGraph === true ?
                  <div>
                    <h1>Media notelor telespectatorilor este </h1><h1 style={{ fontWeight: 'bold' }}>{this.state.sentRating.toFixed(2)}/5.00</h1>
                    <StarRatings
                      rating={this.state.sentRating}
                      starRatedColor="blue"
                      starDimension="50px"
                      numberOfStars={5}
                    />
                  </div>
                  : null
              }</div> : <div>
              <h3>Stim ca ti-a placut si doresti sa mai votezi odata dar nu permitem asta. In schimb poti viziona media notelor!</h3>
              <h1>Media notelor telespectatorilor este </h1><h1 style={{ fontWeight: 'bold' }}>{this.state.sentRating.toFixed(2)}/5.00</h1>
              <StarRatings
                rating={this.state.sentRating || 0}
                starRatedColor="blue"
                starDimension="50px"
                numberOfStars={5}
              />
            </div>}
      </div>
    );
  }
}

export default App;