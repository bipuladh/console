import {
  UseK8sWatchResource,
  UseK8sWatchResources,
  UseResolvedExtensions,
  HorizontalNavProps,
} from './api-types';

export * from './api-types';

const MockImpl = () => {
  throw new Error('You need to configure webpack externals to use this function at runtime.');
};

export const useK8sWatchResource: UseK8sWatchResource = MockImpl;
export const useK8sWatchResources: UseK8sWatchResources = MockImpl;
export const useResolvedExtensions: UseResolvedExtensions = MockImpl;
export const HorizontalNav: React.FC<HorizontalNavProps> = MockImpl;
