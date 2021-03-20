const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: 'peerjs-server.herokuapp.com',
  secure: true,
  port: '443'
}); //creating a new peer
const myVideo = document.createElement('video') //taking the video element
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)//adding the current user stream

  myPeer.on('call', call => { //event for when user is called.
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream) //adding the stream from which call was received.
    })
  })

  socket.on('user-connected', userId => { //function to log that user is connected.
    console.log("User Connected " + userId);
    connectToNewUser(userId, stream);
  });
});

socket.on('user-disconnected', userId => { //function to log that user is disconnected.
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => { //event handler for opening the room.
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) { //function to call new user.
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream) //adding the new user stream to which call was sent
  });
  call.on('close', () => {
    video.remove(); //removing the video element when call was disconnected.
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) { //function to add the video stream.
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video) //appending the video received to the page.
}
