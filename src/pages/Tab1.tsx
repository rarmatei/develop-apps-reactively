import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonFooter,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { book, build, colorFill, grid } from "ionicons/icons";
import React from "react";
import "./Tab1.css";
import { ProgressbarExample } from "../components/LoadingBar";
import { timer } from "rxjs";
import {
  showLoadingStatus,
  PromiseWithLoadingProgress
} from "../services/Extensions";

const loadingObservable = timer(6000).pipe(showLoadingStatus());
const longObs = timer(12000).pipe(showLoadingStatus());

const Tab1: React.FunctionComponent = () => {
  const doWork = () => {
    loadingObservable.subscribe();
  };

  const doLongWork = () => {
    longObs.subscribe();
  };
  const doPromiseWork = () => {
    new PromiseWithLoadingProgress((resolve: any) => {
      setTimeout(resolve, 4000);
    });
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab One</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard className="welcome-card">
          <img src="/assets/shapes.svg" alt="" />
          <IonCardHeader>
            <IonCardSubtitle>Get Started</IonCardSubtitle>
            <IonCardTitle>Welcome to Ionic</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Now that your app has been created, you'll want to start building
              out features and components. Check out some of the resources below
              for next steps.
            </p>
          </IonCardContent>
        </IonCard>

        <IonList lines="none">
          <IonListHeader>
            <IonLabel>Resources</IonLabel>
          </IonListHeader>
          <IonItem href="#" onClick={doWork}>
            <IonIcon slot="start" color="medium" icon={book} />
            <IonLabel>Ionic Documentation</IonLabel>
          </IonItem>
          <IonItem href="#" onClick={doPromiseWork}>
            <IonIcon slot="start" color="medium" icon={build} />
            <IonLabel>Scaffold Out Your App</IonLabel>
          </IonItem>
          <IonItem href="#" onClick={doLongWork}>
            <IonIcon slot="start" color="medium" icon={grid} />
            <IonLabel>Change Your App Layout</IonLabel>
          </IonItem>
          <IonItem
            href="https://ionicframework.com/docs/theming/basics"
            target="_blank"
          >
            <IonIcon slot="start" color="medium" icon={colorFill} />
            <IonLabel>Theme Your App</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
      <IonFooter mode={"ios"} translucent={true}>
        <ProgressbarExample></ProgressbarExample>
      </IonFooter>
    </>
  );
};

export default Tab1;
