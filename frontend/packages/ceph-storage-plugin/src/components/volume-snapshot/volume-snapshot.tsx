import './_volume-snapshot.scss';

import * as React from 'react';
import * as _ from 'lodash';
import * as classNames from 'classnames';

import {
  BreadCrumbs,
  Firehose,
  Kebab,
  ResourceIcon,
  ResourceKebab,
  ResourceLink,
  SectionHeading,
} from '@console/internal/components/utils';
import { K8sResourceKind, referenceFor } from '@console/internal/module/k8s';
import { Link, match } from 'react-router-dom';
import {
  ListPage,
  Table,
  TableData,
  TableProps,
  TableRow,
} from '@console/internal/components/factory';
import { NamespaceModel, PersistentVolumeClaimModel } from '@console/internal/models';
import { getName, getNamespace } from '@console/shared';

import { VolumeSnapshotModel } from '../../models';
import { getKebabActionsForKind } from '../../utils/kebab-actions';
import { sortable } from '@patternfly/react-table';
import { volumeSnapshotModal } from '../modals/volume-snapshot-modal/volume-snapshot-modal';

const snapshotMenuActions = [...getKebabActionsForKind(VolumeSnapshotModel)];

const snapshotTableColumnClasses = [
  '',
  classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'),
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'),
  classNames('pf-m-hidden', 'pf-m-visible-on-xl'),
  classNames('pf-m-hidden', 'pf-m-visible-on-2xl'),
  Kebab.columnClass,
];

const VolumeSnapshotTableHeader = () => {
  return [
    {
      title: 'Name',
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: snapshotTableColumnClasses[0] },
    },
    {
      title: 'Date',
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: snapshotTableColumnClasses[1] },
    },
    {
      title: 'Status',
      sortField: 'status.phase',
      transforms: [sortable],
      props: { className: snapshotTableColumnClasses[2] },
    },
    {
      title: 'Size',
      sortField: 'status.restoreSize',
      transforms: [sortable],
      props: { className: snapshotTableColumnClasses[3] },
    },
    {
      title: 'Labels',
      sortField: 'metadata.labels',
      transforms: [sortable],
      props: { className: snapshotTableColumnClasses[4] },
    },
    {
      title: '',
      props: { className: snapshotTableColumnClasses[5] },
    },
  ];
};
VolumeSnapshotTableHeader.displayName = 'SnapshotTableHeader';

const volumeSnapshotKind = referenceFor(VolumeSnapshotModel);

type VolumeSnapshotDetailsProps = {
  match: match<{ ns: string; name: string; appName: string }>;
};

export const VolumeSnapshotDetails: React.FC<VolumeSnapshotDetailsProps> = (props) => {
  const { match: pvcObj } = props;
  return (
    <Firehose
      resources={[
        {
          name: pvcObj.params.name,
          namespace: pvcObj.params.ns,
          kind: referenceFor(VolumeSnapshotModel),
          prop: 'obj',
        },
      ]}
    >
      <DetailsComponent
        {...props}
        ns={pvcObj.params.ns}
        pvcName={pvcObj.params.appName}
        url={pvcObj.url}
      />
    </Firehose>
  );
};
type DetailsComponentProps = {
  ns: string;
  pvcName: string;
  url: string;
  resources?: {
    obj: {
      data: K8sResourceKind;
    };
  };
};
const DetailsComponent: React.FC<DetailsComponentProps> = (props) => {
  const {
    ns,
    pvcName,
    url,
    resources: {
      obj: { data },
    },
  } = props;
  return (
    <div>
      <div className="ceph-volume-snapshot__header">
        <div className="ceph-volume-snapshot__header-buttons">
          <BreadCrumbs
            breadcrumbs={[
              {
                name: PersistentVolumeClaimModel.labelPlural,
                path: `/k8s/ns/${ns}/persistentvolumeclaims`,
              },
              {
                name: `${pvcName}`,
                path: `/k8s/ns/${ns}/persistentvolumeclaims/${pvcName}`,
              },
              {
                name: 'Snapshot Details',
                path: `${url}`,
              },
            ]}
          />
        </div>

        <h2 className="co-m-pane__heading co-m-pane__heading--baseline">
          <div className="co-m-pane__name">
            <ResourceIcon kind={VolumeSnapshotModel.kind} /> {pvcName}
          </div>
        </h2>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text="Snapshot Details" />
        <div className="row">
          <div className="col-sm-6">
            <dl>
              <dt>Name</dt>
              <dd>{getName(data)}</dd>
              <dt>Date</dt>
              <dd>{data?.metadata?.creationTimestamp}</dd>
              <dt>Status</dt>
              <dd>{data?.status?.readyToUse ? 'Ready' : 'Not Ready'}</dd>
              <dt>Size</dt>
              <dd>{data?.status?.restoreSize || 'No Data'}</dd>
              <dt>Namespace</dt>
              <dd>
                <ResourceLink
                  kind={NamespaceModel.kind}
                  name={getName(data)}
                  namespace={getNamespace(data)}
                />
              </dd>
              <dt>Annotations</dt>
              <dd>None</dd>
              <dt>Labels</dt>
              <dd>None</dd>
            </dl>
          </div>
          <div className="col-sm-6">
            <dl>
              <dt>API Version</dt>
              <dd>{data?.apiVersion}</dd>
              <dt>Persistent Volume Claim</dt>
              <dd>
                <ResourceLink
                  kind={PersistentVolumeClaimModel.kind}
                  name={data?.spec?.source?.name}
                  namespace={getNamespace(data)}
                />
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
type VolumeSnapshotTableRowProps = {
  obj: K8sResourceKind;
  index: number;
  key?: string;
  style: object;
};

const VolumeSnapshotTableRow: React.FC<VolumeSnapshotTableRowProps> = ({
  obj,
  index,
  key,
  style,
}) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={snapshotTableColumnClasses[0]}>
        <VolumeSnapshotLink
          kind={volumeSnapshotKind}
          name={getName(obj)}
          namespace={getNamespace(obj)}
          pvc={obj?.spec?.source?.name}
          details={VolumeSnapshotDetails}
        />
      </TableData>
      <TableData className={snapshotTableColumnClasses[1]}>
        {obj?.metadata?.creationTimestamp}
      </TableData>
      <TableData className={snapshotTableColumnClasses[2]}>
        {obj?.status?.readyToUse ? 'Ready' : 'Not Ready'}
      </TableData>
      <TableData className={snapshotTableColumnClasses[3]}>
        {obj?.status?.restoreSize || 'No Data'}
      </TableData>
      <TableData className={snapshotTableColumnClasses[4]}>None</TableData>
      <TableData className={snapshotTableColumnClasses[5]}>
        <ResourceKebab actions={snapshotMenuActions} kind={volumeSnapshotKind} resource={obj} />
      </TableData>
    </TableRow>
  );
};
VolumeSnapshotTableRow.displayName = 'SnapshotTableRow';

export const VolumeSnapshotList: React.FC<TableProps> = (props) => (
  <Table
    {...props}
    aria-label="Volume Snapshot"
    Header={VolumeSnapshotTableHeader}
    Row={VolumeSnapshotTableRow}
    virtualize
  />
);

export const VolumeSnapshotLink = (props) => {
  const { name, namespace, pvc } = props;
  const path = `/k8s/ns/${namespace}/persistentvolumeclaims/${pvc}/volumesnapshots/${name}`;
  return (
    <span>
      <Link to={path} title={name} className="co-resource-item__resource-name">
        <ResourceIcon kind={VolumeSnapshotModel.kind} /> {name}
      </Link>
    </span>
  );
};

export const VolumeSnapshotPage = (props) => {
  return (
    <ListPage
      canCreate
      kind={volumeSnapshotKind}
      ListComponent={VolumeSnapshotList}
      showTitle={false}
      namespace={props.namespace}
      createHandler={() => volumeSnapshotModal({ ...props })}
    />
  );
};
