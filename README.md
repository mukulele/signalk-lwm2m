# SignalK LwM2M Plugin

[![Build and Test](https://github.com/mukulele/signalk-lwm2m/workflows/Build%20and%20Test/badge.svg)](https://github.com/mukulele/signalk-lwm2m/actions)
[![npm version](https://badge.fury.io/js/signalk-lwm2m.svg)](https://www.npmjs.com/package/signalk-lwm2m)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Version 0.0.1-alpha.1**

A SignalK plugin to map SignalK paths to LwM2M (Lightweight M2M) objects/instances/resources.
This plugin works directly with the LwM2M protocol using the integrated Wakatiwai client binary.

## Overview

This plugin provides:
- **LwM2M Client Integration**: Complete LwM2M client functionality with Wakatiwai binary
- **Local Web Interface**: Works directly in browser without server dependencies
- **XML to JSON Conversion**: Automatic processing of LwM2M XML definitions (https://www.openmobilealliance.org/specifications/registries/objects/) 
- **SignalK Path Mapping**: Map SignalK paths to LwM2M resources via WebUI or manually in settings.json

## Installation
- **Please refer to Signalk**

## Configuration

### Mapping configuration through the SignalK web interface:

1. Navigate to **Server → Plugin Config**
2. Find **LwM2M Objects** in the plugin list
3. Configure connection parameters, client settings, and logging options
4. Enable the plugin

### LwM2M Client/Server Configuration
SignalK -> PluginConfig
defaulting to eclipse server sandbox

- **Connection Parameters**: LwM2M server host, ports, IPv4/IPv6 settings
- **DTLS Security**: PSK identity and keys for secure connections  
- **Client Parameters**: Endpoint name, lifetime, bootstrap settings
- **Logging Options**: Debug output and message dumping

## Development

### Project Structure

```
signalk-lwm2m-objects/
├── src/                          # TypeScript source code
│   ├── index.ts                  # Main plugin (LwM2M client only)
│   ├── types.ts                  # TypeScript definitions
│   └── xml_to_json.ts           # XML Parser
├── lib/                          # JavaScript Libraries
│   ├── lwm2m-common.js          # LwM2M Client Wrapper
│   └── ROADMAP.md               # Node-API Roadmap
├── config/                       # Configuration files
│   ├── settings.json            # LwM2M Objects + SignalK Mapping
│   ├── lwm2m-defaults.json      # Server Configuration
│   └── *.xml                    # LwM2M XML-Definitions
├── public/                       # Web Interface
│   └── index-local.html         # Local Interface (NO SERVER)
└── build/                        # Binary files
    └── wakatiwaiclient          # LwM2M Client Binary
```
## License

MIT License - see LICENSE file for details.

---

**Developed for the SignalK Maritime Data Platform**