
# SignalK LwM2M Plugin

[![Build and Test](https://github.com/mukulele/signalk-lwm2m/workflows/Build%20and%20Test/badge.svg)](https://github.com/mukulele/signalk-lwm2m/actions)
[![npm version](https://badge.fury.io/js/signalk-lwm2m.svg)](https://www.npmjs.com/package/signalk-lwm2m)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Project Structure

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

## Abstract

A SignalK plugin to map SignalK paths to LwM2M (Lightweight Machine to Machine) objects/instances/resources.

This plugin will open an IPC connection to the wakatiwaiclient binary in ./build.

The included wakatiwaiclient was built for Debian Bookwoorm ARM64. 
Building a wakatiwaiclient for another platform is a separate project curently under development.
(github mukulele/wakatiwai).

A set of LwM2M XML Object definitions is included in directory ./config . 
Delete or add (see https://www.openmobilealliance.org/specifications/registries/objects/) objects to meet your requirements.

Restart SignalK Server and edit the mapping of LwM2M Objects/Instances/Ressources to SignalK Path's.
This can be done with the LwM2M WebUI or manually in the ./config/settings.json file.

In SignalK -> PluginConfig you can edit the connection parameters.
The LwM2M cConnection parameters are defaulting to the eclipse sandbox server.

### My setup:
An IOT Sim Card (e.g. 1NCE 10EUR for a 10 year lifetime)
A CaT-M capable modem (e.g. Waveshare 30EUR SIM7000) 

### Use Case:
Monitor and control your vessel from remote (as long as CAT-M is in reach) at low cost.

## Remarks:
A example set-up of the CAT-M modem on a raspberry is a seperate project.
(under developemt under github/mukulele).

## Plugin Installation:
Please refer to Signalk Doc's ...

# License - see LICENSE file for details.

# Developed for the SignalK Maritime Data Platform!