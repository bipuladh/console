import * as React from 'react';
import * as _ from 'lodash';
import { DashboardCard } from '@console/internal/components/dashboard/dashboard-card/card';
import { DashboardCardBody } from '@console/internal/components/dashboard/dashboard-card/card-body';
import { DashboardCardHeader } from '@console/internal/components/dashboard/dashboard-card/card-header';
import { DashboardCardTitle } from '@console/internal/components/dashboard/dashboard-card/card-title';
import { DetailItem } from '@console/internal/components/dashboard/details-card/detail-item';
import {
  DashboardItemProps,
  withDashboardResources,
} from '@console/internal/components/dashboards-page/with-dashboard-resources';
import { DetailsBody } from '@console/internal/components/dashboard/details-card/details-body';
import { FirehoseResource } from '@console/internal/components/utils/index';
import { InfrastructureModel } from '@console/internal/models/index';
import { K8sResourceKind } from '@console/internal/module/k8s/index';
import { getName } from '@console/shared/src/selectors/common';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import {
  CephClusterModel,
  CSVModel,
} from '../../../models';
import {
  CEPH_STORAGE_NAMESPACE,
  OCS_NAMESPACE,
} from '../../../constants/index';
import {getOCSOperatorVersion,
  getInfrastructurePlatform,
} from '../../../util';

const CSVResource: FirehoseResource = {
  kind: referenceForModel(CSVModel),
  namespaced: true,
  namespace: OCS_NAMESPACE,
  prop: 'csv',
};

const infrastructureResource: FirehoseResource = {
  kind: referenceForModel(InfrastructureModel),
  namespaced: false,
  name: 'cluster',
  isList: false,
  prop: 'infrastructure',
};

const cephClusterResource: FirehoseResource = {
  kind: referenceForModel(CephClusterModel),
  namespaced: true,
  namespace: CEPH_STORAGE_NAMESPACE,
  isList: true,
  prop: 'ceph',
};

const DetailsCard: React.FC<DashboardItemProps> = ({
  watchK8sResource,
  stopWatchK8sResource,
  resources,
}) => {
  React.useEffect(() => {
    watchK8sResource(cephClusterResource);
    watchK8sResource(infrastructureResource);
    watchK8sResource(CSVResource);
    return () => {
      stopWatchK8sResource(cephClusterResource);
      stopWatchK8sResource(infrastructureResource);
      stopWatchK8sResource(CSVResource);
    };
  }, [watchK8sResource, stopWatchK8sResource]);

  const infrastructure = _.get(resources, 'infrastructure');
  const infrastructureLoaded = _.get(infrastructure, 'loaded', false);
  const infrastructureData = _.get(infrastructure, 'data') as K8sResourceKind;

  const cephCluster = _.get(resources, 'ceph');
  const cephClusterLoaded = _.get(cephCluster, 'loaded', false);
  const cephClusterData = _.get(cephCluster, 'data') as K8sResourceKind[];

  const csv = _.get(resources, 'csv');
  const csvLoaded = _.get(csv, 'loaded', false);
  const ocsOperatorVersion = getOCSOperatorVersion(resources);

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Details</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <DetailsBody>
          <DetailItem
            key="service_name"
            title="Service Name"
            value="OpenShift Container Storage"
            isLoading={false}
          />
          <DetailItem
            key="cluster_name"
            title="Cluster Name"
            value={getName(_.get(cephClusterData, 0))}
            isLoading={!cephClusterLoaded}
          />
          <DetailItem
            key="provider"
            title="Provider"
            value={getInfrastructurePlatform(infrastructureData)}
            isLoading={!infrastructureLoaded}
          />
          <DetailItem
            key="version"
            title="OCS Version"
            value={ocsOperatorVersion}
            isLoading={!csvLoaded}
          />
        </DetailsBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export default withDashboardResources(DetailsCard);
