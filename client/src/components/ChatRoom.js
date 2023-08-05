import firebase from "../firebase"
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { useLocation } from 'react-router-dom';

import {useCollectionData} from "react-firebase-hooks/firestore"

import React, { useEffect, useRef } from "react";

const auth = firebase.auth();
const firestore = firebase.firestore();

export default function ChatRoom(){

    const location = useLocation();
    const randomId = Date.now();
    const [otherDisplay, setOtherDisplay] = React.useState("");
    let myDisplay = auth.currentUser.displayName;
    useEffect(() => {
        firestore.collection("matchmaking").doc(auth.currentUser.uid).delete();
        return () => {
            firestore.collection("matchmaking").doc(auth.currentUser.uid).delete()
        }
        //SEND MESSAGE HERE THAT USER HAS LEFT THE CHAT
    }, [location]);

    const state = location.state;
    const myDisorders = [];
    const keys = Object.keys(state);
    keys.forEach((key) => {
        if(state[key] === true){
            myDisorders.push(key);
        }
    })

    let commonDisorder;

    const [conversation, setConversation] = React.useState(auth.currentUser.uid.concat("-"));
    let messagesRef= firestore.collection(conversation);
    useEffect(() => {
        console.log(conversation)
        saveChat(conversation)
    },[conversation]);

    const query = messagesRef.orderBy("createdAt");
    const [messages] = useCollectionData(query, {idField: "id"});
    const inputRef = useRef(null);
    useEffect(() => {
        firestore.collection("matchmaking").doc(auth.currentUser.uid).onSnapshot((doc) => {
            
            if(doc.data() !== undefined && doc.data().match !== "")
            {
                setOtherDisplay( doc.data().otherDisplay);
                setConversation(auth.currentUser.uid.concat("-", doc.data().match, "-", doc.data().randomId))
                
                console.log("saving chat+ " + conversation)
                messagesRef.doc(auth.currentUser.uid).delete();

                
                doc.data().disorders.forEach((disorder) => {
                    if(myDisorders.includes(disorder)){
                        commonDisorder = disorder;
                    }
                })
                saveChat(auth.currentUser.uid.concat("-", doc.data().match, "-", doc.data().randomId))
            }
        });
        window.addEventListener("beforeunload", (event) => {
            firestore.collection("matchmaking").doc(auth.currentUser.uid).delete()
        });
    }, [])
    // useEffect(() => {
    //     window.onbeforeunload = () => handler();
    
    //     window.addEventListener('beforeunload', (event) => {
    //       handler();
    //     });
    
    //     return () => {
    //       handler();
    //       document.removeEventListener('beforeunload', handler);
    //     };
    //   });
    const sendMessage = async(e) =>{

        e.preventDefault();
        const {uid} = auth.currentUser;
        await messagesRef.add({
            text: inputRef.current.value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            username: myDisplay,
        });


    }
    
    return(
        <>
            <div>
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
            </div>
            <form onSubmit={sendMessage}>
                <input type="text" ref={inputRef}/>
                <button type="submit">Send</button>
            </form> 
            {true && <button onClick={matchmake}>Matchmake</button>}
            {true && <button onClick={()=>sendReport("test")}>report</button>}
            {true && <button onClick={getChats}>load chat</button>}
        </>   
        )

    function saveChat(chatid){
        console.log("ran")
        if(conversation !== auth.currentUser.uid.concat("-") && conversation !== auth.currentUser.uid.concat("--", randomId) && otherDisplay !== "")
        {
            console.log("truetrue")
            firestore.collection("account").doc(auth.currentUser.uid).set({
                saved: firebase.firestore.FieldValue.arrayUnion({other: otherDisplay, chatid: chatid})
                
            }, {merge: true});
        }
    }

    function callback(){
        getChats().then((chats) => {
            chats.forEach((chat) => {
                loadChat(chat);
            });
        });
    }
    function getChats(){

        firestore.collection("account").doc(auth.currentUser.uid).get().then((doc) => {
            console.log(doc.data().saved);
            return doc.data().saved;
            // doc.data().saved.forEach((chat) => {
            //     firestore.collection(chat).get().then((snapshot) => {
            //         snapshot.forEach((doc) => {
            //             console.log(doc.data())
            //         })
            //     })
            // })
        })
    }
    function loadChat(chatid){
        firestore.collection(chatid).get().then((snapshot) => {
            snapshot.forEach((doc) => {
                console.log(doc.data())
            })
        });

    }
    function matchmake(){
        if(myDisorders.length !== 0){
            const matchmakeRef = firestore.collection("matchmaking");
            let match;
            matchmakeRef.doc(auth.currentUser.uid).delete();
            matchmakeRef.where('disorders', 'array-contains-any', myDisorders).limit(25)
            .get()
            .then((snapshot) => {
            if (snapshot.empty) {
                console.log('No matching documents.');
                firestore.collection("matchmaking").doc(auth.currentUser.uid).set({
                    disorders: myDisorders,
                    randomId: randomId,
                    myDisplay: auth.currentUser.displayName,
                    otherDisplay: "",
                    match: ""
                })
                return;
            }else{
                let doc = snapshot.docs[Math.floor(Math.random() * snapshot.docs.length)]
                setOtherDisplay(doc.data().myDisplay);
                setConversation(doc.id.concat("-", auth.currentUser.uid, "-", doc.data().randomId))
                saveChat(doc.id.concat("-", auth.currentUser.uid, "-", doc.data().randomId))
                firestore.collection("matchmaking").doc(doc.id).set({
                    match: auth.currentUser.uid,
                    otherDisplay: auth.currentUser.displayName,
                }, {merge: true})
                
                doc.data().disorders.forEach((disorder) => {
                    if(myDisorders.includes(disorder)){
                        commonDisorder = disorder;
                        console.log("commonDisorder= " + commonDisorder);
                    }
                })

                matchmakeRef.doc(doc.id).delete();
            }
            
            })
        }
    
    }
    
    
    function ChatMessage(props){
        const {text, username, uid} = props.message;
        const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
        return (
            <div className={`message ${messageClass}`}>
                <p>{username }</p>
                <p>{text}</p>
            </div>
            )
    }

    function sendReport(reasoning){
        firestore.collection("reports").doc(auth.currentUser.uid).set({
            reasoning: reasoning,
            reporter: auth.currentUser.displayName,
            chatlogs: messages,
        })
    }
}


