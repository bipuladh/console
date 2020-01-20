import './_restore-pvc-modal.scss';

import * as React from 'react';

import { Form, FormGroup, Grid, GridItem, TextInput } from '@patternfly/react-core';
import {
  HandlePromiseProps,
  ResourceIcon,
  withHandlePromise,
} from '@console/internal/components/utils/index';
import { K8sResourceKind, k8sCreate, k8sGet } from '@console/internal/module/k8s';
import {
  ModalBody,
  ModalComponentProps,
  ModalSubmitFooter,
  ModalTitle,
  createModalLauncher,
} from '@console/internal/components/factory';
import { NamespaceModel, PersistentVolumeClaimModel } from '@console/internal/models';

import { VolumeSnapshotModel } from '../../../models';

export const RestorePVCModal = withHandlePromise((props: RestorePVCModalProps) => {
  const { close, cancel, resource, errorMessage, inProgress, handlePromise } = props;
  const [submitDisabled, setSubmitDisabled] = React.useState(false);
  const [pvcResource, setResource] = React.useState(null);
  const [restorePVCName, setPVCName] = React.useState(
    `${resource?.metadata?.name || 'pvc'}-restore`,
  );

  const onRestoreNameChange = (value: string) => {
    setSubmitDisabled(!value);
    setPVCName(value);
  };

  React.useEffect(() => {
    k8sGet(PersistentVolumeClaimModel, resource?.spec?.source?.name, resource?.metadata?.namespace)
      .then((obj) => setResource(obj))
      .catch((error) => {
        setResource(null);
        throw error;
      });
  }, [resource]);

  const submit = (event: React.FormEvent<EventTarget>) => {
    event.preventDefault();
    const snapshotName = resource?.metadata?.name;
    const pvcSize = resource?.status?.restoreSize;
    const accessModes = pvcResource?.spec?.accessModes;
    const pvcStorageClass = pvcResource?.spec?.storageClassName;
    const namespace = resource?.metadata?.namespace;
    const restorePVCTemplate: K8sResourceKind = {
      apiVersion: `${PersistentVolumeClaimModel.apiVersion}`,
      kind: `${PersistentVolumeClaimModel.kind}`,
      metadata: {
        name: `${restorePVCName}`,
      },
      spec: {
        storageClassName: `${pvcStorageClass}`,
        dataSource: {
          name: `${snapshotName}`,
          kind: `${VolumeSnapshotModel.kind}`,
          apiGroup: 'snapshot.storage.k8s.io',
        },
        accessModes: [`${accessModes}`],
        resources: {
          requests: {
            storage: `${pvcSize}`,
          },
        },
      },
    };
    handlePromise(k8sCreate(PersistentVolumeClaimModel, restorePVCTemplate, { ns: namespace }))
      .then(() => {
        close();
      })
      .catch((error) => {
        setSubmitDisabled(true);
        throw error;
      });
  };

  return (
    <div className="modal-content modal-content--no-inner-scroll">
      <ModalTitle>Restore</ModalTitle>
      <ModalBody>
        <p>After restore action is finished, a new PVC will be created </p>
        <Form onSubmit={submit}>
          <FormGroup label="Name" isRequired fieldId="restore-pvc-modal__name">
            <TextInput
              isRequired
              type="text"
              id="restore-pvc-modal__name"
              name="restore-pvc-modal__name"
              value={restorePVCName}
              onChange={onRestoreNameChange}
            />
          </FormGroup>
          <div className="ceph-restore-pvc-modal__details-section">
            <Grid gutter="md">
              <GridItem span={6}>
                <div>
                  <p className="ceph-restore-pvc-modal__pvc-details">Date</p>
                  <p>{resource?.metadata?.creationTimestamp}</p>
                </div>
                <div>
                  <p className="ceph-restore-pvc-modal__pvc-details">Status</p>
                  <p>{resource?.status?.readyToUse ? 'Ready' : 'Not Ready'}</p>
                </div>
                <div>
                  <p className="ceph-restore-pvc-modal__pvc-details">Size</p>
                  <p>{resource?.status?.restoreSize ? resource?.status?.restoreSize : 'No Data'}</p>
                </div>
              </GridItem>
              <GridItem span={6}>
                <div>
                  <p className="ceph-restore-pvc-modal__pvc-details">Namespace</p>
                  <p>
                    <ResourceIcon kind={NamespaceModel.kind} />
                    {resource?.metadata?.namespace}
                  </p>
                </div>
                <div>
                  <p className="ceph-restore-pvc-modal__pvc-details">API Version</p>
                  <p>{resource?.apiVersion}</p>
                </div>
                <div>
                  <p className="ceph-restore-pvc-modal__pvc-details">Persistent Volume</p>
                  <ResourceIcon kind={PersistentVolumeClaimModel.kind} />
                  {resource?.spec?.source?.name}
                </div>
              </GridItem>
            </Grid>
          </div>
        </Form>
      </ModalBody>
      <ModalSubmitFooter
        inProgress={inProgress}
        errorMessage={errorMessage}
        submitText="Restore"
        cancel={cancel}
        submitDisabled={submitDisabled}
      />
    </div>
  );
});

export type RestorePVCModalProps = {
  resource: K8sResourceKind;
} & HandlePromiseProps &
  ModalComponentProps;

export default createModalLauncher(RestorePVCModal);
