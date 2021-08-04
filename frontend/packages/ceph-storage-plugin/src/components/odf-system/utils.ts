import * as _ from 'lodash';
import {
  HumanizeResult,
  humanizeBinaryBytes,
  humanizeDecimalBytesPerSec,
} from '@console/internal/components/utils';
import { PrometheusResponse } from '@console/internal/module/k8s';
import { StorageSystemKind } from '../../types';
import {
  humanizeIOPS,
  humanizeLatency,
} from '../dashboards/persistent-internal/utilization-card/utils';

// Operator uses`<kind>.<apiGroup>/<apiVersion>`
export const getGVK = (label: string) => {
  const kind = label.slice(0, label.indexOf('.'));
  const apiGroup = label.slice(label.indexOf('.') + 1, label.indexOf('/'));
  const apiVersion = label.slice(label.indexOf('/') + 1, label.length);
  return { kind, apiGroup, apiVersion };
};

export type SystemMetrics = {
  [systeName: string]: {
    rawCapacity: HumanizeResult;
    usedCapacity: HumanizeResult;
    iops: HumanizeResult;
    throughput: HumanizeResult;
    latency: HumanizeResult;
  };
};

type MetricNormalize = (
  systems: StorageSystemKind[],
  latency: PrometheusResponse,
  throughput: PrometheusResponse,
  rawCapacity: PrometheusResponse,
  usedCapacity: PrometheusResponse,
  iops: PrometheusResponse,
) => SystemMetrics['metrics'];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const normalizeMetrics: MetricNormalize = (
  systems,
  latency,
  throughput,
  rawCapacity,
  usedCapacity,
  iops,
) => {
  if (
    _.isEmpty(systems) ||
    !systems ||
    !latency ||
    !throughput ||
    !rawCapacity ||
    !usedCapacity ||
    !iops
  ) {
    return {
      metrics: {} as any,
    };
  }
  return systems.reduce((acc, curr) => {
    acc[curr.metadata.name] = {
      rawCapacity: humanizeBinaryBytes(
        rawCapacity.data.result.find((item) => item?.metric?.managedBy === curr.spec.name)
          ?.value?.[1],
      ).string,
      usedCapacity: humanizeBinaryBytes(
        usedCapacity.data.result.find((item) => item?.metric?.managedBy === curr.spec.name)
          ?.value?.[1],
      ).string,
      iops: humanizeIOPS(
        iops.data.result.find((item) => item?.metric?.managedBy === curr.spec.name)?.value?.[1],
      ).string,
      throughput: humanizeDecimalBytesPerSec(
        throughput.data.result.find((item) => item?.metric?.managedBy === curr.spec.name)
          ?.value?.[1],
      ).string,
      latency: humanizeLatency(
        latency.data.result.find((item) => item?.metric?.managedBy === curr.spec.name)?.value?.[1],
      ).string,
    };
    return acc;
  }, {} as any);
};
