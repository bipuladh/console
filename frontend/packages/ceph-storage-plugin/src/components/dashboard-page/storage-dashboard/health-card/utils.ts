import * as _ from 'lodash';
import { HealthState } from '@console/internal/components/dashboard/health-card/states';
import { CEPH_HEALTHY, CEPH_DEGRADED, CEPH_ERROR, CEPH_UNKNOWN } from '../../../../constants';
import { getName } from '@console/shared/src/selectors/common';

const CephHealthStatus = [
  {
    message: CEPH_HEALTHY,
    state: HealthState.OK,
  },
  {
    message: CEPH_DEGRADED,
    state: HealthState.WARNING,
  },
  {
    message: CEPH_ERROR,
    state: HealthState.ERROR,
  },
  {
    message: CEPH_UNKNOWN,
    state: HealthState.ERROR,
  },
];

export const getCephHealthState = (ocsResponse): CephHealth => {
  if (!ocsResponse) {
    return { state: HealthState.LOADING };
  }
  const value = _.get(ocsResponse, 'data.result[0].value[1]');
  return CephHealthStatus[value] || CephHealthStatus[3];
};

export const processCephHealthState = (cephHealthState, cephClusterData) : CephHealth =>{
  const cephClusterName =getName(_.get(cephClusterData, 0));
  if (cephHealthState.state == HealthState.LOADING) {
    return cephHealthState;
  }
  else if (!cephClusterName){
    cephHealthState.message = "Openshift Storage "+cephHealthState.message;
    return cephHealthState;
  }
  cephHealthState.message = cephClusterName+" "+cephHealthState.message;
  return cephHealthState;
}; 


type CephHealth = {
  state: HealthState;
  message?: string;
};
