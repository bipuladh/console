import * as React from 'react';
import * as _ from 'lodash-es';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';
import { Status } from '@console/shared';
import { DetailsPage, ListPage, Table, TableRow, TableData } from './factory';
import { Kebab, navFactory, ResourceKebab, SectionHeading, ResourceLink, ResourceSummary } from './utils';
import { ResourceEventStream } from './events';
import { NooBaaObjectBucketModel, NooBaaObjectBucketClaimModel } from '@console/noobaa-storage-plugin/src/models';
import { referenceForModel } from '../module/k8s';

const {common} = Kebab.factory;
const kind = referenceForModel(NooBaaObjectBucketModel);

const menuActions = [
  ...common,
];

/*Check yaml to see why I am using this? Will remove when the issue is resolved.*/
const obPhase = ob => {
  let phase = _.get(ob,'status.phase');
  phase = phase ? phase.charAt(0).toUpperCase() + phase.substring(1) : 'Lost';
  return phase;
};

const OBStatus = ({ob}) => {
  const phase = obPhase(ob);
  return <Status status={phase} />;
};

const tableColumnClasses = [
  classNames('col-lg-4', 'col-md-4', 'col-sm-6', 'col-xs-6'),
  classNames('col-lg-3', 'col-md-3', 'col-sm-6', 'hidden-xs'),
  classNames('col-lg-4', 'col-md-4', 'hidden-sm', 'hidden-xs'),
  classNames('col-lg-1', 'col-md-1', 'hidden-sm', 'hidden-xs'),
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
      props: { className: tableColumnClasses[1] },
    },
    {
      title: 'Storage Class', sortField: 'spec.storageClassName', transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: '', props: { className: tableColumnClasses[3] },
    },
  ];
};
OBTableHeader.displayName = 'OBTableHeader';

const OBTableRow = ({obj, index, key, style}) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1])}>
        <OBStatus ob={obj} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        {_.get(obj, 'spec.storageClassName', '-')}
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={obj} />
      </TableData>
    </TableRow>
  );
};
OBTableRow.displayName = 'OBTableRow';

const Details = ({obj}) => {
  const storageClassName = _.get(obj, 'spec.storageClassName');
  const [OBCName, OBCNamespace] = [_.get(obj, 'spec.claimRef.name'), _.get(obj,'spec.claimRef.namespace')];
  return <React.Fragment>
    <div className="co-m-pane__body">
      <SectionHeading text="Objec tBucket Overview" />
      <div className="row">
        <div className="col-sm-6">
          <ResourceSummary resource={obj} />
        </div>
        <div className="col-sm-6">
          <dl>
            <dt>Status</dt>
            <dd>
              <OBStatus ob={obj} />
            </dd>
            <dt>Storage Class</dt>
            <dd>
              {storageClassName ? <ResourceLink kind="StorageClass" name={storageClassName} /> : '-'}
            </dd>
            <dt>Object Bucket Claim</dt>
            <dd><ResourceLink kind={referenceForModel(NooBaaObjectBucketClaimModel)} name={OBCName} namespace={OBCNamespace} /></dd>
          </dl>
        </div>
      </div>
    </div>
  </React.Fragment>;
};


const allPhases = [ 'Pending', 'Bound', 'Lost' ];
const filters = [{
  type:'ob-status',
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
    to: '/k8s/cluster/objectbucket/~new/form',
  };
  return <ListPage {...props} ListComponent={ObjectBucketsList} kind={kind} canCreate={true} createProps={createProps} rowFilters={filters} />;
};
export const ObjectBucketsDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[navFactory.details(Details), navFactory.editYaml(), navFactory.events(ResourceEventStream)]}
/>;
