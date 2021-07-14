/**
 * This is a wrapper around Page Header Component to be used as part of the Internal API
 *
 */

import * as React from 'react';
import { PageHeadingProps } from '@console/dynamic-plugin-sdk/src/api/internal';
import { PageHeading as PageHeadingInternal } from '@console/internal/components/utils';

const PageHeading: React.FC<PageHeadingProps> = (props) => <PageHeadingInternal {...props} />;

export default PageHeading;
