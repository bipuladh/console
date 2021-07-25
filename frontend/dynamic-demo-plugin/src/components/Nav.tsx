import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { HorizontalNav, NavPage } from '@console/dynamic-plugin-sdk/api';

const Thor: React.FC = () => (
  <div>
    <h1> Hello Earth! I am Thor!</h1>
  </div>
);

const Loki: React.FC = () => (
  <div>
    <h1> Hello Earth! I am Loki!</h1>
  </div>
);

const Asgard: React.FC<RouteComponentProps> = (props) => {
  const pages: NavPage[] = [
    {
      href: '',
      name: 'Thor',
      component: Thor,
    },
    {
      href: 'loki',
      name: 'Loki',
      component: Loki,
    },
  ];
  return <HorizontalNav pages={pages} noStatusBox {...props} />;
};

export default Asgard;
