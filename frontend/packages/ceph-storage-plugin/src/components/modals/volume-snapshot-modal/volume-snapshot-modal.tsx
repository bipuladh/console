import * as React from 'react';
import * as _ from 'lodash';

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
  const [disableButton, setDisableButton] = React.useState(false);
  const [snapshotName, setName] = React.useState(
    `${`${_.get(props.resource, 'metadata.name')}-snapshot-1`}`,
  );
  const snapshotTypes = {
    single: 'Single Snapshot',
  };

  const onValueChange = (value: string) => {
    if (value === '') {
      setDisableButton(true);
    } else {
      setDisableButton(false);
    }
    setName(value);
  };

  const submit = (event: React.FormEvent<EventTarget>) => {
    event.preventDefault();
    const ns = _.get(resource, 'metadata.namespace');
    const pvcName = _.get(resource, 'metadata.name');
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
      .then(() => {
        close();
      })
      .catch((error) => {
        setDisableButton(true);
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
              id="snapshot-modal__name"
              name="snapshot-modal__name"
              value={snapshotName}
              onChange={onValueChange}
            />
          </FormGroup>
          <br />
          <FormGroup label="Schedule" fieldId="snapshot-modal__schedule">
            <Dropdown
              className="co-input__dropdown-width"
              items={snapshotTypes}
              id="snapshot-modal__schedule"
              selectedKey={snapshotTypes.single}
            />
          </FormGroup>
        </ModalBody>
        <ModalSubmitFooter
          inProgress={inProgress}
          errorMessage={errorMessage}
          submitText="Create"
          cancel={cancel}
          submitDisabled={disableButton}
        />
      </div>
    </Form>
  );
});

export type VolumeSnapshotModalProps = {
  resource?: any;
} & HandlePromiseProps &
  ModalComponentProps;

export const volumeSnapshotModal = createModalLauncher(VolumeSnapshotModal);
