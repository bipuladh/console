import { K8sKind, K8sResourceKind } from '@console/internal/module/k8s';

import { KebabOption } from '@console/internal/components/utils';

export const DeleteSnapshot = (kind: K8sKind, resource: K8sResourceKind): KebabOption => {
  return {
    label: 'Delete Snapshot',
    callback: () => {
      const clusterObject = { resource };
      import(
        '../../../../public/components/modals/delete-modal' /* webpackChunkName: "ceph-storage-delete-snapshot-modal" */
      )
        .then((m) =>
          m.deleteModal({
            kind,
            resource: clusterObject.resource,
          }),
        )
        .catch((e) => {
          throw e;
        });
    },
    accessReview: {
      group: kind.apiGroup,
      resource: kind.plural,
      namespace: resource.metadata.namespace,
      verb: 'delete',
    },
  };
};
