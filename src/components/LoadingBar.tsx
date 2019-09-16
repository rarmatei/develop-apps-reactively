import React from "react";
import { IonProgressBar, IonContent } from "@ionic/react";
import { connect } from "../services/LoadingBarService";

const styles = {
  //   border: "red solid",
  //   padding: "20px"
};

export class ProgressbarExample extends React.Component {
  state = {
    percentageLoaded: 0,
    showLoadingBar: false
  };

  componentDidMount() {
    connect(
      this.showLoadingBar.bind(this),
      this.hideLoadingBar.bind(this)
    );
  }

  showLoadingBar(total?: number, loaded?: number) {
    const percentageDefined = total !== undefined && loaded !== undefined;
    const percentageLoaded = percentageDefined
      ? (loaded as number) / (total as number)
      : 0;
    this.setState({
      percentageLoaded,
      showLoadingBar: true
    });
  }

  hideLoadingBar() {
    this.setState({
      showLoadingBar: false
    });
  }

  render() {
    return (
      <>
        {this.state.showLoadingBar ? (
          <IonProgressBar
            style={styles}
            value={this.state.percentageLoaded}
            buffer={this.state.percentageLoaded}
          ></IonProgressBar>
        ) : (
          <></>
        )}
      </>
    );
  }
}
