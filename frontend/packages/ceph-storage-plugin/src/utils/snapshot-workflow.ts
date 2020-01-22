import { K8sKind, K8sResourceKind } from '@console/internal/module/k8s';

import { KebabOption } from '@console/internal/components/utils';

export const SnapshotPVC = (kind: K8sKind, resource: K8sResourceKind): KebabOption => {
  return {
    label: 'Create Snapshot',
    callback: () => {
      const clusterObject = { resource };
      import(
        '../components/modals/volume-snapshot-modal/volume-snapshot-modal' /* webpackChunkName: "ceph-storage-volume-snapshot-modal" */
      )
        .then((m) => m.volumeSnapshotModal(clusterObject))
        .catch((e) => {
          throw e;
        });
    },
    accessReview: {
      group: kind.apiGroup,
      resource: kind.plural,
      namespace: resource.metadata.namespace,
      verb: 'create',
    },
  };
};
