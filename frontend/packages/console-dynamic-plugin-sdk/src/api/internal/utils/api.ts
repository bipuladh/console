import {
  PageHeadingProps,
  HorizontalNavProps,
  FieldLevelHelpProps,
  ListPageProps,
  UseMetricDuration,
  DurationType,
} from './types';

const MockImpl = () => {
  throw new Error('Fix your webpack configuration');
};

export const PageHeading: React.FC<PageHeadingProps> = MockImpl;
export const HorizontalNav: React.FC<HorizontalNavProps> = MockImpl;
export const FieldLevelHelp: React.FC<FieldLevelHelpProps> = MockImpl;
export const ListPage: React.FC<ListPageProps> = MockImpl;
export const useMetricDuration: UseMetricDuration = MockImpl;
export const Duration: DurationType = MockImpl;
