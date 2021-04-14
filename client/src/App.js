import React, { useState, useEffect } from "react";
import "./App.css";
import Post from "./Post";
import ImageUpload from "./ImageUpload";
import { db, auth } from "./firebase";
import { Button, Avatar, makeStyles, Modal, Input, TextField, CircularProgress } from "@material-ui/core";
import FlipMove from "react-flip-move";
import InstagramEmbed from "react-instagram-embed";
import axios from "./axios";
import  Pusher from "pusher-js";
import { usePromiseTracker, trackPromise } from "react-promise-tracker";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    height: "300px",
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    height: 200,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [EmailError, setEmailError] = useState("");
  const [PasswordError, setPasswordError] = useState("");
  const [UsernameError, setUsernameError] = useState("");
  const [loginError, setloginError] = useState("")
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // user is logged in...
        console.log(authUser);
        setUser(authUser);

        if (authUser.displayName) {
          // dont update username
        } else {
          return authUser.updateProfile({
            displayName: username,
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, username]);

  const { promiseInProgress } = usePromiseTracker();

  const fetchPosts = async() => {
    await sleep(2000);
    await axios.get('/api/sync').then(response => {
      setPosts(response.data);
    });
  }
  

  useEffect(() => {
    var pusher = new Pusher('cccdc78c6de2ce551133', {
      cluster: 'ap2'
    });

    var channel = pusher.subscribe('posts');
    channel.bind('inserted', function(data) {
      trackPromise(fetchPosts());
    });
  })

  useEffect(() => {
    trackPromise(fetchPosts());
  }, []);

  console.log('posts are >>>',posts)

  const handleLogin = (e) => {
    e.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        setloginError("")
        setOpen(false);
      })
      .catch((error) => {
        setloginError(error.message)
        setOpen(true);
      }
    );

  };

  const handleRegister = (e) => {
    e.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        setEmailError("");
        setPasswordError("");
        setUsernameError("");
        setRegisterOpen(false);
      })
      .catch((error) => {
        var msg=error.message.toLowerCase();
        if(msg.includes("email")){
          setEmailError(error.message);
          setUsernameError("");
          setPasswordError("");
        }
        else if(msg.includes("password")){
          setPasswordError(error.message);
          setUsernameError("");
          setEmailError("");
        }
        else{
          setUsernameError(error.message);
          setEmailError("");
          setPasswordError("");
        }
         setRegisterOpen(true);         
      });

  };

  return (
    <div className="app">
      <Modal open={open} onClose={() => setOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="app__login">
            <center>
              <img
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt=""
              />
            </center>

            <TextField
              label="Email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p style={{color:"red"}}>{loginError}</p>
            <Button color="secondary" variant="contained"  onClick={handleLogin}>Login</Button>
          </form>
        </div>
      </Modal>

      <Modal open={registerOpen} onClose={() => setRegisterOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="app__login">
            <center>
              <img
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt=""
              />
            </center>
            <TextField
              type="text"
              value={username}
              helperText={UsernameError}
              error={UsernameError}
              label="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Email"
              type="text"
              value={email}
              helperText={EmailError}
              error={EmailError}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              helperText={PasswordError}
              error={PasswordError}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button color="primary" variant="contained" onClick={handleRegister}>Register</Button>
          </form>
        </div>
      </Modal>
      <div className="app__header">
        <img
          className="app__headerImage"
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt=""
        />
        {user?.displayName ? (
          <div className="app__headerRight">
            <Button onClick={() => auth.signOut()}>Logout</Button>
            <Avatar
              className="app__headerAvatar"
              alt={user.displayName}
              src="/static/images/avatar/1.jpg"
            />
          </div>
        ) : (
          <form className="app__loginHome">
            <Button onClick={() => setOpen(true)}>Login</Button>
            <Button onClick={() => setRegisterOpen(true)}>Sign Up</Button>
          </form>
        )}
      </div>

      <div className="app__posts">
        <div className="app__postsLeft">
          <FlipMove>
            {posts.map((post) => (
              <Post
                user={user}
                key={post._id}
                postId={post._id}
                username={post.user}
                caption={post.caption}
                imageUrl={post.image}
              />
            ))}
          </FlipMove>
          {promiseInProgress ? 
            <>
              <CircularProgress />
              <br></br>
              <br></br>
            </>
            : ""}
          
        </div>
        <div className="app__postsRight">
          <InstagramEmbed
            url="https://www.instagram.com/p/B_uf9dmAGPw/"
            maxWidth={320}
            hideCaption={false}
            containerTagName="div"
            protocol=""
            injectScript
            onLoading={() => {}}
            onSuccess={() => {}}
            onAfterRender={() => {}}
            onFailure={() => {}}
          />
        </div>
      </div>

      {user?.displayName ? (
        <div className="app__upload">
          <ImageUpload username={user.displayName} />
        </div>
      ) : (
        <center>
          <h3>Login to upload</h3>
        </center>
      )}
    </div>
  );
}

export default App;
