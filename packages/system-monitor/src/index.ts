import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { JSONObject } from '@lumino/coreutils';

import { ITopBar } from 'jupyterlab-topbar';

import {
  MemoryView,
  ResourceUsage,
  CpuView,
} from 'jupyterlab-system-monitor-base';

import 'jupyterlab-system-monitor-base/style/index.css';

import '../style/index.css';

/**
 * The default refresh rate.
 */
const DEFAULT_REFRESH_RATE = 5000;

/**
 * The default memory label.
 */
const DEFAULT_MEMORY_LABEL = 'Mem: ';

/**
 * The default CPU label.
 */
const DEFAULT_CPU_LABEL = 'CPU: ';

/**
 * An interface for resource settings.
 */
interface IResourceSettings extends JSONObject {
  label: string;
}

/**
 * Initialization data for the jupyterlab-system-monitor extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-system-monitor:plugin',
  autoStart: true,
  requires: [ITopBar],
  optional: [ISettingRegistry],
  activate: async (
    app: JupyterFrontEnd,
    topBar: ITopBar,
    settingRegistry: ISettingRegistry
  ) => {
    let refreshRate = DEFAULT_REFRESH_RATE;
    let cpuLabel = DEFAULT_CPU_LABEL;
    let memoryLabel = DEFAULT_MEMORY_LABEL;

    if (settingRegistry) {
      const settings = await settingRegistry.load(extension.id);
      refreshRate = settings.get('refreshRate').composite as number;
      const cpuSettings = settings.get('cpu').composite as IResourceSettings;
      cpuLabel = cpuSettings.label;
      const memorySettings = settings.get('memory')
        .composite as IResourceSettings;
      memoryLabel = memorySettings.label;
    }

    const model = new ResourceUsage.Model({ refreshRate });
    await model.refresh();
    if (model.cpuAvailable) {
      const cpu = CpuView.createCpuView(model, cpuLabel);
      topBar.addItem('cpu', cpu);
    }
    const memory = MemoryView.createMemoryView(model, memoryLabel);
    topBar.addItem('memory', memory);
  },
};

export default extension;
