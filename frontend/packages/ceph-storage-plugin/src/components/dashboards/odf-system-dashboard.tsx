import * as React from 'react';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  DashboardsPageProps,
  mapStateToProps,
} from '@console/internal/components/dashboard/dashboards-page/dashboards';
import { Page, HorizontalNav, LoadingBox, PageHeading } from '@console/internal/components/utils';
// eslint-disable-next-line import/no-named-default
import { default as OCSOverview } from './ocs-system-dashboard';
import { BlockPoolListPage } from '../block-pool/block-pool-list-page';
import { CEPH_STORAGE_NAMESPACE } from '../../constants';

const ODFSystemDashboard: React.FC<DashboardsPageProps> = ({
  kindsInFlight,
  k8sModels,
  ...rest
}) => {
  const { t } = useTranslation();
  const pages: Page[] = [
    {
      path: 'overview/:dashboard',
      href: 'overview/block-file',
      name: t('ceph-storage-plugin~Overview'),
      component: OCSOverview,
    },
    {
      href: 'pools',
      name: t('ceph-storage-plugin~Storage Pools'),
      component: () => <BlockPoolListPage namespace={CEPH_STORAGE_NAMESPACE} />,
      exact: true,
    },
  ];

  const breadcrumbs = [
    {
      name: t('ceph-storage-plugin~Storage systems'),
      path: '/odf/systems',
    },
    {
      name: t('ceph-storage-plugin~Storage system details'),
      path: '',
    },
  ];

  const title = (rest.match.params as any).systemName;

  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname.endsWith('overview')) {
      rest.history.push(`${location.pathname}/block-file`);
    }
  }, [rest.history, location.pathname]);

  return kindsInFlight && k8sModels.size === 0 ? (
    <LoadingBox />
  ) : (
    <>
      <PageHeading title={title} breadcrumbs={breadcrumbs} detail />
      <HorizontalNav match={rest.match} pages={pages} noStatusBox />
    </>
  );
};

export default connect(mapStateToProps)(ODFSystemDashboard);
