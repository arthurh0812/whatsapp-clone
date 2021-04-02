import React from "react";
import "./App.css";
import Chat from "./Chat";
import Sidebar from "./Sidebar";
import axios from "./axios";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
    };
  }

  componentDidMount() {
    axios.get("/api/messages").then((res) => {
      this.setState({ messages: res.data.data.messages });
    });
    console.log("Component did mount");
  }

  render() {
    return (
      <div className="app">
        <div className="app__body">
          <Sidebar />
          <Chat messages={this.state.messages} />
        </div>
      </div>
    );
  }
}

export default App;
