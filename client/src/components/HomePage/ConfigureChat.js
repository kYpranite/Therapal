import React, { useEffect, useReducer, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import CardContainer from "./CardContainer";
import firebase from "../../firebase";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import AccountCircle from "@mui/icons-material/AccountCircle";
import GoogleIcon from "@mui/icons-material/Google";
import { Box, useMediaQuery, Modal } from "@mui/material";


import {
  Grid,
  InputAdornment,
  TextField,
  Button,
  Typography,
} from "@mui/material";

import TraitToggleButton from "./TraitToggleButton";
import { Link, Navigate, useNavigate } from "react-router-dom";

const auth = firebase.auth();
const firestore = firebase.firestore();

const stateReducer = (state, action) => {
  const key = action.type;
  const obj = { ...state };
  obj[key] = action.bool;
  return obj;
};

function SignIn() {
  const signInWithGoogle = () => {
    auth
      .setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => {
        const provider = new firebase.auth.GoogleAuthProvider();
        return auth.signInWithPopup(provider);
      })
      .catch(error => {
        console.log(error);
      });
  };
  return (
    <Button
      variant="contained"
      onClick={signInWithGoogle}
      sx={{
        bgcolor: "primary.main",
        minWidth: "14rem",
        minHeight: "2.5rem",
        borderRadius: "16px",
      }}
    >
      <GoogleIcon
        fontSize="small"
        sx={{ marginBottom: "1%", marginRight: "4%" }}
      />
      Sign in with Google
    </Button>
  );
}

export default function ConfigureChat() {
  const navigate = useNavigate();
  const lg = useMediaQuery(theme => theme.breakpoints.up("xl"));
  const [displayName, setDisplayName] = useState("");
  const [user] = useAuthState(auth);
  const [banned, setBanned] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);

  function handleErrorOpen() {
    setErrorOpen(true);
  }

  function handleErrorClose() {
    setErrorOpen(false);
  }

  useEffect(() => {
    checkBanned();
    if (user) setDisplayName(user.displayName);
  }, [user]);

  const [selectedTraits, dispatchSelectedTraits] = useReducer(stateReducer, {
    depression: false,
    anxiety: false,
    ptsd: false,
    eatingDisorder: false,
    addiction: false,
    stress: false,
  });

  const newChatHandler = () => {
    if ((Object.values(selectedTraits).every(v => v === false)) || displayName==="") {
      handleErrorOpen()
      return;
    }
    navigate("/chat", {
      state: { ...selectedTraits, displayName: displayName },
    });
    setDisplayName("");
  };

  return (
    <React.Fragment>
      <Modal open={errorOpen} onClose={handleErrorClose}>
      <Box
            sx={{
              boxShadow: 6,
              backgroundColor: "white",
              padding: "1%",
              color: "accent.main",
              margin: "15vh auto",
              borderRadius: "8px",
              border: 2,
              borderColor: "secondary.main",
              textAlign: "center",
              height: "12vh",
              width: "15%",
              fontFamily: "inherit",
            }}
          >
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{ marginBottom: "5%" }}
            >
              Report
            </Typography>
            <Typography variant="body1">
              One of your selected traits or display name is invalid. Please try again.
            </Typography>
          </Box>
      </Modal>
      <CardContainer
        height={lg ? "45vh" : "40vh"}
        width={lg ? "35%" : "65%"}
        title="New Chat"
      >
        <Grid item xs={6}>
          <TextField
            id="display-name"
            placeholder="Display name"
            label="Enter display name"
            variant="outlined"
            value={displayName}
            onChange={() => {
              setDisplayName(document.getElementById("display-name").value);
            }}
            color="accent"
            size="large"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
            sx={{
              margin: "20% auto",
              fieldset: { borderColor: "accent.main" },
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={1} sx={{ margin: "10% auto" }}>
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                sx={{ textAlign: "left", color: "accent.main" }}
              >
                Select a trait to be matched to others with!
              </Typography>
            </Grid>
            <Grid item>
              <TraitToggleButton
                value="depression"
                selectedTraits={selectedTraits.depression}
                dispatchSelectedTraits={dispatchSelectedTraits}
              >
                Depression
              </TraitToggleButton>
            </Grid>
            <Grid item>
              <TraitToggleButton
                value="anxiety"
                selectedTraits={selectedTraits.anxiety}
                dispatchSelectedTraits={dispatchSelectedTraits}
              >
                Anxiety
              </TraitToggleButton>
            </Grid>
            <Grid item>
              <TraitToggleButton
                value="ptsd"
                selectedTraits={selectedTraits.ptsd}
                dispatchSelectedTraits={dispatchSelectedTraits}
              >
                PTSD
              </TraitToggleButton>
            </Grid>
            <Grid item>
              <TraitToggleButton
                value="eatingDisorder"
                selectedTraits={selectedTraits.eatingDisorder}
                dispatchSelectedTraits={dispatchSelectedTraits}
              >
                Eating Disorder
              </TraitToggleButton>
            </Grid>
            <Grid item>
              <TraitToggleButton
                value="addiction"
                selectedTraits={selectedTraits.addiction}
                dispatchSelectedTraits={dispatchSelectedTraits}
              >
                Addiction
              </TraitToggleButton>
            </Grid>
            <Grid item>
              <TraitToggleButton
                value="stress"
                selectedTraits={selectedTraits.stress}
                dispatchSelectedTraits={dispatchSelectedTraits}
              >
                Stress
              </TraitToggleButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          justifyContent="center"
          item
          xs={12}
          sx={{
            borderTop: 2,
            padding: "5% 0 0 0",
            borderColor: "secondary.main",
          }}
        >
          {}
          {user ? (
            !banned ? (
              // <Link to="/chat" state={{...selectedTraits, displayName: displayName}}>
              <Button //!banned and signed in
                variant="contained"
                sx={{
                  bgcolor: "primary.main",
                  minWidth: "10rem",
                  minHeight: "2.5rem",
                  borderRadius: "16px",
                }}
                onClick={newChatHandler}
              >
                New Chat
              </Button>
            ) : (
              <Button
                disabled
                variant="contained"
                sx={{
                  bgcolor: "primary.main",
                  minWidth: "10rem",
                  minHeight: "2.5rem",
                  borderRadius: "16px",
                }}
              >
                Banned
              </Button>
            )
          ) : (
            <SignIn /> //not signed in
          )}
        </Grid>
      </CardContainer>
    </React.Fragment>
  );

  function checkBanned() {
    if (auth.currentUser) {
      firestore
        .collection("banned")
        .doc(auth.currentUser.uid)
        .onSnapshot(
          doc => {
            console.log(doc.data());
            if (doc.data() !== undefined) {
              setBanned(true);
            }
          },
          error => {
            console.log(error);
            if (error.code === "permission-denied") {
              setBanned(true);
            }
          }
        );
    }
  }
}
