import * as React from 'react';
import { Helmet } from 'react-helmet';
import { pluginStore, Extension, DynamicPlugin } from '@console/internal/plugins';
import { TableRow, TableData, Table, RowFunction } from '@console/internal/components/factory';
import { Checkbox, Title } from '@patternfly/react-core';
import { sortable } from '@patternfly/react-table';

type UseGetDynamicPlugins = () => [Map<string, DynamicPlugin>, (...args) => void];

const useGetDynamicPlugins: UseGetDynamicPlugins = () => {
  const [plugins, setPlugins] = React.useState(pluginStore.getDynamicPlugins());
  React.useEffect(() => {
    const listener = () => {
      const pluginList = pluginStore.getDynamicPlugins();
      setPlugins(new Map(pluginList));
    };
    pluginStore.subscribe(listener);
  }, [setPlugins]);

  const togglePlugin = React.useCallback(
    (pluginID) =>
      pluginStore.setDynamicPluginEnabled(pluginID, !pluginStore.isDynamicPluginEnabled(pluginID)),
    [],
  );
  return [plugins, togglePlugin];
};

const tableColumnClasses = [
  '', // Name
  '', // Version
  '', // Extensions
  '', // Enabled
];

const Header = () => [
  {
    title: 'Name',
    sortField: 'name',
    transforms: [sortable],
    props: { className: tableColumnClasses[0] },
  },
  {
    title: 'Version',
    sortField: 'version',
    transforms: [sortable],
    props: { className: tableColumnClasses[1] },
  },
  {
    title: 'Extensions',
    props: { className: tableColumnClasses[2] },
  },
  {
    title: 'Enabled',
    props: { className: tableColumnClasses[3] },
  },
];

const Row: RowFunction<RowData, DynamicPluginsTableProps['customData']> = ({
  key,
  obj,
  style,
  index,
  customData,
}) => {
  const { name, enabled, version, extensions, pluginID } = obj || {};
  const { onSelect } = customData;
  return (
    <TableRow id={name} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>{name}</TableData>
      <TableData className={tableColumnClasses[1]}>{version}</TableData>
      <TableData className={tableColumnClasses[2]}>{extensions.length}</TableData>
      <TableData className={tableColumnClasses[3]}>
        <Checkbox isChecked={enabled} onChange={() => onSelect(pluginID)} id={name} />
      </TableData>
    </TableRow>
  );
};

const DynamicPluginsTable: React.FC<DynamicPluginsTableProps> = (props) => (
  <Table {...props} aria-label="Dynamic Plugins Table" Header={Header} Row={Row} />
);

const PluginList: React.FC = () => {
  const [plugins, togglePlugin] = useGetDynamicPlugins();
  const data = Array.from(plugins.keys()).map((key) => {
    const {
      manifest: { name, version, extensions },
      enabled,
    } = plugins.get(key);
    return {
      name,
      version,
      extensions,
      enabled,
      pluginID: key,
    };
  });

  return (
    <>
      <Helmet>
        <title>Console Plugins</title>
      </Helmet>

      <div className="co-m-pane__body">
        <Title headingLevel="h2">UI Plugins</Title>
        <div className="row">
          <div className="col-xs-12">
            <DynamicPluginsTable
              data={data}
              customData={{ onSelect: togglePlugin }}
              reduxID="plugin-table"
              loaded
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PluginList;

type RowData = {
  name: string;
  version: string;
  extensions: Extension[];
  enabled: boolean;
  pluginID: string;
};

type DynamicPluginsTableProps = {
  data: RowData[];
  loaded?: boolean;
  reduxID: string;
  customData: {
    onSelect: (...args) => void;
  };
};
