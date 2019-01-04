import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Dialog from './components/A11yDialog'

class App extends Component {
  state = { modalOpen: true, backdropColor: 'rgba(255, 255, 255, 0.5)' };
  contentRef = React.createRef();
  
  toggleModal = () => {
		this.setState({ modalOpen: !this.state.modalOpen });
  };
  
  render() {
    return (
      <div className="App">
        <header ref={this.contentRef} className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <button
						className="App-link"
						href="https://reactjs.org"
						target="_blank"
						rel="noopener noreferrer"
						onClick={this.toggleModal}
					>
						Open Dialog
					</button>
          <Dialog
						contentRef={this.contentRef}
						isOpen={this.state.modalOpen}
						onClose={this.toggleModal}
						className="App-mainDialog"
						backdropColor={this.state.backdropColor}
					>
						{focusRef => (
							<React.Fragment>
								<input type="text" />
								<input type="number" />
								<input type="text" disabled />
								<input type="text" />
								<button onClick={this.toggleModal} ref={focusRef}>Close</button>
                {/* causes error log in console on every setState - performs poorly on scroll */}
                {/* <div contentEditable>
									lala
								</div> */}
								<select>
									<option>1</option>
									<option>2</option>
									<option>3</option>
								</select>
								<div>סתם דיב</div>
								<div>סתם דייב</div>
								סתם מלל
								<textarea>hey</textarea>
							</React.Fragment>
						)}
					</Dialog>
        </header>
      </div>
    );
  }
}

export default App;
