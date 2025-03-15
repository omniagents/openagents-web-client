import { v4 as uuidv4 } from 'uuid';

// WebSocket proxy configuration
const WS_PROXY_URL = 'wss://websocket.openagents.org';

export interface NetworkProfile {
  authentication: {
    config: Record<string, any>;
    type: string;
  };
  capacity: null | number;
  categories: string[];
  country: string;
  description: string;
  discoverable: boolean;
  host: string;
  icon: null | string;
  installed_protocols: string[];
  management_code: null | string;
  name: string;
  network_discovery_server: string;
  network_id: string;
  port: number;
  required_adapters: string[];
  required_openagents_version: string;
  tags: string[];
  website: null | string;
}

export interface NetworkResponse {
  count: number;
  networks: Array<{
    last_heartbeat: number;
    last_heartbeat_time: string;
    management_token: string;
    network_profile: NetworkProfile;
    num_agents: number;
  }>;
  success: boolean;
}

export interface Agent {
  agent_id: string;
  name: string;
  connected: boolean;
  metadata: Record<string, any>;
}

export interface Message {
  message_id: string;
  sender_id: string;
  timestamp: number;
  content: {
    text: string;
  };
  metadata: {
    type: string;
  };
}

export interface DirectMessage extends Message {
  message_type: 'direct_message';
  target_agent_id: string;
}

export interface BroadcastMessage extends Message {
  message_type: 'broadcast_message';
}

// System command constants
export const REGISTER_AGENT = 'register_agent';
export const LIST_AGENTS = 'list_agents';
export const LIST_PROTOCOLS = 'list_protocols';
export const GET_PROTOCOL_MANIFEST = 'get_protocol_manifest';

export class OpenAgentsConnector {
  private host: string;
  private port: number;
  private agentId: string;
  private metadata: Record<string, any>;
  private connection: WebSocket | null = null;
  private isConnected: boolean = false;
  private messageHandlers: Record<string, (message: any) => void> = {};
  private systemHandlers: Record<string, (data: any) => void> = {};

  constructor(host: string, port: number, agentId: string, metadata: Record<string, any> = {}) {
    this.host = host;
    this.port = port;
    this.agentId = agentId;
    this.metadata = metadata;
  }

  public async connectToServer(): Promise<boolean> {
    try {
      return new Promise<boolean>((resolve) => {
        // Use the browser's WebSocket API
        if (typeof window !== 'undefined') {
          // Use the WebSocket proxy instead of connecting directly
          // Pass the target host and port as query parameters
          const wsUrl = `${WS_PROXY_URL}/?host=${this.host}&port=${this.port}`;
          
          this.connection = new WebSocket(wsUrl);

          this.connection.onopen = () => {
            // Register with server
            this.sendSystemRequest(REGISTER_AGENT, {
              agent_id: this.agentId,
              metadata: this.metadata
            });
          };

          this.connection.onmessage = (event) => {
            const data = JSON.parse(event.data as string);

            if (data.type === 'system_response' && data.command === REGISTER_AGENT && data.success) {
              this.isConnected = true;
              console.log(`Connected to network: ${data.network_name}`);
              this._listenForMessages();
              resolve(true);
            } else if (data.type === 'system_response' && data.command === REGISTER_AGENT && !data.success) {
              console.error(`Failed to connect: ${data.error}`);
              this.connection?.close();
              resolve(false);
            } else {
              this._handleMessage(data);
            }
          };

          this.connection.onerror = (error) => {
            console.error('WebSocket error:', error);
            resolve(false);
          };

          this.connection.onclose = () => {
            this.isConnected = false;
            console.log(`Agent ${this.agentId} disconnected from network`);
          };
        } else {
          console.error('WebSocket is not available in this environment');
          resolve(false);
        }
      });
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }

  public async disconnect(): Promise<boolean> {
    if (this.connection) {
      try {
        this.connection.close();
        this.connection = null;
        this.isConnected = false;
        console.log(`Agent ${this.agentId} disconnected from network`);
        return true;
      } catch (error) {
        console.error('Error disconnecting:', error);
        return false;
      }
    }
    return false;
  }

  public registerMessageHandler(messageType: string, handler: (message: any) => void): void {
    this.messageHandlers[messageType] = handler;
    console.log(`Registered handler for message type: ${messageType}`);
  }

  public registerSystemHandler(command: string, handler: (data: any) => void): void {
    this.systemHandlers[command] = handler;
    console.log(`Registered handler for system command: ${command}`);
  }

  private _listenForMessages(): void {
    if (!this.connection) return;

    this.connection.onmessage = (event) => {
      const data = JSON.parse(event.data as string);
      this._handleMessage(data);
    };
  }

  private _handleMessage(data: any): void {
    if (data.type === 'message') {
      const messageData = data.data || {};
      const messageType = messageData.message_type;
      
      if (messageType && this.messageHandlers[messageType]) {
        this.messageHandlers[messageType](messageData);
      }
    } else if (data.type === 'system_response') {
      const command = data.command;
      if (command && this.systemHandlers[command]) {
        this.systemHandlers[command](data);
      }
    }
  }

  public async sendMessage(message: DirectMessage | BroadcastMessage): Promise<boolean> {
    if (!this.isConnected || !this.connection) {
      console.warn(`Agent ${this.agentId} is not connected to a network`);
      return false;
    }

    try {
      // Ensure sender_id is set
      if (!message.sender_id) {
        message.sender_id = this.agentId;
      }

      // Send the message
      this.connection.send(JSON.stringify({
        type: 'message',
        data: message
      }));

      console.log(`Message sent: ${message.message_id}`);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  public async sendDirectMessage(targetAgentId: string, content: string): Promise<boolean> {
    const message: DirectMessage = {
      message_id: uuidv4(),
      message_type: 'direct_message',
      sender_id: this.agentId,
      target_agent_id: targetAgentId,
      timestamp: Date.now(),
      content: { text: content },
      metadata: { type: 'text' }
    };

    return this.sendMessage(message);
  }

  public async sendBroadcastMessage(content: string): Promise<boolean> {
    const message: BroadcastMessage = {
      message_id: uuidv4(),
      message_type: 'broadcast_message',
      sender_id: this.agentId,
      timestamp: Date.now(),
      content: { text: content },
      metadata: { type: 'text' }
    };

    return this.sendMessage(message);
  }

  public async sendSystemRequest(command: string, data: Record<string, any> = {}): Promise<boolean> {
    if (!this.connection) {
      console.warn('Not connected to a server');
      return false;
    }

    try {
      this.connection.send(JSON.stringify({
        type: 'system_request',
        command,
        ...data
      }));
      return true;
    } catch (error) {
      console.error(`Failed to send system request: ${error}`);
      return false;
    }
  }

  public async listAgents(): Promise<boolean> {
    return this.sendSystemRequest(LIST_AGENTS, { agent_id: this.agentId });
  }

  public async listProtocols(): Promise<boolean> {
    return this.sendSystemRequest(LIST_PROTOCOLS, { agent_id: this.agentId });
  }

  public async getProtocolManifest(protocolName: string): Promise<boolean> {
    return this.sendSystemRequest(GET_PROTOCOL_MANIFEST, {
      agent_id: this.agentId,
      protocol_name: protocolName
    });
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Function to fetch available networks from the discovery server
export async function fetchNetworks(): Promise<NetworkResponse> {
  try {
    const response = await fetch('https://discovery.openagents.org/list_networks');
    const data = await response.json();
    return data as NetworkResponse;
  } catch (error) {
    console.error('Error fetching networks:', error);
    return {
      count: 0,
      networks: [],
      success: false
    };
  }
} 