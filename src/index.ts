import path from 'path';
import fs from 'fs';
//import * as _ from 'lodash';
import { PluginSettings } from './types';
import { LwM2MLib } from '../lib/lwm2m-lib.js';
// lwm2mStart(), lwm2mSubscribe(), lwm2mWrite() 
import { Plugin, ServerAPI } from '@signalk/server-api';

// Create LwM2M configuration from plugin settings
function createLwM2MConfig(settings: PluginSettings): any {
  return {
    // Connection parameters
    endpoint: settings.connectionParams?.endpoint || 'signalk-lwm2m-client',
    listenPort: settings.connectionParams?.listenPort || 56830,
    serverPort: settings.connectionParams?.serverPort || 5683,
    serverHost: settings.connectionParams?.serverHost || 'leshan.eclipseprojects.io',
    useIPv4: settings.connectionParams?.useIPv4 || false,
    request_bootstrap: settings.connectionParams?.request_bootstrap || false,
    maxPackets: settings.connectionParams?.maxPackets || 1152,
    
    // DTLS configuration
    enableDTLS: settings.connectionParams?.dtlsConfig?.enableDTLS || false,
    PSK_Identity: settings.connectionParams?.dtlsConfig?.PSK_Identity || '',
    PSK: settings.connectionParams?.dtlsConfig?.PSK || '',
    
    // Client parameters
    objects_definitions: settings.clientParams?.objects_definitions || 'mapping.json',
    propagate_internal_events: settings.clientParams?.propagate_internal_events || true,
    lazy_start: settings.clientParams?.lazy_start || false,
    bootstrapInterval: settings.clientParams?.bootstrapInterval || 60,
    lifetime: settings.clientParams?.lifetime || 300,
    reconnect: settings.clientParams?.reconnect || 0,
    saveProvisionedConfig: settings.clientParams?.saveProvisionedConfig || true,
    hide_sensitive_device_info: settings.clientParams?.hide_sensitive_device_info || true,
    
    // Logging options
    output_log: settings.loggingOptions?.output_log || false,
    dump_lwm2m_messages: settings.loggingOptions?.dump_lwm2m_messages || false,
  };
}

// Create LwM2M library instance
function createLwM2MLib(config: any): LwM2MLib {
  const lib = new LwM2MLib();
  lib.init(config);
  return lib;
}

const start = (app: ServerAPI): Plugin => {
  let lwm2mLib: LwM2MLib | null = null;

  const plugin: Plugin = {
    id: 'signalk-lwm2m',
    name: 'LwM2M',
    start: async (settings: PluginSettings, restartPlugin) => {
    // Check if client is disabled if not create and start the LwM2M client
    if (settings.clientParams?.disableClient) {
        app.debug('LwM2M client is disabled');
        return;
      }
    try {
        // Convert settings to LwM2M config
        const lwm2mConfig = createLwM2MConfig(settings);
        
        // Log if enabled
        if (lwm2mConfig.output_log) {
          app.debug('LwM2M client starting with config:', lwm2mConfig);
        }

        // Create and start the LwM2M client
        lwm2mLib = createLwM2MLib(lwm2mConfig);
        
        app.debug('LwM2M client started successfully');
      } catch (error) {
        app.error(`Failed to start LwM2M client: ${error}`);
      }
    },
    // Copy /public/settinges.json to /config/settings.json
    // Parse settings.json to mapping.json (lwm2m-client Objects format)

    // subscribe to SignalK paths as defined in mapping.json and update LwM2M resources

    stop: () => {
      if (lwm2mLib) {
        app.debug('Stopping LwM2M client');
        // lwm2mLib.stop();
        lwm2mLib = null;
      }
    },


  // Configuration schema
  schema: () => {
    return {
      type: "object",
      title: "LwM2M Client Configuration",
      properties: {
        // --- Gruppe 1 ---
        connectionParams: {
          type: "object",
          title: "Connection parameters to LwM2M server",
          properties: {
            endpoint: {
              type: "string",
              title: "Endpoint",
              description: "Client endpoint name. Can be overridden when internal event propagation is enabled.",
              default: "signalk-lwm2m-client"
            },
            listenPort: {
              type: "integer",
              title: "Listen Port",
              default: 56830,
            },
            serverPort: {
              type: "integer",
              title: "Server Port",
              default: 5683,
            },
            serverHost: {
              type: "string",
              title: "Server Host",
              default: "leshan.eclipseprojects.io",
            },
            useIPv4: {
              type: "boolean",
              title: "Use IPv4 connection",
              default: true,
            },
            request_bootstrap: {
              type: "boolean",
              title: "Request Bootstrap",
              default: false,
            },
            maxPackets: {
              type: "integer",
              title: "Max Packets",
              default: 1152,
            },
            // --- Untergruppe 1a ---
            dtlsConfig: {
              type: "object",
              title: "Additional values for the LwM2M DTLS config",
              properties: {
                enableDTLS: {
                  type: "boolean",
                  title: "Enable DTLS",
                  default: false,
                },
                PSK_Identity: {
                  type: "string",
                  title: "PSK Identity",
                  default: "",
                },
                PSK: {
                  type: "string",
                  title: "PSK",
                  default: "",
                },
              },
            },
          },
        },

        // --- Gruppe 2 ---
        clientParams: {
          type: "object",
          title: "Parameters for the LwM2M client",
          properties: {
            objects_definitions: {
              type: "string",
              title: "Objects/Instance/resources",
              default: "mapping.json"
            },
            propagate_internal_events: {
              type: "boolean",
              title: "Allow internal event propagation",
              default: true
            },
            lazy_start: {
              type: "boolean",
              title: "Enable Lazy Start",
              default: false,
            },
            bootstrapInterval: {
              type: "integer",
              title: "Bootstrap Interval",
              default: 60,
            },
            lifetime: {
              type: "integer",
              title: "Lifetime",
              default: 300,
            },
            reconnect: {
              type: "integer",
              title: "Reconnect",
              default: 0,
            },
            disableClient: {
              type: "boolean",
              title: "Disable this client",
              default: false,
            },
            saveProvisionedConfig: {
              type: "boolean",
              title: "Save provisioned configuration",
              default: true,
            },
            hide_sensitive_device_info: {
              type: "boolean",
              title: "Hide sensitive device info.",
              default: true,
            },
          },
        },

        // --- Gruppe 3 ---
        loggingOptions: {
          type: "object",
          title: "Logging options",
          properties: {
            output_log: {
              type: "boolean",
              title: "Output LwM2M client logs",
              default: false,
            },
            dump_lwm2m_messages: {
              type: "boolean",
              title: "Dump LwM2M messages",
              default: false,
            },
          },
        },
      },
    };
  },

  // UI-SCHEMA
  uiSchema: () => {
    return {
      connectionParams: {
        "ui:options": {
          collapsible: true,
          collapsed: true,
        },
        dtlsConfig: {
          "ui:options": {
            collapsible: true,
            collapsed: true,
          },
          PSK: {
            "ui:widget": "password",
          },
        },
      },
      clientParams: {
        "ui:options": {
          collapsible: true,
          collapsed: true,
        },
      },
      loggingOptions: {
        "ui:options": {
          collapsible: true,
          collapsed: true,
        },
      },
    };
  },
  };

  return plugin;
};

export default start;