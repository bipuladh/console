import * as React from 'react';
import * as _ from 'lodash-es';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';

import { Status } from '@console/shared';
import { Conditions } from './conditions';
import { DetailsPage, ListPage, Table, TableRow, TableData } from './factory';
import { Kebab, navFactory, ResourceKebab, SectionHeading, ResourceLink, ResourceSummary, Selector } from './utils';
import { ResourceEventStream } from './events';
import { NooBaaObjectBucketModel } from '@console/noobaa-storage-plugin/src/models';
import { connectToModel } from '../kinds';
import { referenceForModel } from '../module/k8s';

const { common, } = Kebab.factory;
const menuActions = [
  ...common,
];

export const obPhase = ob => {
  let phase = _.get(ob,'status.phase');
  phase = phase ?  phase.charAt(0).toUpperCase() + phase.substring(1) : 'Lost';
  return phase;
}

const OBStatus = ({ob}) => {
  let phase = _.get(ob,'status.phase');
  phase = phase ?  phase.charAt(0).toUpperCase() + phase.substring(1) : 'Lost';
  return <Status status={phase} />;
}

const tableColumnClasses = [
  classNames('col-lg-2', 'col-md-2', 'col-sm-4', 'col-xs-6'),
  classNames('col-lg-2', 'col-md-2', 'col-sm-4', 'col-xs-6'),
  classNames('col-lg-2', 'col-md-2', 'col-sm-4', 'hidden-xs'),
  classNames('col-lg-3', 'col-md-3', 'hidden-sm', 'hidden-xs'),
  classNames('col-lg-3', 'col-md-3', 'hidden-sm', 'hidden-xs'),
  Kebab.columnClass,
];

const OBTableHeader = () => {
  return [
    {
      title: 'Name', sortField: 'metadata.name', transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'Status', sortField: 'status.phase', transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: 'Storage Class', sortField: 'spec.storageClassName', transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: '', props: { className: tableColumnClasses[5] },
    },
  ];
};
OBTableHeader.displayName = 'OBTableHeader';

const kind = referenceForModel(NooBaaObjectBucketModel);

const OBTableRow = ({obj, index, key, style}) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[2])}>
        <OBStatus ob={obj} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        {_.get(obj, 'spec.storageClassName', '-')}
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={obj} />
      </TableData>
    </TableRow>
  );
};

OBTableRow.displayName = 'OBTableRow';

const Details = ({flags, obj}) => {
  const labelSelector = _.get(obj, 'spec.selector');
  const storageClassName = _.get(obj, 'spec.storageClassName');
  return <React.Fragment>
    <div className="co-m-pane__body">
      <SectionHeading text="ObjectBucketClaim Overview" />
      <div className="row">
        <div className="col-sm-6">
          <ResourceSummary resource={obj}>
            <dt>Label Selector</dt>
            <dd><Selector selector={labelSelector} kind="ObjectBucket" /></dd>
          </ResourceSummary>
        </div>
        <div className="col-sm-6">
          <dl>
            <dt>Storage Class</dt>
            <dd>
              {storageClassName ? <ResourceLink kind="StorageClass" name={storageClassName} /> : '-'}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </React.Fragment>;
};


const allPhases = [ 'Pending', 'Bound', 'Lost' ];
const filters = [{
  type: 'ob-status',
  selected: allPhases,
  reducer: obPhase,
  items: _.map(allPhases, phase => ({
    id: phase,
    title: phase,
  })),
}];


export const ObjectBucketsList = props => <Table {...props} aria-label="Object Buckets" Header={OBTableHeader} Row={OBTableRow}
  virtualize />;

export const ObjectBucketsPage = props => {
  const createProps = {
    to: `/k8s/cluster/objectbucket/~new/form`,
  };
  return <ListPage {...props} ListComponent={ObjectBucketsList} kind={kind} canCreate={true} createProps={createProps} rowFilters={filters}/>;
};
export const ObjectBucketsDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[navFactory.details(Details), navFactory.editYaml(), navFactory.events(ResourceEventStream)]}
/>;
