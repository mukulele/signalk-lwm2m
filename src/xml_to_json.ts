/**
 * LwM2M XML Processor
 * Reads LwM2M XML specification files and updates settings.json with object definitions
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Settings.json structure to match current format
 */
interface Settings {
  lwm2m: {
    objects: { [objectId: string]: any };
    objectDefinitions: { [objectId: string]: any };
    emptyValue: string;
  };
}

/**
 * Get default value for a resource based on its type
 */
function getDefaultValueForType(type: string, units?: string, rangeEnumeration?: string): any {
  switch (type.toLowerCase()) {
    case 'boolean':
      return false;
    case 'integer':
      // If there's a range, use the minimum value
      if (rangeEnumeration && rangeEnumeration.includes('..')) {
        const [min] = rangeEnumeration.split('..').map(s => parseInt(s.trim()));
        if (!isNaN(min)) return min;
      }
      return 0;
    case 'float':
      // If there's a range, use the minimum value
      if (rangeEnumeration && rangeEnumeration.includes('..')) {
        const [min] = rangeEnumeration.split('..').map(s => parseFloat(s.trim()));
        if (!isNaN(min)) return min;
      }
      return 0.0;
    case 'string':
      // Use units as default if available, otherwise empty string
      return units || "";
    case 'time':
      return 0; // Unix timestamp
    case 'objlnk':
      return "0:0";
    default:
      return null; // For types like execution (E operation)
  }
}

/**
 * Create a full resource object with type, acl, and value (matching current format)
 */
function createResourceObject(resource: LwM2MResource): any {
  const defaultValue = getDefaultValueForType(
    resource.type, 
    resource.units, 
    resource.rangeEnumeration
  );
  
  if (defaultValue === null) {
    // For execution resources, use FUNCTION type
    const functionResult: any = {
      type: "FUNCTION"
    };
    
    // Add description if available
    if (resource.description) {
      functionResult.description = resource.description;
    }
    
    return functionResult;
  }

  // Map LwM2M types to match current format
  let nodeRedType: string;
  switch (resource.type.toLowerCase()) {
    case 'boolean':
      nodeRedType = 'BOOLEAN';
      break;
    case 'integer':
      nodeRedType = 'INTEGER';
      break;
    case 'float':
      nodeRedType = 'FLOAT';
      break;
    case 'string':
      nodeRedType = 'STRING';
      break;
    case 'time':
      nodeRedType = 'INTEGER'; // Time is typically handled as integer timestamp
      break;
    case 'objlnk':
      nodeRedType = 'OBJECT_LINK';
      break;
    default:
      nodeRedType = 'STRING';
  }

  const result: any = {
    type: nodeRedType,
    acl: resource.operations || 'R',
    value: defaultValue
  };

  // Add description if available
  if (resource.description) {
    result.description = resource.description;
  }

  return result;
}

/**
 * Interface for LwM2M resource from XML
 */
interface LwM2MResource {
  id: string;
  name: string;
  type: string;
  mandatory: boolean;
  operations: string;
  units?: string;
  rangeEnumeration?: string;
  description?: string;
}

/**
 * Interface for LwM2M object from XML
 */
interface LwM2MObject {
  objectId: string;
  name: string;
  description: string;
  isSingleton: boolean;
  resources: { [resourceId: string]: LwM2MResource };
}

/**
 * Interface for settings.json structure
 */
interface Settings {
  [key: string]: any;
}





/**
 * Parse a single LwM2M XML file
 */
function parseLwM2MXmlFile(filePath: string): LwM2MObject | null {
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract object ID
    const objectIdMatch = xmlContent.match(/<ObjectID>(\d+)<\/ObjectID>/);
    if (!objectIdMatch) {
      console.warn(`No ObjectID found in ${filePath}`);
      return null;
    }
    const objectId = objectIdMatch[1];

    // Extract object name
    const nameMatch = xmlContent.match(/<Name>([^<]+)<\/Name>/);
    const name = nameMatch ? nameMatch[1] : `Object ${objectId}`;

    // Extract object description
    const descriptionMatch = xmlContent.match(/<Description1>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/Description1>/s);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';

    // Extract MultipleInstances setting
    const multipleInstancesMatch = xmlContent.match(/<MultipleInstances>(Single|Multiple)<\/MultipleInstances>/);
    const isSingleton = multipleInstancesMatch ? multipleInstancesMatch[1] === 'Single' : false;

    // Parse resources
    const resources: { [resourceId: string]: LwM2MResource } = {};
    const resourceMatches = xmlContent.match(/<Item ID="([^"]+)"[\s\S]*?<\/Item>/g);
    
    if (resourceMatches) {
      resourceMatches.forEach((resourceXml: string) => {
        const idMatch = resourceXml.match(/<Item ID="([^"]+)"/);
        const nameMatch = resourceXml.match(/<Name>([^<]+)<\/Name>/);
        const typeMatch = resourceXml.match(/<Type>([^<]*)<\/Type>/);
        const mandatoryMatch = resourceXml.match(/<Mandatory>([^<]+)<\/Mandatory>/);
        const operationsMatch = resourceXml.match(/<Operations>([^<]+)<\/Operations>/);
        const unitsMatch = resourceXml.match(/<Units>([^<]*)<\/Units>/);
        const rangeMatch = resourceXml.match(/<RangeEnumeration>([^<]*)<\/RangeEnumeration>/);
        const descMatch = resourceXml.match(/<Description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/Description>/s);
        
        if (idMatch && nameMatch) {
          const resourceId = idMatch[1];
          const type = typeMatch ? typeMatch[1] : '';
          const units = unitsMatch ? unitsMatch[1] : '';
          const rangeEnumeration = rangeMatch ? rangeMatch[1] : '';
          
          // Only include resources that have a type (exclude execution-only resources)
          if (type && type.trim() !== '') {
            resources[resourceId] = {
              id: resourceId,
              name: nameMatch[1],
              type: type,
              mandatory: mandatoryMatch ? mandatoryMatch[1].toLowerCase() === 'mandatory' : false,
              operations: operationsMatch ? operationsMatch[1] : '',
              units: units || undefined,
              rangeEnumeration: rangeEnumeration || undefined,
              description: descMatch ? descMatch[1] : undefined
            };
          }
        }
      });
    }

    return {
      objectId,
      name,
      description,
      isSingleton,
      resources
    };
    
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Find all LwM2M XML files in the current directory
 */
function findLwM2MXmlFiles(directory: string = '.'): string[] {
  try {
    const files = fs.readdirSync(directory);
    return files.filter(file => 
      file.startsWith('lwm2m-object-') && 
      file.endsWith('.xml')
    ).map(file => path.join(directory, file));
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return [];
  }
}

/**
 * Load settings from settings.json
 */
function loadSettings(settingsPath: string): Settings {
  try {
    if (fs.existsSync(settingsPath)) {
      const content = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(content);
    } else {
      console.log(`Settings file ${settingsPath} not found, creating default structure`);
      return {
        lwm2m: {
          objects: {},
          objectDefinitions: {},
          emptyValue: "auto"
        }
      };
    }
  } catch (error) {
    console.error(`Error loading settings from ${settingsPath}:`, error);
    return {
      lwm2m: {
        objects: {},
        objectDefinitions: {},
        emptyValue: "auto"
      }
    };
  }
}

/**
 * Save settings to settings.json
 */
function saveSettings(settings: Settings, settingsPath: string): void {
  try {
    const jsonContent = JSON.stringify(settings, null, 4);
    fs.writeFileSync(settingsPath, jsonContent, 'utf8');
    console.log(`Settings saved to ${settingsPath}`);
  } catch (error) {
    console.error(`Error saving settings to ${settingsPath}:`, error);
    throw error;
  }
}

/**
 * Write README.md with object information
 */
function writeReadme(xmlFiles: string[], xmlDirectory: string): void {
  let readmeContent = '# LwM2M Objects\n\n';
  
  xmlFiles.forEach(xmlFile => {
    const lwm2mObject = parseLwM2MXmlFile(xmlFile);
    if (lwm2mObject) {
      readmeContent += `## Object ${lwm2mObject.objectId}: ${lwm2mObject.name}\n\n`;
      readmeContent += `${lwm2mObject.description}\n\n`;
    }
  });
  
  const readmePath = path.join(xmlDirectory, 'README.md');
  fs.writeFileSync(readmePath, readmeContent, 'utf8');
}

/**
 * Process all LwM2M XML files and update settings.json (maintaining current format)
 */
export function processLwM2MXmlFiles(
  xmlDirectory: string = '.',
  settingsPath: string = './config/settings.json'
): void {
  console.log('Starting LwM2M XML processing...');
  
  // Find XML files
  const xmlFiles = findLwM2MXmlFiles(xmlDirectory);
  console.log(`Found ${xmlFiles.length} LwM2M XML files`);
  
  if (xmlFiles.length === 0) {
    console.warn('No LwM2M XML files found');
    return;
  }

  // Step 1: Parse XML files and create inventory
  const inventory: { [objectId: string]: LwM2MObject } = {};
  
  xmlFiles.forEach(xmlFile => {
    console.log(`Parsing ${xmlFile}...`);
    const lwm2mObject = parseLwM2MXmlFile(xmlFile);
    if (lwm2mObject) {
      inventory[lwm2mObject.objectId] = lwm2mObject;
      console.log(`Parsed object ${lwm2mObject.objectId} (${lwm2mObject.name}) with ${Object.keys(lwm2mObject.resources).length} resources`);
    }
  });

  // Step 2: Write inventory to lwm2m-object-inventory.json
  const inventoryPath = path.join(xmlDirectory, 'lwm2m-object-inventory.json');
  const publicInventoryPath = path.join(xmlDirectory, '..', 'public', 'lwm2m-object-inventory.json');
  
  try {
    const inventoryContent = JSON.stringify(inventory, null, 2);
    // Write to config directory
    fs.writeFileSync(inventoryPath, inventoryContent, 'utf8');
    console.log(`Written inventory to ${inventoryPath} with ${Object.keys(inventory).length} objects`);
    
    // Also copy to public directory for standalone webapp
    fs.writeFileSync(publicInventoryPath, inventoryContent, 'utf8');
    console.log(`Copied inventory to ${publicInventoryPath} for standalone webapp`);
  } catch (error) {
    console.error(`Error writing inventory to ${inventoryPath}:`, error);
    throw error;
  }

  // Step 3: Load current settings and convert inventory to settings format
  // COMMENTED OUT: CRUD operations on settings.json
  // const settings = loadSettings(settingsPath);
  
  // // Ensure lwm2m structure exists (matching current format)
  // if (!settings.lwm2m) {
  //   settings.lwm2m = {
  //     objects: {},
  //     objectDefinitions: {},
  //     emptyValue: "auto"
  //   };
  // }
  // if (!settings.lwm2m.objects) {
  //   settings.lwm2m.objects = {};
  // }
  // if (!settings.lwm2m.objectDefinitions) {
  //   settings.lwm2m.objectDefinitions = {};
  // }

  let addedCount = 0;
  let updatedCount = 0;

  // Step 4: Convert inventory to settings format
  // COMMENTED OUT: CRUD operations on settings.json
  // Object.values(inventory).forEach(lwm2mObject => {
  //   console.log(`Converting object ${lwm2mObject.objectId} to settings format...`);

  //   const objectId = lwm2mObject.objectId;
    
  //   // Check if object already exists
  //   const objectExists = settings.lwm2m.objects![objectId];
  //   if (objectExists) {
  //     console.log(`Object ${objectId} (${lwm2mObject.name}) already defined, updating...`);
  //   }

  //   // Create object definition matching current format: Object → Instance 0 → Resources
  //   const objectDefinition: { [key: string]: any } = {
  //     "0": {
  //       description: `${lwm2mObject.name} Instance 0`
  //     },
  //     description: lwm2mObject.name,
  //     isSingleton: lwm2mObject.isSingleton
  //   };
    
  //   // Add resources to instance 0
  //   Object.values(lwm2mObject.resources).forEach(resource => {
  //     const resourceObject = createResourceObject(resource);
  //     objectDefinition["0"][resource.id] = resourceObject;
  //   });

  //   // Add to settings if it has any resources
  //   if (Object.keys(objectDefinition["0"]).length > 1) { // More than just description
  //     settings.lwm2m.objects![objectId] = objectDefinition;
      
  //     if (objectExists) {
  //       console.log(`Updated object ${objectId} (${lwm2mObject.name}) with ${Object.keys(objectDefinition["0"]).length - 1} resources`);
  //       updatedCount++;
  //     } else {
  //       console.log(`Added object ${objectId} (${lwm2mObject.name}) with ${Object.keys(objectDefinition["0"]).length - 1} resources`);
  //       addedCount++;
  //     }
  //   } else {
  //     console.log(`Object ${objectId} (${lwm2mObject.name}) has no resources with default values`);
  //   }
  // });

  // Save updated settings (maintaining current format)
  // COMMENTED OUT: CRUD operations on settings.json
  // saveSettings(settings, settingsPath);
  
  // // Also copy settings.json to public directory for standalone webapp
  // const publicSettingsPath = path.join(xmlDirectory, '..', 'public', 'settings.json');
  // try {
  //   const settingsContent = JSON.stringify(settings, null, 4);
  //   fs.writeFileSync(publicSettingsPath, settingsContent, 'utf8');
  //   console.log(`Copied settings to ${publicSettingsPath} for standalone webapp`);
  // } catch (error) {
  //   console.error(`Error copying settings to public directory:`, error);
  // }
  
  // Write README.md with object information
  writeReadme(xmlFiles, xmlDirectory);
  
  console.log(`\nProcessing complete:`);
  console.log(`- Inventory created with ${Object.keys(inventory).length} objects from XML files`);
  // COMMENTED OUT: Settings.json operations disabled
  // console.log(`- Added: ${addedCount} objects`);
  // console.log(`- Updated: ${updatedCount} objects`);
  // console.log(`- Total objects: ${Object.keys(settings.lwm2m.objects!).length}`);
}

/**
 * Get information about a specific LwM2M object from XML
 */
export function getLwM2MObjectInfo(objectId: string, xmlDirectory: string = '.'): LwM2MObject | null {
  const xmlFile = path.join(xmlDirectory, `lwm2m-object-${objectId}.xml`);
  if (!fs.existsSync(xmlFile)) {
    return null;
  }
  return parseLwM2MXmlFile(xmlFile);
}

/**
 * Load LwM2M objects from inventory file
 */
export function loadLwM2MInventory(inventoryPath: string): { [objectId: string]: LwM2MObject } {
  try {
    if (fs.existsSync(inventoryPath)) {
      const content = fs.readFileSync(inventoryPath, 'utf8');
      return JSON.parse(content);
    } else {
      console.log(`Inventory file ${inventoryPath} not found`);
      return {};
    }
  } catch (error) {
    console.error(`Error loading inventory from ${inventoryPath}:`, error);
    return {};
  }
}

/**
 * List all available LwM2M objects from XML files
 */
export function listAvailableLwM2MObjects(xmlDirectory: string = '.'): string[] {
  const xmlFiles = findLwM2MXmlFiles(xmlDirectory);
  return xmlFiles.map(file => {
    const match = file.match(/lwm2m-object-(\d+)\.xml$/);
    return match ? match[1] : null;
  }).filter(id => id !== null) as string[];
}





