"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Agent } from "@/utils/openagentsConnector";
import { FiRefreshCw, FiUser, FiUsers, FiRadio } from "react-icons/fi";

interface AgentsListProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  onRefresh: () => Promise<void>;
  currentAgentId: string;
}

const AgentsList: React.FC<AgentsListProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  onRefresh,
  currentAgentId,
}) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the handleRefresh function to avoid recreating it on every render
  const handleRefresh = useCallback(async (showAnimation = true) => {
    if (isRefreshing) return; // Prevent multiple refreshes at once
    
    if (showAnimation) {
      setIsRefreshing(true);
    }
    
    try {
      await onRefresh();
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Error refreshing agents:", error);
    } finally {
      if (showAnimation) {
        setIsRefreshing(false);
      }
    }
  }, [isRefreshing, onRefresh]);

  // Set up automatic refresh every 30 seconds
  useEffect(() => {
    const startAutoRefresh = () => {
      refreshTimerRef.current = setInterval(async () => {
        await handleRefresh(false); // Pass false to not show the refresh animation
      }, 30000); // 30 seconds
    };

    startAutoRefresh();

    // Clean up the interval when the component unmounts
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [handleRefresh]);

  // Format the last refreshed time
  const formatLastRefreshed = () => {
    return lastRefreshed.toLocaleTimeString();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Connected Agents</h2>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
              Last updated: {formatLastRefreshed()}
            </span>
            <button
              onClick={() => handleRefresh()}
              disabled={isRefreshing}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh agents"
            >
              <FiRefreshCw className={`${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={() => onSelectAgent(null)}
            className={`w-full flex items-center justify-between p-3 rounded-md mb-2 ${
              selectedAgentId === null
                ? "bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiUsers className="text-blue-500" />
              <span>All Messages</span>
            </div>
            <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full flex items-center">
              <FiRadio />
            </div>
          </button>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-4 px-6">
          <p className="text-gray-500 dark:text-gray-400">No agents connected</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-2">
            {agents
              .filter((agent) => agent.agent_id !== currentAgentId) // Filter out the current agent
              .map((agent) => (
                <button
                  key={agent.agent_id}
                  onClick={() => onSelectAgent(agent.agent_id)}
                  className={`w-full flex items-center justify-between p-3 rounded-md ${
                    selectedAgentId === agent.agent_id
                      ? "bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiUser className={agent.connected ? "text-green-500" : "text-gray-400"} />
                    <div className="text-left">
                      <div className="font-medium">{agent.name || agent.agent_id}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{agent.agent_id}</div>
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      agent.connected ? "bg-green-500" : "bg-gray-400"
                    }`}
                    title={agent.connected ? "Connected" : "Disconnected"}
                  ></div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsList; 