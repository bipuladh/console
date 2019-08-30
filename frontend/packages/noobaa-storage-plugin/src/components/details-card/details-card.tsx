import * as React from 'react';
import * as _ from 'lodash';
import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '@console/internal/components/dashboard/dashboard-card';
import { DetailsBody, DetailItem } from '@console/internal/components/dashboard/details-card';
import {
  DashboardItemProps,
  withDashboardResources,
} from '@console/internal/components/dashboards-page/with-dashboard-resources';
import { FirehoseResource } from '@console/internal/components/utils';
import { InfrastructureModel } from '@console/internal/models';
import { referenceForModel, K8sResourceKind } from '@console/internal/module/k8s';
import { CSVModel } from '../../../../ceph-storage-plugin/src/models';
import { OCS_NAMESPACE } from '../../../../ceph-storage-plugin/src/constants/index';
import {
  getInfrastructurePlatform,
  getOCSOperatorVersion,
} from '../../../../ceph-storage-plugin/src/util';

const NOOBAA_SYSTEM_NAME_QUERY = 'NooBaa_system_info';

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

export const ObjectServiceDetailsCard: React.FC<DashboardItemProps> = ({
  watchK8sResource,
  stopWatchK8sResource,
  watchPrometheus,
  stopWatchPrometheusQuery,
  prometheusResults,
  resources,
}) => {
  React.useEffect(() => {
    watchK8sResource(CSVResource);
    watchK8sResource(infrastructureResource);
    watchPrometheus(NOOBAA_SYSTEM_NAME_QUERY);
    return () => {
      stopWatchK8sResource(CSVResource);
      stopWatchK8sResource(infrastructureResource);
      stopWatchPrometheusQuery(NOOBAA_SYSTEM_NAME_QUERY);
    };
  }, [watchK8sResource, stopWatchK8sResource, watchPrometheus, stopWatchPrometheusQuery]);

  const queryResult = prometheusResults.getIn([NOOBAA_SYSTEM_NAME_QUERY, 'result']);

  const systemName = _.get(queryResult, 'data.result[0].metric.system_name');

  const infrastructure = _.get(resources, 'infrastructure');
  const infrastructureLoaded = _.get(infrastructure, 'loaded', false);
  const infrastructureData = _.get(infrastructure, 'data') as K8sResourceKind;

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
            key="system_name"
            title="System Name"
            value={systemName}
            isLoading={!queryResult}
          />
          <DetailItem
            key="provider"
            title="Provider"
            value={getInfrastructurePlatform(infrastructureData)}
            isLoading={!infrastructureLoaded}
          />
          <DetailItem
            key="version"
            title="Version"
            value={ocsOperatorVersion}
            isLoading={!csvLoaded}
          />
        </DetailsBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export const DetailsCard = withDashboardResources(ObjectServiceDetailsCard);
