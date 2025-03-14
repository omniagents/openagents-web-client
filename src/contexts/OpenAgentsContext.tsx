'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  OpenAgentsConnector, 
  NetworkResponse, 
  Agent, 
  DirectMessage, 
  BroadcastMessage,
  fetchNetworks
} from '@/utils/openagentsConnector';

interface OpenAgentsContextType {
  connector: OpenAgentsConnector | null;
  isConnected: boolean;
  networks: NetworkResponse['networks'];
  agents: Agent[];
  messages: (DirectMessage | BroadcastMessage)[];
  selectedNetwork: NetworkResponse['networks'][0] | null;
  agentId: string;
  connect: (networkId: string) => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  sendDirectMessage: (targetAgentId: string, content: string) => Promise<boolean>;
  sendBroadcastMessage: (content: string) => Promise<boolean>;
  setAgentId: (id: string) => void;
  refreshNetworks: () => Promise<void>;
  refreshAgents: () => Promise<void>;
  selectNetwork: (network: NetworkResponse['networks'][0]) => void;
}

const OpenAgentsContext = createContext<OpenAgentsContextType | undefined>(undefined);

interface OpenAgentsProviderProps {
  children: ReactNode;
}

export const OpenAgentsProvider: React.FC<OpenAgentsProviderProps> = ({ children }) => {
  const [connector, setConnector] = useState<OpenAgentsConnector | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [networks, setNetworks] = useState<NetworkResponse['networks']>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<(DirectMessage | BroadcastMessage)[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkResponse['networks'][0] | null>(null);
  
  // Initialize with an empty string
  const [agentId, setAgentIdState] = useState<string>('');

  // Use useEffect to update the agentId on the client side only
  useEffect(() => {
    // This code only runs on the client
    if (typeof window !== 'undefined') {
      const savedAgentId = localStorage.getItem('openagents_agent_id');
      if (savedAgentId) {
        setAgentIdState(savedAgentId);
      }
    }
    // We no longer set a default value here, allowing the prompt to show
  }, []);

  // Custom setter for agentId that also updates localStorage
  const setAgentId = (id: string): void => {
    setAgentIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('openagents_agent_id', id);
    }
  };

  // Save agent ID to localStorage whenever it changes (after initial load)
  useEffect(() => {
    if (typeof window !== 'undefined' && agentId) {
      localStorage.setItem('openagents_agent_id', agentId);
    }
  }, [agentId]);

  // Fetch networks on component mount
  useEffect(() => {
    refreshNetworks();
  }, []);

  const refreshNetworks = async (): Promise<void> => {
    try {
      const data = await fetchNetworks();
      if (data.success) {
        setNetworks(data.networks);
      }
    } catch (error) {
      console.error('Error fetching networks:', error);
    }
  };

  const selectNetwork = (network: NetworkResponse['networks'][0]): void => {
    setSelectedNetwork(network);
  };

  const connect = async (networkId: string): Promise<boolean> => {
    try {
      // Find the network with the given ID
      const network = networks.find(n => n.network_profile.network_id === networkId);
      if (!network) {
        console.error(`Network with ID ${networkId} not found`);
        return false;
      }

      const { host, port } = network.network_profile;
      
      // Create a new connector
      const newConnector = new OpenAgentsConnector(
        host,
        port,
        agentId,
        {
          name: agentId,
          type: 'web_client',
          platform: 'browser',
          version: '1.0.0'
        }
      );

      // Register message handlers
      newConnector.registerMessageHandler('direct_message', (message: DirectMessage) => {
        setMessages(prev => [...prev, message]);
      });

      newConnector.registerMessageHandler('broadcast_message', (message: BroadcastMessage) => {
        setMessages(prev => [...prev, message]);
      });

      // Register system handlers
      newConnector.registerSystemHandler('list_agents', (data) => {
        if (data.success) {
          setAgents(data.agents);
        }
      });

      // Connect to the server
      const success = await newConnector.connectToServer();
      if (success) {
        setConnector(newConnector);
        setIsConnected(true);
        
        // Fetch the list of agents
        await newConnector.listAgents();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error connecting to network:', error);
      return false;
    }
  };

  const disconnect = async (): Promise<boolean> => {
    if (connector) {
      const success = await connector.disconnect();
      if (success) {
        setConnector(null);
        setIsConnected(false);
        setAgents([]);
        return true;
      }
    }
    return false;
  };

  const sendDirectMessage = async (targetAgentId: string, content: string): Promise<boolean> => {
    if (connector && isConnected) {
      const success = await connector.sendDirectMessage(targetAgentId, content);
      if (success) {
        // Add the message to our local state
        const message: DirectMessage = {
          message_id: uuidv4(),
          message_type: 'direct_message',
          sender_id: agentId,
          target_agent_id: targetAgentId,
          timestamp: Date.now(),
          content: { text: content },
          metadata: { type: 'text' }
        };
        setMessages(prev => [...prev, message]);
      }
      return success;
    }
    return false;
  };

  const sendBroadcastMessage = async (content: string): Promise<boolean> => {
    if (connector && isConnected) {
      const success = await connector.sendBroadcastMessage(content);
      if (success) {
        // Add the message to our local state
        const message: BroadcastMessage = {
          message_id: uuidv4(),
          message_type: 'broadcast_message',
          sender_id: agentId,
          timestamp: Date.now(),
          content: { text: content },
          metadata: { type: 'text' }
        };
        setMessages(prev => [...prev, message]);
      }
      return success;
    }
    return false;
  };

  const refreshAgents = async (): Promise<void> => {
    if (connector && isConnected) {
      await connector.listAgents();
    }
  };

  const value = {
    connector,
    isConnected,
    networks,
    agents,
    messages,
    selectedNetwork,
    agentId,
    connect,
    disconnect,
    sendDirectMessage,
    sendBroadcastMessage,
    setAgentId,
    refreshNetworks,
    refreshAgents,
    selectNetwork
  };

  return (
    <OpenAgentsContext.Provider value={value}>
      {children}
    </OpenAgentsContext.Provider>
  );
};

export const useOpenAgents = (): OpenAgentsContextType => {
  const context = useContext(OpenAgentsContext);
  if (context === undefined) {
    throw new Error('useOpenAgents must be used within an OpenAgentsProvider');
  }
  return context;
}; 