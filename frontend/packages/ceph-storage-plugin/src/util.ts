import { FirehoseResult } from '@console/internal/components/utils/index';
import { K8sResourceKind } from '@console/internal/module/k8s/index';
import * as _ from 'lodash';

export const getOCSOperatorVersion = (resource: {
  [key: string]: FirehoseResult | FirehoseResult<K8sResourceKind>;
}): string => {
  const ocsOperatorPattern = /ocs-operator\..*/;
  const csv = _.get(resource, 'csv');
  const csvData = _.get(csv, 'data');
  let ocsVersion = '';

  if (_.get(csvData, 'items')) {
    const csvList = _.get(csvData, 'items');
    csvList.forEach((entry: {}) => {
      const name = _.get(entry, 'metadata.name');
      if (name && name.match(ocsOperatorPattern)) {
        ocsVersion = name;
      }
    });
  } else {
    const name = _.get(csvData, 'metadata.name');
    if (name && name.match(ocsOperatorPattern)) {
      ocsVersion = name;
    }
  }

  return ocsVersion;
};

export const getInfrastructurePlatform = (infrastructure: K8sResourceKind): string =>
  _.get(infrastructure, 'status.platform');
