import React, {useState} from 'react';
import {Navbar, Nav, NavDropdown, Form, FormControl, Button} from 'react-bootstrap'

//pages
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import App from '../App'
import {user} from '../pages/Signup'
import NavBar from '../styles/NavBar.css'

//firebase
import {auth} from '../firebase'



function MainNavbar(props) {

      return (
          <Navbar className='nav_main' id='main' collapseOnSelect expand="lg" bg="dark" variant="dark">

            <Navbar.Brand href= "/">ClipIt</Navbar.Brand>

            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto">
                  <Nav.Link href="/feed">Your Feed</Nav.Link>
                  <Nav.Link href="/">Explore</Nav.Link>
                  <Nav.Link href="/profile">Profile</Nav.Link>
                </Nav>



            {props.loggedIn === 'y' ? (
                <Nav>
                  <Nav.Link href="/login" onClick={() => auth.signOut()} >Logout</Nav.Link>
                </Nav>
            ) : (
                <Nav>
                  <Nav.Link href="/login">Login</Nav.Link>
                  <Nav.Link eventKey={2} href="/sign-up" >Sign Up</Nav.Link>
                </Nav>
            )}


              </Navbar.Collapse>
            </Navbar>
      )

};

export default MainNavbar;
