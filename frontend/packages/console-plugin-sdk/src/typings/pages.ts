import { Extension, LazyLoader } from './base';
import { K8sKind, K8sResourceKindReference } from '@console/internal/module/k8s';
import { RouteComponentProps, RouteProps } from 'react-router-dom';

namespace ExtensionProperties {
  export interface ResourcePage<T> {
    /** Model associated with the resource page. */
    model: K8sKind;
    /** Loader for the corresponding React page component. */
    loader: LazyLoader<T>;
  }

  /** To add an additonal page to public components(ex: PVs, PVCs) via plugins */
  export type AdditionalPage = ResourcePage<{
    /** See https://reacttraining.com/react-router/web/api/match */
    match: RouteComponentProps['match'];
    /** The resource kind scope. */
    kind: K8sResourceKindReference;
    /** The namespace scope. */
    namespace: string;
  }> & {
    /** The href for the additional page */
    href: string;
    /** Name of the additional tab inside detailsPage  */
    name: string;
  };

  export type ResourceListPage = ResourcePage<{
    /** See https://reacttraining.com/react-router/web/api/match */
    match: RouteComponentProps['match'];
    /** The resource kind scope. */
    kind: K8sResourceKindReference;
    /** Whether the page should assign focus when loaded. */
    autoFocus: boolean;
    /** Whether the page should mock the UI empty state. */
    mock: boolean;
    /** The namespace scope. */
    namespace: string;
  }>;

  export type ResourceDetailsPage = ResourcePage<{
    /** See https://reacttraining.com/react-router/web/api/match */
    match: RouteComponentProps['match'];
    /** The resource kind scope. */
    kind: K8sResourceKindReference;
    /** The namespace scope. */
    namespace: string;
    /** The page name. */
    name: string;
  }>;

  // Maps to react-router#https://reacttraining.com/react-router/web/api/Route
  // See https://reacttraining.com/react-router/web/api/Route
  export type RoutePage = Omit<RouteProps, 'location'> & {
    /** Loader for the corresponding React page component. */
    loader?: LazyLoader<RouteComponentProps>;
    /** Any valid URL path or array of paths that path-to-regexp@^1.7.0 understands. */
    path: string | string[];
    /** Perspective id to which this page belongs to. */
    perspective?: string;
    /** Feature flags required for this extension to be effective. */
    required?: string | string[];
  };
}

export interface ResourceListPage extends Extension<ExtensionProperties.ResourceListPage> {
  type: 'Page/Resource/List';
}

export interface ResourceDetailsPage extends Extension<ExtensionProperties.ResourceDetailsPage> {
  type: 'Page/Resource/Details';
}

export interface RoutePage extends Extension<ExtensionProperties.RoutePage> {
  type: 'Page/Route';
}

export interface AdditionalPage extends Extension<ExtensionProperties.AdditionalPage> {
  type: 'Page/AdditionalPage';
}

export type ResourcePage = ResourceListPage | ResourceDetailsPage;

export const isResourceListPage = (e: Extension): e is ResourceListPage => {
  return e.type === 'Page/Resource/List';
};

export const isResourceDetailsPage = (e: Extension): e is ResourceDetailsPage => {
  return e.type === 'Page/Resource/Details';
};

export const isAdditionalPage = (e: Extension): e is AdditionalPage => {
  return e.type === 'Page/AdditionalPage';
};

export const isRoutePage = (e: Extension): e is RoutePage => {
  return e.type === 'Page/Route';
};
