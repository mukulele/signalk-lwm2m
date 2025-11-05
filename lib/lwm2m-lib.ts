/**
 * LwM2M Library - Extracted from Node-RED nodes for SignalK integration
 * Provides lwm2m client in/out functionality without Node-RED dependency
 */

// Import using ES modules
import {
  ResourceRepositoryBuilder,
  LwM2MClientProxy,
  LwM2MObjectStore
} from './lwm2m-common.js';

// State management for LwM2M client
export interface LwM2MState {
  client: any | null;
  objectStore: any | null;
  isConnected: boolean;
}

// LwM2M Client In functionality (reading/subscribing)
export class LwM2MClientIn {
  private state: LwM2MState;

  constructor(state: LwM2MState) {
    this.state = state;
  }

  /**
   * Read LwM2M object data
   * @param topic - Object path (e.g., "/3303/0/5700")
   * @param outputAsObject - Return as object instead of array
   */
  async read(topic: string, outputAsObject: boolean = false): Promise<any> {
    if (!this.state.objectStore) {
      throw new Error('LwM2M Object Store not initialized');
    }

    try {
      const result = await this.state.objectStore.get(topic);
      
      if (outputAsObject) {
        return result.reduce((acc: any, curr: any) => {
          acc[curr.uri] = curr.value;
          return acc;
        }, {});
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to read LwM2M object ${topic}: ${(error as Error).message}`);
    }
  }

  /**
   * Start LwM2M client (for lazy start mode)
   */
  start(): void {
    if (!this.state.client) {
      throw new Error('LwM2M Client not initialized');
    }
    this.state.client.start();
  }

  /**
   * Stop LwM2M client
   */
  stop(): void {
    if (!this.state.client) {
      throw new Error('LwM2M Client not initialized');
    }
    this.state.client.shutdown({ deregister: false });
  }

  /**
   * Deregister LwM2M client
   */
  deregister(): void {
    if (!this.state.client) {
      throw new Error('LwM2M Client not initialized');
    }
    this.state.client.shutdown({ deregister: true });
  }

  /**
   * Subscribe to object events
   * @param callback - Event handler function
   */
  subscribeObjectEvents(callback: (event: any) => void): void {
    if (!this.state.client) {
      throw new Error('LwM2M Client not initialized');
    }
    this.state.client.on('object-event', callback);
  }

  /**
   * Handle input messages like Node-RED implementation
   * @param msg - Message with topic and payload
   * @param subscribeObjectEvents - Whether to subscribe to events or handle manual reads
   * @param outputAsObject - Return as object instead of array
   * @returns Promise with result or undefined for control commands
   */
  async handleInput(msg: any, subscribeObjectEvents: boolean = false, outputAsObject: boolean = false): Promise<any> {
    if (!msg) {
      return;
    }

    // Handle control commands
    if (msg.topic) {
      const control = msg.topic.toLowerCase();
      switch (control) {
        case 'start': {
          // Only start if not in subscription mode or client supports lazy start
          if (!subscribeObjectEvents && this.state.client) {
            this.state.client.start();
          }
          return;
        }
        case 'stop': {
          this.stop();
          return;
        }
        case 'deregister': {
          this.deregister();
          return;
        }
      }
    }

    // Handle read operations (only in manual mode)
    if (!subscribeObjectEvents && msg.topic && this.state.objectStore) {
      try {
        const result = await this.state.objectStore.get(msg.topic);
        
        const useObjectOutput = typeof msg.outputAsObject === 'undefined' ? outputAsObject : !!msg.outputAsObject;
        
        if (useObjectOutput) {
          return result.reduce((acc: any, curr: any) => {
            acc[curr.uri] = curr.value;
            return acc;
          }, {});
        }
        
        return result;
      } catch (error) {
        throw new Error(`LwM2M error: ${(error as Error).message}`);
      }
    }
  }
}

// LwM2M Client Out functionality (writing/executing)
export class LwM2MClientOut {
  private state: LwM2MState;

  constructor(state: LwM2MState) {
    this.state = state;
  }

  /**
   * Write data to LwM2M object
   * @param topic - Object path (e.g., "/3303/0/5700")
   * @param payload - Data to write
   */
  async write(topic: string, payload: any): Promise<void> {
    if (!this.state.objectStore) {
      throw new Error('LwM2M Object Store not initialized');
    }

    try {
      await this.state.objectStore.write(topic, payload, false);
    } catch (error) {
      throw new Error(`Failed to write to LwM2M object ${topic}: ${(error as Error).message}`);
    }
  }

  /**
   * Execute LwM2M function or write data
   * @param topic - Object path, may include "/execute"
   * @param payload - Data/parameters
   */
  async execute(topic: string, payload?: any): Promise<void> {
    if (!this.state.objectStore) {
      throw new Error('LwM2M Object Store not initialized');
    }

    try {
      const executeIndex = topic.indexOf('/execute');
      
      if (executeIndex >= 0 && executeIndex === topic.length - 8) {
        // Execute command
        const executeTopic = topic.substring(0, executeIndex);
        await this.state.objectStore.execute(executeTopic, payload, false);
      } else {
        // Regular write operation
        await this.state.objectStore.write(topic, payload, false);
      }
    } catch (error) {
      throw new Error(`Failed to execute LwM2M operation ${topic}: ${(error as Error).message}`);
    }
  }
}

// Main LwM2M Library class
export class LwM2MLib {
  private state: LwM2MState;
  public clientIn: LwM2MClientIn;
  public clientOut: LwM2MClientOut;

  constructor() {
    this.state = {
      client: null,
      objectStore: null,
      isConnected: false
    };
    
    this.clientIn = new LwM2MClientIn(this.state);
    this.clientOut = new LwM2MClientOut(this.state);
  }

  /**
   * Initialize LwM2M client with configuration
   * @param config - LwM2M configuration options
   */
  async init(config: any): Promise<void> {
    try {
      // Create object store
      this.state.objectStore = new LwM2MObjectStore(config);
      
      // Create client proxy
      this.state.client = new LwM2MClientProxy({
        ...config,
        objectStore: this.state.objectStore
      });

      // Set up event handlers
      this.state.client.on('connected', () => {
        this.state.isConnected = true;
      });
      
      this.state.client.on('disconnected', () => {
        this.state.isConnected = false;
      });

      // Build resource repository
      if (config.objects) {
        const repo = await new ResourceRepositoryBuilder(
          [config.objects], 
          true, 
          config.credentialFilePath, 
          config.secret
        ).build(config);
        
        this.state.objectStore.repo = repo;
      }

    } catch (error) {
      throw new Error(`Failed to initialize LwM2M library: ${(error as Error).message}`);
    }
  }

  /**
   * Start the LwM2M client
   * @param lazyStart - If true, client will be created but not connected until explicitly started
   */
  start(lazyStart: boolean = false): void {
    if (!this.state.client) {
      throw new Error('LwM2M Library not initialized');
    }
    
    // If lazyStart is enabled, don't auto-connect - wait for explicit start command
    if (!lazyStart && !this.state.isConnected) {
      this.state.client.start();
    }
  }

  /**
   * Stop the LwM2M client
   */
  async stop(): Promise<void> {
    if (this.state.client && this.state.isConnected) {
      await this.state.client.shutdown({ deregister: true });
    }
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.state.isConnected;
  }

  /**
   * Get current state
   */
  getState(): LwM2MState {
    return { ...this.state };
  }

  // Simple Interface for SignalK Plugin
  
  /**
   * Start LwM2M client connection (Mode 2: Manual operations)
   */
  async lwm2mStart(): Promise<void> {
    if (!this.state.client) {
      throw new Error('LwM2M Library not initialized');
    }
    
    return this.clientIn.handleInput(
      { topic: 'start' },
      false, // subscribeObjectEvents = false (Mode 2)
      false
    );
  }

  /**
   * Subscribe to LwM2M object events (Mode 1: Subscription operations)
   * @param callback - Function to handle incoming object data events
   */
  lwm2mSubscribe(callback: (event: any) => void): void {
    if (!this.state.client) {
      throw new Error('LwM2M Library not initialized');
    }
    
    this.clientIn.subscribeObjectEvents(callback);
  }

  /**
   * Subscribe to LwM2M client status events (connected/disconnected/etc)
   * @param eventType - 'connected', 'disconnected', 'clientStateChanged', etc.
   * @param callback - Function to handle status events
   */
  lwm2mOnStatus(eventType: string, callback: (data?: any) => void): void {
    if (!this.state.client) {
      throw new Error('LwM2M Library not initialized');
    }
    
    this.state.client.on(eventType, callback);
  }

  /**
   * Write value to LwM2M object/instance/resource
   * @param objectPath - LwM2M path (e.g., "/3303/0/5700")
   * @param value - Value to write
   */
  async lwm2mWrite(objectPath: string, value: any): Promise<void> {
    if (!this.state.client) {
      throw new Error('LwM2M Library not initialized');
    }
    
    return this.clientOut.write(objectPath, value);
  }
}



// Re-export common classes
//export { ResourceRepositoryBuilder, LwM2MClientProxy, LwM2MObjectStore };