import React from "react";
import "./Chat.css";
import SearchOutlined from "@material-ui/icons/SearchOutlined";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import { Avatar, IconButton } from "@material-ui/core";
import Pusher from "pusher-js";

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: props.messages,
    };
  }

  componentDidMount() {
    var pusher = new Pusher("f29e824469db4dcea89a", {
      cluster: "eu",
    });

    var channel = pusher.subscribe("messages");
    channel.bind("inserted", (newMessage) => {
      this.setState({ messages: [...this.state.messages, newMessage] });
    });
    channel.bind("deleted", (messageId) => {
      this.state.messages.forEach((message, index) => {
        if (message._id === messageId) {
          const deletedMessage = message;
          deletedMessage.deleted = true;
          this.setState({
            messages: [
              ...this.state.messages.slice(0, index),
              deletedMessage,
              ...this.state.messages.slice(index + 1),
            ],
          });
        }
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }

  render() {
    return (
      <div className="chat">
        <div className="chat__header">
          <Avatar />

          <div className="chat__headerInfo">
            <h3>Room Name</h3>
            <p>last seen ...</p>
          </div>

          <div className="chat__headerRight">
            <IconButton>
              <SearchOutlined />
            </IconButton>
            <IconButton>
              <AttachFileIcon />
            </IconButton>
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </div>
        </div>

        <div className="chat__body">
          {this.state.messages.map((message) => {
            if (message.deleted)
              return (
                <p className="chat__message">
                  <span className="chat__messageName">{message.name}</span>
                  <span className="chat__deleted">
                    This message was deleted
                  </span>
                </p>
              );
            else {
              return (
                <p
                  className={`chat__message ${
                    message.received ? "chat__receiver" : ""
                  }`}
                >
                  <span className="chat__messageName">{message.name}</span>
                  {message.message}
                  <span className="chat__messageTimestamp">
                    {message.timestamp}
                  </span>
                </p>
              );
            }
          })}
        </div>

        <div className="chat__footer">
          <InsertEmoticonIcon />
          <form>
            <input placeholder="Type a message" type="text" />
            <button type="submit">Send a message</button>
          </form>
          <MicIcon />
        </div>
      </div>
    );
  }
}

export default Chat;
