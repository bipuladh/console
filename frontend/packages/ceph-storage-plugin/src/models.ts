import { K8sKind } from '@console/internal/module/k8s';

export const CephClusterModel: K8sKind = {
  label: 'Ceph Cluster',
  labelPlural: 'Ceph Clusters',
  apiVersion: 'v1',
  apiGroup: 'ceph.rook.io',
  plural: 'cephclusters',
  abbr: 'CC',
  namespaced: true,
  kind: 'CephCluster',
  id: 'cephcluster',
  crd: true,
};

export const CSVModel: K8sKind = {
  label: 'ocs-operator',
  labelPlural: 'OCS Operators',
  apiVersion: 'v1alpha1',
  apiGroup: 'operators.coreos.com',
  plural: 'ocs-operators',
  abbr: 'ocs',
  namespaced: true,
  kind: 'ClusterServiceVersion',
  //  id: 'ocscluster',
  crd: true,
};
