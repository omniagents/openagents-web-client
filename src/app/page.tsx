"use client";

import React, { useState, useEffect } from "react";
import { useOpenAgents } from "@/contexts/OpenAgentsContext";
import NetworkSelector from "@/components/NetworkSelector";
import AgentsList from "@/components/AgentsList";
import MessagePanel from "@/components/MessagePanel";
import ConnectionStatus from "@/components/ConnectionStatus";
import AgentIdPrompt from "@/components/AgentIdPrompt";

export default function Home() {
  const { 
    isConnected, 
    networks, 
    agents, 
    messages, 
    agentId, 
    connect, 
    disconnect, 
    sendDirectMessage, 
    sendBroadcastMessage,
    refreshNetworks,
    refreshAgents,
    setAgentId
  } = useOpenAgents();

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState<string>("");
  const [showAgentIdPrompt, setShowAgentIdPrompt] = useState<boolean>(false);

  // Check if agent ID is set on initial load
  useEffect(() => {
    if (!agentId) {
      setShowAgentIdPrompt(true);
    }
  }, [agentId]);

  // Handle agent ID submission
  const handleAgentIdSubmit = (newAgentId: string) => {
    setAgentId(newAgentId);
    setShowAgentIdPrompt(false);
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    if (selectedAgentId) {
      await sendDirectMessage(selectedAgentId, messageContent);
    } else {
      await sendBroadcastMessage(messageContent);
    }

    setMessageContent("");
  };

  return (
    <main className="flex flex-col h-screen bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {showAgentIdPrompt && <AgentIdPrompt onSubmit={handleAgentIdSubmit} />}
      
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-400">OpenAgents Web Client</h1>
        
        <div className="mb-4">
          <ConnectionStatus 
            isConnected={isConnected} 
            agentId={agentId} 
            onDisconnect={disconnect}
            onChangeAgentId={setAgentId}
          />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-4 md:px-6 pb-6 overflow-hidden">
        <div className="md:col-span-1 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md overflow-hidden flex flex-col">
          {!isConnected ? (
            <NetworkSelector 
              networks={networks} 
              onConnect={connect} 
              onRefresh={refreshNetworks}
            />
          ) : (
            <AgentsList 
              agents={agents} 
              selectedAgentId={selectedAgentId}
              onSelectAgent={setSelectedAgentId}
              onRefresh={refreshAgents}
              currentAgentId={agentId}
            />
          )}
        </div>
        
        <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md overflow-hidden flex flex-col">
          <MessagePanel 
            messages={messages} 
            currentAgentId={agentId}
            selectedAgentId={selectedAgentId}
            messageContent={messageContent}
            onMessageContentChange={setMessageContent}
            onSendMessage={handleSendMessage}
            isConnected={isConnected}
          />
        </div>
      </div>
    </main>
  );
} 