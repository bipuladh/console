/**
 * This is a wrapper around HorizontalNav Component to be used as part of the Internal API
 *
 */

import * as React from 'react';
import { HorizontalNavProps } from '@console/dynamic-plugin-sdk/src/api/internal';
import { HorizontalNav as Nav } from '@console/internal/components/utils';

const HorizontalNav: React.FC<HorizontalNavProps> = ({ obj, ...props }) => (
  <Nav {...props} obj={{ loaded: true, data: obj }} />
);

export default HorizontalNav;
