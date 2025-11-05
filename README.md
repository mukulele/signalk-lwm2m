# SignalK LwM2M Plugin

[![Build and Test](https://github.com/mukulele/signalk-lwm2m/workflows/Build%20and%20Test/badge.svg)](https://github.com/mukulele/signalk-lwm2m/actions)
[![npm version](https://badge.fury.io/js/signalk-lwm2m.svg)](https://www.npmjs.com/package/signalk-lwm2m)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Version 0.0.1-alpha.1**

A SignalK plugin for managing LwM2M (Lightweight M2M) objects with integrated web interface.

**LwM2M Protocol Integration** - This plugin works directly with the LwM2M protocol using the integrated Wakatiwai client binary.

**Local Web Interface** - The web interface runs completely locally in the browser without server dependencies.

## Overview

This plugin provides:
- **🌐 LwM2M Client Integration**: Complete LwM2M client functionality with Wakatiwai binary
- **📱 Local Web Interface**: Works directly in browser without server dependencies
- **🔄 XML to JSON Conversion**: Automatic processing of LwM2M XML definitions  
- **🎯 SignalK Path Mapping**: Configuration of SignalK paths for LwM2M resources
- **📂 File-based Configuration**: Easy loading and saving of JSON configurations
- **📊 Object Management**: Add instances, manage resources, assign paths
- **⚡ ES Module Support**: Modern JavaScript module system with TypeScript support

## Installation

### From npm (when published)
```bash
npm install signalk-lwm2m
```

### From GitHub
```bash
npm install https://github.com/mukulele/signalk-lwm2m.git
```

### Manual Installation
1. Clone the repository:
```bash
git clone https://github.com/mukulele/signalk-lwm2m.git
cd signalk-lwm2m
```

2. Install dependencies and build:
```bash
npm install
npm run build
```

3. Install as SignalK plugin (copy to SignalK plugin directory)

## Configuration

The plugin can be configured through the SignalK web interface:

1. Navigate to **Server → Plugin Config**
2. Find **LwM2M Objects** in the plugin list
3. Configure connection parameters, client settings, and logging options
4. Enable the plugin

### Configuration Options

- **Connection Parameters**: LwM2M server host, ports, IPv4/IPv6 settings
- **DTLS Security**: PSK identity and keys for secure connections  
- **Client Parameters**: Endpoint name, lifetime, bootstrap settings
- **Logging Options**: Debug output and message dumping

## Usage

Once configured and enabled, the plugin:

1. **Starts LwM2M Client**: Connects to configured LwM2M server using Wakatiwai binary
2. **Provides Web Interface**: Access at `http://your-signalk-server:3000/plugins/signalk-lwm2m/`
3. **Maps SignalK Paths**: Configure which LwM2M resources map to SignalK data paths
4. **Processes XML Objects**: Automatically converts LwM2M XML definitions to JSON

## Development

### Plugin Installation
```bash
cd ~/.signalk
npm install signalk-lwm2m-objects
sudo systemctl restart signalk
```

### Web Interface Nutzung
Das Web Interface funktioniert **komplett lokal** ohne Server:

1. **Direkt im Browser öffnen**:
   ```
   file://~/.signalk/node_modules/signalk-lwm2m-objects/public/index-local.html
   ```

2. **Konfigurationsdateien hochladen**:
   - `settings.json` - LwM2M Objektdefinitionen
   - `lwm2m-defaults.json` - Server-Konfiguration (optional)

3. **Oder Beispieldaten verwenden** zum sofortigen Testen

## Web Interface Funktionen

### 1. Konfigurationsdateien laden
- **File Upload**: Einfach JSON-Dateien per Dateiauswahl hochladen
- **Beispieldaten**: Integrierte Beispiele zum sofortigen Testen
- **Drag & Drop**: Dateien direkt in den Browser ziehen

### 2. LwM2M Objekte verwalten
- **Objekt-Übersicht**: Alle definierten LwM2M-Objekte anzeigen
- **Instanz-Verwaltung**: Neue Instanzen für Multi-Instanz-Objekte erstellen
- **Resource-Bearbeitung**: Ressourcen-Details anzeigen und bearbeiten

### 3. SignalK Path Mapping
- **Path-Konfiguration**: SignalK-Pfade für LwM2M-Ressourcen festlegen
- **Beispiel-Pfade**: Vorgenerierte Pfade für gängige Objekte
- **Automatische Vorschläge**: Intelligente Pfad-Vorschläge basierend auf Objekt-Typ

### 4. LwM2M Server Konfiguration
- **Verbindungseinstellungen**: Server Host, Port, Endpoint-Name
- **Sicherheit**: DTLS, Pre-Shared Keys, Client Identity
- **Erweiterte Optionen**: Lifetime, Binding Mode, Bootstrap-Einstellungen

### 5. Daten speichern
- **Download-Funktion**: Geänderte Konfigurationen als JSON herunterladen
- **Browser-nativ**: Verwendet Standard-Download-Funktionalität
- **Einfache Integration**: Downloads zurück in das `/config` Verzeichnis kopieren

## Dateien und Konfiguration

### Wichtige Dateien

1. **`config/settings.json`**: LwM2M Objektdefinitionen mit SignalK-Mappings
2. **`config/lwm2m-defaults.json`**: LwM2M Server-Verbindungseinstellungen
3. **`public/index-local.html`**: Lokales Web Interface (keine Server-Abhängigkeiten)
4. **`config/*.xml`**: LwM2M XML-Definitionen (werden automatisch konvertiert)

### Workflow für Konfigurationsänderungen

1. **Web Interface öffnen**: `index-local.html` direkt im Browser
2. **Dateien laden**: Aktuelle `settings.json` und `lwm2m-defaults.json` hochladen
3. **Bearbeiten**: Objekte verwalten, SignalK-Pfade konfigurieren
4. **Speichern**: Geänderte Dateien herunterladen
5. **Deployment**: Downloads in das `/config` Verzeichnis kopieren
6. **Neustart**: SignalK Plugin neu starten für Übernahme der Änderungen

## SignalK Path Beispiele

### Standard Maritime Pfade

- **GPS Position**: `navigation.position.latitude`, `navigation.position.longitude`
- **Batterie**: `electrical.batteries.house.voltage`, `electrical.batteries.house.current`
- **Temperatur**: `environment.inside.temperature`, `environment.outside.temperature`
- **Druck**: `environment.inside.pressure`, `environment.outside.pressure`

### LwM2M Objekt-Mappings

| LwM2M Objekt | Resource | SignalK Path | Beschreibung |
|-------------|----------|--------------|-------------|
| 3 (Device) | 0 | `design.manufacturer` | Hersteller |
| 3 (Device) | 1 | `design.model` | Modell |
| 6 (Location) | 0 | `navigation.position.latitude` | GPS Breite |
| 6 (Location) | 1 | `navigation.position.longitude` | GPS Länge |
| 3303 (Temperature) | 5700 | `environment.inside.temperature` | Innentemperatur |
| 3316 (Voltage) | 5700 | `electrical.batteries.house.voltage` | Batteriespannung |
| 3317 (Current) | 5700 | `electrical.batteries.house.current` | Batteriestrom |

## LwM2M Client Konfiguration

### Grundeinstellungen

```json
{
  "enabled": true,
  "endpoint": "signalk-lwm2m-client",
  "serverHost": "localhost",
  "serverPort": 5683,
  "enableDTLS": false,
  "lifetime": 300
}
```

### Security Modi

- **NoSec (3)**: Keine Verschlüsselung (Standard für Tests)
- **PSK (0)**: Pre-Shared Key Verschlüsselung
- **Certificate (2)**: Zertifikat-basierte Verschlüsselung

### Binding Modi

- **UDP (U)**: Standard UDP-Verbindung
- **UDP Queue (UQ)**: UDP mit Nachrichten-Queue
- **SMS (S)**: SMS-Transport (selten verwendet)

## Entwicklung

### Projekt-Struktur

```
signalk-lwm2m-objects/
├── src/                          # TypeScript Quellcode
│   ├── index.ts                  # Haupt Plugin (nur LwM2M Client)
│   ├── types.ts                  # TypeScript Definitionen
│   └── xml_to_json.ts           # XML Parser
├── lib/                          # JavaScript Libraries
│   ├── lwm2m-common.js          # LwM2M Client Wrapper
│   └── ROADMAP.md               # Node-API Roadmap
├── config/                       # Konfigurationsdateien
│   ├── settings.json            # LwM2M Objekte + SignalK Mapping
│   ├── lwm2m-defaults.json      # Server-Konfiguration
│   └── *.xml                    # LwM2M XML-Definitionen
├── public/                       # Web Interface
│   └── index-local.html         # Lokales Interface (KEIN SERVER)
└── build/                        # Binärdateien
    └── wakatiwaiclient          # LwM2M Client Binary
```

### TypeScript Kompilierung

```bash
cd ~/.signalk/node_modules/signalk-lwm2m-objects
npm run build
```

### Lokale Entwicklung

1. **Plugin entwickeln**:
   ```bash
   cd ~/.signalk/node_modules/signalk-lwm2m-objects
   npm run build
   ```

2. **Web Interface testen**:
   ```bash
   # Einfach die HTML-Datei öffnen - kein Server erforderlich!
   firefox public/index-local.html
   # oder
   google-chrome public/index-local.html
   ```

## Migration von MQTT zu LwM2M

Das Plugin wurde vollständig von MQTT auf LwM2M migriert:

- **✅ Vorher**: MQTT Export mit Broker-Abhängigkeit + HTTP-Server für Web Interface
- **✅ Nachher**: LwM2M Client mit direkter Protokoll-Unterstützung + lokales Web Interface
- **🚀 Roadmap**: Zukünftige Node-API Integration geplant (siehe `/lib/ROADMAP.md`)

### Vorteile der neuen Architektur

- **Keine Server-Abhängigkeiten**: Web Interface funktioniert komplett lokal
- **Einfachere Wartung**: Weniger Code, weniger Komplexität
- **Bessere Performance**: Direktes LwM2M-Protokoll statt MQTT-Umweg
- **Standardkonform**: OMA LwM2M Standard für IoT-Geräte
- **Maritime Integration**: Passend für maritime SignalK-Umgebung

## Fehlerbehebung

### Web Interface lädt nicht
- **Browser-Kompatibilität**: Moderne Browser erforderlich (Chrome, Firefox, Safari)
- **JavaScript-Fehler**: Browser-Konsole auf Fehlermeldungen prüfen
- **Dateipfade**: HTML-Datei direkt öffnen, nicht über http://

### LwM2M Verbindung fehlgeschlagen
- **Server erreichbar**: Ping/Telnet zu LwM2M Server testen
- **Port korrekt**: Standard 5683 (CoAP) oder 5684 (CoAP/DTLS)
- **Firewall**: Prüfen Sie Firewall-Regeln für ausgehende Verbindungen
- **Logs prüfen**: SignalK Debug-Ausgabe aktivieren

### Konfiguration wird nicht übernommen
- **Plugin Neustart**: SignalK Plugin nach Konfigurationsänderungen neu starten
- **Datei-Permissions**: Schreibrechte für `/config` Verzeichnis prüfen
- **JSON Format**: Syntax-Validierung der JSON-Dateien
- **Pfade prüfen**: Relative vs. absolute Pfade in Konfiguration

## Support und Beiträge

- **GitHub Issues**: Für Bugs und Feature-Requests  
- **SignalK Forum**: Für allgemeine Fragen zur Integration
- **Documentation**: Siehe `/lib/ROADMAP.md` für zukünftige Entwicklungen

## Lizenz

MIT License - siehe LICENSE Datei für Details.

---

**Entwickelt für die SignalK Maritime Datenplattform**