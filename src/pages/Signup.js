import React, {useState, useEffect} from 'react'
import { Button, Card } from 'semantic-ui-react'
import {Form,  Nav} from 'react-bootstrap'
import {auth, db} from '../firebase'
import MainNavbar from '../components/MainNavbar'
import { Redirect, Link} from 'react-router-dom'
import HomeBody from '../styles/HomeBody.css'

function Signup() {
    const DEFAULT_PROFPIC = 'https://firebasestorage .googleapis.com/v0/b/react-gaming-sm.appspot.com/o/profiles%2FdefaultProfPic.png?alt=media&token=d265d4ae-2252-4c26-98d8-e879122014bf'
    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');
    const[email, setEmail] = useState('');
    const[signUpClick, setSignUpClick] = useState(null);

    function handleSignUp(event) {
        event.preventDefault();

        var displayNamesRef = db.collection("userData");

        var query = displayNamesRef.where('displayName', '==', username);
        query.get().then(querySnapshot => {
            if(querySnapshot.size === 0) { //username not in the db
                if (username === ''){
                    alert('Please enter a valid username.')
                    return
                }

                auth.createUserWithEmailAndPassword(email, password)
                .then((authUser) => {
                        authUser.user.updateProfile({
                            displayName: username
                        })
                        db.collection("userData").add({
                            displayName: username,
                            likedPosts: [],
                            followedUsers: [],
                            followedUsersByDN: [],
                            userBio: "No bio currently set.",
                            userID: "",
                            followers: 0,
                            ProfilePic: DEFAULT_PROFPIC
                        })
                        .then((docRef) =>{
                            db.collection('userData').doc(docRef.id).update({
                                userID: authUser.user.uid
                            })
                        })
                        setTimeout(()=> setSignUpClick('/'), 2000)
                 })
                 .catch((error) => alert(error.message));
             } else { //user is already taken
                alert('The username is already taken.')
                return
             }
          })
    }


    return (
    <div class="row justify-content-center">
        <Form className='signup_label'>
          <h1 >
            Make a ClipIt Account
            <h5> The new social media to share your clips. </h5>
          </h1>
          <hr />
           <Form.Group controlId="formBasicUsername">
            <Form.Control onChange={(e) => setUsername(e.target.value)} type="username" placeholder="Choose a unique username" />
          </Form.Group>
          <Form.Group controlId="formBasicEmail">
            <Form.Control onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter email" />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Control type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Pick a password you'll remember" />
          </Form.Group>
          <Button onClick={handleSignUp} href='/' color="primary" type="submit">
                Sign Up
          </Button>
          <Form.Text >
              Already have an account? Login <Link to='/login'> here</Link>.
          </Form.Text>
          {signUpClick ? (<Redirect to={signUpClick}/>) : (<div></div>) }
        </Form>
    </div>

    )
}

export default Signup;