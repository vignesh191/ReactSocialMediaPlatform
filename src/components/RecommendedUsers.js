import React, {useState, useEffect} from 'react';
import {db, auth} from '../firebase'
import firebase from 'firebase'
import { Card } from 'semantic-ui-react';
import ProfileSearchCard from '../components/ProfileSearchCard'
import FeedStyle from '../styles/FeedStyle.css'

function RecommendedUsers(props) {
    const [currUser, setCurrUser] = useState(firebase.auth().currentUser);

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
        console.log(currUser)
        return () => {
            //perform cleanup actions
            unsubscribe();
        }
    }, []);

return <Card fluid>
            <Card.Header>
                <h3 className='recomusers_title'> Suggested for You: </h3>
            </Card.Header>
            <Card.Content>
                 <ul>
                    {(props.profileList.length !== 0) && (props.profileList.map((doc) =>
                            <div className='recusers_list_el'>
                            <ProfileSearchCard username={doc.profile?.displayName} owner={doc.profile?.userID} profPic={doc.profile?.ProfilePic} loggedIn={currUser?.displayName}/>
                            </div>
                     ))}
                 </ul>
            </Card.Content>
         </Card>


}

export default RecommendedUsers;