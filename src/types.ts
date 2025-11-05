// Plugin settings interface matching the schema
export interface PluginSettings {
  connectionParams: {
    endpoint: string;
    listenPort: number;
    serverPort: number;
    serverHost: string;
    useIPv4: boolean;
    request_bootstrap: boolean;
    maxPackets: number;
    dtlsConfig: {
      enableDTLS: boolean;
      PSK_Identity: string;
      PSK: string;
    };
  };
  clientParams: {
    objects_definitions: string;
    propagate_internal_events: boolean;
    lazy_start: boolean;
    bootstrapInterval: number;
    lifetime: number;
    reconnect: number;
    disableClient: boolean;
    saveProvisionedConfig: boolean;
    hide_sensitive_device_info: boolean;
  };
  loggingOptions: {
    output_log: boolean;
    dump_lwm2m_messages: boolean;
  };
}
