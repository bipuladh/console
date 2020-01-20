import * as React from 'react';
import * as _ from 'lodash';
import * as classNames from 'classnames';

import {
  BreadCrumbs,
  Kebab,
  ResourceIcon,
  ResourceKebab,
  ResourceLink,
  SectionHeading,
} from '@console/internal/components/utils';
import { K8sResourceKind, k8sGet, referenceFor } from '@console/internal/module/k8s';
import { ListPage, Table, TableData, TableRow } from '@console/internal/components/factory';
import { NamespaceModel, PersistentVolumeClaimModel } from '@console/internal/models';

import { Link } from 'react-router-dom';
import { VolumeSnapshotModel } from '../../models';
import { getKebabActionsForKind } from '../../utils/kebab-actions';
import { getName } from '@console/shared';
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
      sortField: 'status.capacity.storage',
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

export const VolumeSnapshotDetails: React.FC = (props) => {
  const [resource, setResource] = React.useState(null);

  React.useEffect(() => {
    k8sGet(VolumeSnapshotModel, _.get(props, 'match.params.name'), _.get(props, 'match.params.ns'))
      .then((volumeSnapshotObj: K8sResourceKind) => {
        try {
          setResource(volumeSnapshotObj);
        } catch (e) {
          setResource(null);
        }
      })
      .catch((error) => {
        setResource(null);
        throw error;
      });
  }, [props]);
  return (
    <div>
      <div className="co-create-operand__header">
        <div className="co-create-operand__header-buttons">
          <BreadCrumbs
            breadcrumbs={[
              {
                name: PersistentVolumeClaimModel.labelPlural,
                path: `/k8s/ns/${_.get(props, 'match.params.ns')}/persistentvolumeclaims`,
              },
              {
                name: `${_.get(props, 'match.params.appName')}`,
                path: `/k8s/ns/${_.get(props, 'match.params.ns')}/persistentvolumeclaims/${_.get(
                  props,
                  'match.params.appName',
                )}`,
              },
              {
                name: 'Snapshot Details',
                path: ``,
              },
            ]}
          />
        </div>

        <h2 className="co-m-pane__heading co-m-pane__heading--baseline">
          <div className="co-m-pane__name">
            <ResourceIcon kind={VolumeSnapshotModel.kind} /> {_.get(props, 'match.params.name')}
          </div>
        </h2>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text="Snapshot Overview" />
        <div className="row">
          <div className="col-sm-6">
            <dl>
              <dt>Name</dt>
              <dd>{_.get(resource, 'metadata.name')}</dd>
              <dt>Date</dt>
              <dd>{_.get(resource, 'metadata.creationTimestamp')}</dd>
              <dt>Status</dt>
              <dd>{_.get(resource, 'status.readyToUse') ? 'Ready' : 'Not Ready'}</dd>
              <dt>Size</dt>
              <dd>
                {_.get(resource, 'status.restoreSize')
                  ? _.get(resource, 'status.restoreSize')
                  : 'No Data'}
              </dd>
              <dt>Namespace</dt>
              <dd>
                <ResourceLink kind={NamespaceModel.kind}>
                  {_.get(resource, 'metadata.namespace')}
                </ResourceLink>
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
              <dd>{_.get(resource, 'apiVersion')}</dd>
              <dt>Persistent Volume Claim</dt>
              <dd>
                <ResourceLink kind={PersistentVolumeClaimModel.kind}>
                  {_.get(resource, 'spec.source.name')}
                </ResourceLink>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

interface VolumeSnapshotTableRowProps {
  obj: K8sResourceKind;
  index: number;
  key?: string;
  style: object;
}

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
          name={getName(obj)}
          namespace={_.get(obj, 'metadata.namespace')}
          pvc={_.get(obj, 'spec.source.name')}
          details={VolumeSnapshotDetails}
        />
      </TableData>
      <TableData className={snapshotTableColumnClasses[1]}>
        {_.get(obj, 'metadata.creationTimestamp')}
      </TableData>
      <TableData className={snapshotTableColumnClasses[2]}>
        {_.get(obj, 'status.readyToUse') ? 'Ready' : 'Not Ready'}
      </TableData>
      <TableData className={snapshotTableColumnClasses[3]}>
        {_.get(obj, 'status.restoreSize') || 'No Data'}
      </TableData>
      <TableData className={snapshotTableColumnClasses[4]}>None</TableData>
      <TableData className={snapshotTableColumnClasses[5]}>
        <ResourceKebab actions={snapshotMenuActions} kind={volumeSnapshotKind} resource={obj} />
      </TableData>
    </TableRow>
  );
};
VolumeSnapshotTableRow.displayName = 'SnapshotTableRow';

export const VolumeSnapshotList: React.FC = (props) => (
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
        <ResourceIcon kind="VolumeSnapshot" /> {name}
      </Link>
    </span>
  );
};

export const VolumeSnapshotPage = (props) => {
  const namespace = _.get(props, 'pvcObj.metadata.namespace');
  return (
    <ListPage
      {...props}
      canCreate
      kind={volumeSnapshotKind}
      ListComponent={VolumeSnapshotList}
      showTitle={false}
      namespace={namespace}
      createHandler={() => volumeSnapshotModal({ resource: props.pvcObj })}
    />
  );
};
