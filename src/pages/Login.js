import React, {useState} from 'react'
import { Button } from 'semantic-ui-react'
import {Form} from 'react-bootstrap'
import MainNavbar from '../components/MainNavbar'
import { Redirect, Link} from 'react-router-dom'
//firebase
import {auth} from '../firebase'
import HomeBody from '../styles/HomeBody.css'

function Login() {

    const[password, setPassword] = useState('');
    const[email, setEmail] = useState('');
    const[logInClick, setLogInClick] = useState(null);

    function handleLogin(event) {
        event.preventDefault();
        auth
            .signInWithEmailAndPassword(email, password)
            .then((authUser) => {
               setTimeout(()=> setLogInClick('/feed'), 2000)
            })
            .catch((error) => alert(error.message))
    }

    return (
    <div class="row justify-content-center">
        <Form className='login_label'>
          <h1>
            Login to ClipIt
            <h5> The new social media to share your clips. </h5>
          </h1>
          <hr/>
          <Form.Group controlId="formBasicEmail">
            <Form.Control type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Control type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          </Form.Group>
          <Button color="primary" onClick={handleLogin} href='/feed' type="submit">
            Login
          </Button>
          <Form.Text>
            Don&apos;t have an account? Sign up <Link to='/sign-up'> here</Link>.
          </Form.Text>
          {logInClick ? (<Redirect to={logInClick}/>) : (<div></div>) }
        </Form>
    </div>
    )

}

export default Login;