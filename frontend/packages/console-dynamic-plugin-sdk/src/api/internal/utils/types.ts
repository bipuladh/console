import { PopoverProps } from '@patternfly/react-core';
import { TFunction } from 'i18next';
import { match as Match } from 'react-router-dom';
import { K8sResourceCommon, FirehoseResult, Selector } from '../../../extensions/console-types';
import { K8sKind } from '../../common-types';

type Page = {
  href?: string;
  path?: string;
  name?: string;
  nameKey?: string;
  component?: React.ComponentType<any>;
  badge?: React.ReactNode;
  pageData?: any;
};

export type PageHeadingProps = {
  breadcrumbs?: { name: string; path: string }[];
  breadcrumbsFor?: (obj: K8sResourceCommon) => { name: string; path: string }[];
  buttonActions?: any[];
  children?: React.ReactChildren;
  detail?: boolean;
  // group~version~kind
  kind?: string;
  kindObj?: K8sKind;
  menuActions?: Function[];
  obj?: FirehoseResult<K8sResourceCommon>;
  resourceKeys?: string[];
  style?: object;
  title?: string | JSX.Element;
  titleFunc?: (obj: K8sResourceCommon) => string | JSX.Element;
  customData?: any;
  badge?: React.ReactNode;
  icon?: React.ComponentType<{ obj?: K8sResourceCommon }>;
  getResourceStatus?: (resource: K8sResourceCommon) => string;
  className?: string;
};

export type HorizontalNavProps = {
  className?: string;
  obj?: { loaded: boolean; data: K8sResourceCommon };
  label?: string;
  pages: Page[];
  pagesFor?: (obj: K8sResourceCommon) => Page[];
  match: any;
  resourceKeys?: string[];
  hideNav?: boolean;
  EmptyMsg?: React.ComponentType<any>;
  noStatusBox?: boolean;
  customData?: any;
};

export type FieldLevelHelpProps = {
  children: React.ReactNode;
  popoverHasAutoWidth?: PopoverProps['hasAutoWidth'];
  testId?: string;
};

// Types related to list page
type FirehoseResultObject = { [key: string]: K8sResourceCommon | K8sResourceCommon[] };

type FirehoseResourcesResult<
  R extends FirehoseResultObject = { [key: string]: K8sResourceCommon | K8sResourceCommon[] }
> = {
  [k in keyof R]: FirehoseResult<R[k]>;
};

type Flatten<
  F extends FirehoseResultObject = { [key: string]: K8sResourceCommon | K8sResourceCommon[] },
  R = any
> = (resources: FirehoseResourcesResult<F>) => R;

type CreateProps = {
  action?: string;
  createLink?: (item: string) => string;
  to?: string;
  items?: {
    [key: string]: string;
  };
  onClick?: () => void;
  isDisabled?: boolean;
  id?: string;
};

type RowFilterItem = {
  id?: string;
  title?: string;
  [key: string]: string;
};

type RowFilter<R = any> = {
  defaultSelected?: string[];
  filterGroupName: string;
  isMatch?: (param: R, id: string) => boolean;
  type: string;
  items?: RowFilterItem[];
  itemsGenerator?: (...args) => RowFilterItem[];
  reducer?: (param: R) => React.ReactText;
  filter?: any;
};

type ColumnLayout = {
  id: string;
  columns: ManagedColumn[];
  selectedColumns: Set<string>;
  showNamespaceOverride?: boolean;
  type: string;
};

type ManagedColumn = {
  id?: string;
  title: string;
  additional?: boolean;
};

type PageCommonProps<L = any, C = any> = {
  canCreate?: boolean;
  createButtonText?: string;
  createProps?: CreateProps;
  flatten?: Flatten;
  title?: string;
  showTitle?: boolean;
  filterLabel?: string;
  textFilter?: string;
  rowFilters?: RowFilter[];
  ListComponent: React.ComponentType<L>;
  namespace?: string;
  customData?: C;
  badge?: React.ReactNode;
  hideNameLabelFilters?: boolean;
  hideLabelFilter?: boolean;
  columnLayout?: ColumnLayout;
  hideColumnManagement?: boolean;
  labelFilterPlaceholder?: string;
  nameFilterPlaceholder?: string;
  autoFocus?: boolean;
  mock?: boolean;
};

export type ListPageProps<L = any, C = any> = PageCommonProps<L, C> & {
  kind: string;
  helpText?: React.ReactNode;
  selector?: Selector;
  fieldSelector?: string;
  createHandler?: () => void;
  name?: string;
  filters?: any;
  limit?: number;
  nameFilter?: string;
  match?: Match<any>;
  skipAccessReview?: boolean;
};

type MetricDuration = [string, (duration: string, t: TFunction) => void];

export type UseMetricDuration = (t: TFunction) => MetricDuration;

enum DURATION {
  ONE_HR = 'ONE_HR',
  SIX_HR = 'SIX_HR',
  TWENTY_FOUR_HR = 'TWENTY_FOUR_HR',
}

export type DurationType = (
  t: TFunction,
) => {
  [key in DURATION]: string;
};
