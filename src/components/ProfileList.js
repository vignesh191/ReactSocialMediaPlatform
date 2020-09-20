import React, { useState, useEffect} from 'react'
import ProfileCard from './ProfileCard'
import ProfileSearchCard from './ProfileSearchCard'
import {Form, FormControl, Button} from 'react-bootstrap'
import Profile from '../styles/Profile.css'
import {auth} from '../firebase'

function ProfileList(props) {
    const [searchQuery, setSearchQuery] = useState(props.search);

    let filteredProfileList = [];
    if (searchQuery !== "") {
        filteredProfileList = props.profileList.filter(
            (profileEl) => {
                return (profileEl.profile.displayName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1)
            }
        );
     }
     var test2 = props?.loggedIn
     console.log(test2)

    return  <div>
            <Form inline className='searchbar-2'>
                <FormControl type="text" placeholder="Search by username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                <Button variant="outline-dark" onClick={(e) => setSearchQuery("")} >Clear</Button>
            </Form>
            <ul className='composite_prof_search_list'>
                {(props.loggedIn) && (filteredProfileList.length !== 0) ? (filteredProfileList.map(({id, profile}) =>
                      <div className='prof_search_result'>
                      <br/>
                      <ProfileSearchCard username={profile?.displayName} owner={profile?.userID} profPic={profile?.ProfilePic} loggedIn={test2}/>
                      </div>
                )) : (<div className='prof_search_null_result'><br/>No such users with that username.</div>)}
            </ul>
            </div>
}

export default ProfileList;