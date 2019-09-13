import * as React from 'react';
import * as _ from 'lodash-es';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';

import { Status } from '@console/shared';
import { Conditions } from './conditions';
import { DetailsPage, ListPage, Table, TableRow, TableData } from './factory';
import { Kebab, navFactory, ResourceKebab, SectionHeading, ResourceLink, ResourceSummary, Selector } from './utils';
import { ResourceEventStream } from './events';
import { NooBaaObjectBucketClaimModel, NooBaaObjectBucketModel } from '@console/noobaa-storage-plugin/src/models';
import { connectToModel } from '../kinds';
import { referenceForModel } from '../module/k8s';
import { SecretData } from './configmap-and-secret-data';
import { k8sGet } from '../module/k8s/resource';
import { SecretModel } from '../models/index';
import { Base64 } from 'js-base64';

const { common, AttachPod, ConfirmDelete } = Kebab.factory;
common.pop();
const menuActions = [
  AttachPod,
  ...common,
  ConfirmDelete,
  ...Kebab.getExtensionsActionsForKind(NooBaaObjectBucketClaimModel),
];

const obcPhase = obc => {
  let phase = obc.status.Phase;
  phase = phase ? phase.charAt(0).toUpperCase() + phase.substring(1) : undefined;
  return phase;
}

const OBCStatus = ({ obc }) => {
  let phase = obc.status.Phase;
  phase = phase ? phase.charAt(0).toUpperCase() + phase.substring(1) : undefined;
  return <Status status={phase} />;
}

const isBound = obc => obcPhase(obc) == 'Bound' ? true : false

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
      title: 'Status', sortField: 'status.phase', transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: 'Secret', sortField: 'metadata.name', transforms: [sortable],
      props: { className: tableColumnClasses[3] },
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

const kind = referenceForModel(NooBaaObjectBucketClaimModel);

const OBCTableRow = ({ obj, index, key, style }) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[2])}>
        <OBCStatus obc={obj} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[3])}>
        <ResourceLink kind="Secret" name={obj.metadata.name} title={obj.metadata.name} namespace={obj.metadata.namespace} />
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

const Details = ({ flags, obj }) => {

  let secret_data = {
    'BUCKET_NAME': Base64.encode( _.get(obj, 'metadata.name')),
    'ACCESS_KEY': '',
    'SECRET_KEY': '',
    'ENDPOINT': Base64.encode('http://need_data.com'),
  };

  if ( isBound(obj) )
  {
    const secret = k8sGet(SecretModel, _.get(obj, 'metadata.name'), _.get(obj, 'metadata.namespace'));
    secret.then((data) =>{
      secret_data['ACCESS_KEY'] = Base64.encode(_.get(data,'data.AWS_ACCESS_KEY_ID'));
      secret_data['SECRET_KEY'] = Base64.encode(_.get(data,'data.AWS_SECRET_ACCESS_KEY'));
    });
    secret.catch((err) => console.log(err));
  }

  const labelSelector = _.get(obj, 'spec.selector');
  const storageClassName = _.get(obj, 'spec.storageClassName');


  return <React.Fragment>
    <div className="co-m-pane__body">
      <SectionHeading text="ObjectBucketClaim Overview" />
      <div className="row">


        <div className="col-sm-6">
          <ResourceSummary resource={obj}>
          </ResourceSummary>


          <dt>Secret</dt>
          <dd>
            <ResourceLink kind="Secret" name={obj.metadata.name} title={obj.metadata.name} namespace={obj.metadata.namespace} />
          </dd>

        </div>

        <div className="col-sm-6">

          <dt>Object Bucket</dt>
          <dd>
            <ResourceLink kind={referenceForModel(NooBaaObjectBucketModel)} name={obj.spec.bucketName} title={obj.spec.bucketName} />
          </dd>

          <dt>Status</dt>
          <dd>
            <OBCStatus obc={obj} />
          </dd>

        </div>

      </div>
    </div>
    { isBound(obj) &&
        <div className="co-m-pane__body">
          <SecretData title="Object Bucket Claim Data" data={secret_data} />
        </div>
    }
  </React.Fragment>;
};

const allPhases = [ 'Pending', 'Bound', 'Lost' ];
const filters = [{
  type: 'obc-status',
  selected: allPhases,
  reducer: obcPhase,
  items: _.map(allPhases, phase => ({
    id: phase,
    title: phase,
  })),
}];


export const ObjectBucketClaimsList = props => <Table {...props} aria-label="Object Bucket Claims" Header={OBCTableHeader} Row={OBCTableRow}
  virtualize />;

export const ObjectBucketClaimsPage = props => {
  const createProps = {
    to: `/k8s/ns/${props.namespace || 'default'}/objectbucketclaims/~new/form`,
  };
  return <ListPage {...props} ListComponent={ObjectBucketClaimsList} kind={referenceForModel(NooBaaObjectBucketClaimModel)} canCreate={true} createProps={createProps} rowFilters={filters} />;
};
export const ObjectBucketClaimsDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[navFactory.details(Details), navFactory.editYaml(), navFactory.events(ResourceEventStream), navFactory.pods()]}
/>;