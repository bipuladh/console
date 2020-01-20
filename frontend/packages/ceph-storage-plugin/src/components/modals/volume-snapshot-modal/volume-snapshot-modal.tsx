import './_volume-snapshot-modal.scss';

import * as React from 'react';

import {
  Dropdown,
  HandlePromiseProps,
  withHandlePromise,
} from '@console/internal/components/utils';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';
import { K8sResourceKind, k8sCreate } from '@console/internal/module/k8s';
import {
  ModalBody,
  ModalComponentProps,
  ModalSubmitFooter,
  ModalTitle,
  createModalLauncher,
} from '@console/internal/components/factory';

import { PersistentVolumeClaimModel } from '@console/internal/models';
import { VolumeSnapshotModel } from '../../../models';

export const VolumeSnapshotModal = withHandlePromise((props: VolumeSnapshotModalProps) => {
  const { close, cancel, resource, errorMessage, inProgress, handlePromise } = props;
  const [submitDisabled, setSubmitDisabled] = React.useState(false);
  const [snapshotName, setSnapshotName] = React.useState(
    `${resource?.metadata?.name || 'pvc'}-snapshot-1`,
  );
  const snapshotTypes = {
    single: 'Single Snapshot',
  };

  const onSnapshotNameChange = (value: string) => {
    setSubmitDisabled(!value);
    setSnapshotName(value);
  };

  const submit = (event: React.FormEvent<EventTarget>) => {
    event.preventDefault();
    const ns = resource?.metadata?.namespace;
    const pvcName = resource?.metadata?.name;
    const snapshotTemplate: K8sResourceKind = {
      apiVersion: `${VolumeSnapshotModel.apiVersion}`,
      kind: `${VolumeSnapshotModel.kind}`,
      metadata: {
        name: `${snapshotName}`,
        namespace: `${ns}`,
      },
      spec: {
        source: {
          name: `${pvcName}`,
          kind: `${PersistentVolumeClaimModel.kind}`,
        },
      },
    };
    handlePromise(k8sCreate(VolumeSnapshotModel, snapshotTemplate))
      .then(close)
      .catch((error) => {
        setSubmitDisabled(true);
        throw error;
      });
  };

  return (
    <Form onSubmit={submit}>
      <div className="modal-content modal-content--no-inner-scroll">
        <ModalTitle>Create Snapshot</ModalTitle>
        <ModalBody>
          <p>Creating snapshot for {resource?.metadata?.name}</p>
          <FormGroup label="Name" isRequired fieldId="snapshot-modal__name">
            <TextInput
              isRequired
              type="text"
              name="snapshot-modal__name"
              value={snapshotName}
              onChange={onSnapshotNameChange}
            />
          </FormGroup>
          <br />
          <FormGroup label="Schedule" fieldId="snapshot-modal__schedule">
            <Dropdown
              className="ceph-volume-snapshot-input__dropdown-width"
              items={snapshotTypes}
              id="dropdown-schedulebox"
              selectedKey={snapshotTypes.single}
            />
          </FormGroup>
        </ModalBody>
        <ModalSubmitFooter
          inProgress={inProgress}
          errorMessage={errorMessage}
          submitText="Create"
          cancel={cancel}
          submitDisabled={submitDisabled}
        />
      </div>
    </Form>
  );
});

export type VolumeSnapshotModalProps = {
  resource: K8sResourceKind;
} & HandlePromiseProps &
  ModalComponentProps;

export const volumeSnapshotModal = createModalLauncher(VolumeSnapshotModal);
