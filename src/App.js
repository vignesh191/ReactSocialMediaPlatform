import React, {useState, useEffect} from 'react';
import './styles/App.css';
import MainNavbar from './components/MainNavbar'
import CreatePostForm from './components/CreatePostForm'
import Post from './components/Post'
import PostList from './components/PostList'

import {auth} from './firebase'

//pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Feed from './pages/Feed'
import PostShare from './pages/PostShare'

//routing
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'


function App() {
    const[currUser, setCurrUser] = useState(null);

    useEffect(() => { //a change in authorization
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                //user has logged in i.e. there is an authUser
                console.log(authUser);
                setCurrUser(authUser);
            } else {
                //user has logged out i.e. no authUser present
                setCurrUser(null);
            }
        })
        return () => {
            //perform cleanup actions
            unsubscribe();
        }
    }, []);

    return (
        <Router>
            <div className="App">

            {currUser ? (
                <MainNavbar loggedIn='y' />
            ) : (
                <MainNavbar loggedIn='n' />
            )}

            <Switch>
                <Route exact path= "/sign-up" component={Signup} />
                <Route exact path= "/login" component={Login} />
                <Route exact path= "/" component={Home} />
                <Route exact path='/profile' component={Profile} />
                <Route exact path='/profile/:username' component={Profile} />
                <Route exact path='/feed' component={Feed} />
                <Route exact path='/:postid' component={PostShare} />
            </Switch>

            </div>
        </Router>
    )
}

export default App;
