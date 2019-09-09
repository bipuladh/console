import * as React from 'react';
import * as _ from 'lodash-es';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';

import { Status } from '@console/shared';
import { Conditions } from './conditions';
import { DetailsPage, ListPage, Table, TableRow, TableData } from './factory';
import { Kebab, navFactory, ResourceKebab, SectionHeading, ResourceLink, ResourceSummary, Selector } from './utils';
import { ResourceEventStream } from './events';
import { NooBaaObjectBucketClaimModel } from '@console/noobaa-storage-plugin/src/models';
import { connectToModel } from '../kinds';
import { referenceForModel } from '../module/k8s';

const { common, } = Kebab.factory;
const menuActions = [
  ...common,
];


const tableColumnClasses = [
  classNames('col-lg-2', 'col-md-2', 'col-sm-4', 'col-xs-6'),
  classNames('col-lg-2', 'col-md-2', 'col-sm-4', 'col-xs-6'),
  classNames('col-lg-2', 'col-md-2', 'col-sm-4', 'hidden-xs'),
  classNames('col-lg-3', 'col-md-3', 'hidden-sm', 'hidden-xs'),
  classNames('col-lg-3', 'col-md-3', 'hidden-sm', 'hidden-xs'),
  Kebab.columnClass,
];

const OBCTableHeader = () => {
  return [
    {
      title: 'Name', sortField: 'metadata.name', transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'Namespace', sortField: 'metadata.namespace', transforms: [sortable],
      props: { className: tableColumnClasses[1] },
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
OBCTableHeader.displayName = 'OBCTableHeader';

const kind = 'ObjectBucketClaim';

const OBCTableRow = ({obj, index, key, style}) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
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
OBCTableRow.displayName = 'OBCTableRow';

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


export const ObjectBucketClaimsList = props => <Table {...props} aria-label="Object Bucket Claims" Header={OBCTableHeader} Row={OBCTableRow}
  virtualize />;

export const ObjectBucketClaimsPage: React.SFC<> = props => {
  const createProps = {
    to: `/objectbucket.io/v1alpha1/ns/${props.namespace || 'default'}/objectbucketclaims/~new/form`,
  };
  return <ListPage {...props} ListComponent={ObjectBucketClaimsList} kind={referenceForModel(NooBaaObjectBucketClaimModel)}/>;
};
export const ObjectBucketClaimsDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[navFactory.details(Details), navFactory.editYaml(), navFactory.events(ResourceEventStream)]}
/>;
