"use client";

import React, { useState } from "react";
import { NetworkResponse } from "@/utils/openagentsConnector";
import { FiRefreshCw, FiWifi } from "react-icons/fi";

interface NetworkSelectorProps {
  networks: NetworkResponse['networks'];
  onConnect: (networkId: string) => Promise<boolean>;
  onRefresh: () => Promise<void>;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ networks, onConnect, onRefresh }) => {
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleConnect = async () => {
    if (!selectedNetworkId) {
      setError("Please select a network");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const success = await onConnect(selectedNetworkId);
      if (!success) {
        setError("Failed to connect to the network");
      }
    } catch (error) {
      setError("An error occurred while connecting to the network");
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error("Error refreshing networks:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Available Networks</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Refresh networks"
        >
          <FiRefreshCw className={`${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {networks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No networks available</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh Networks
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="network-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select a network
            </label>
            <select
              id="network-select"
              value={selectedNetworkId}
              onChange={(e) => setSelectedNetworkId(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- Select a network --</option>
              {networks.map((network) => (
                <option key={network.network_profile.network_id} value={network.network_profile.network_id}>
                  {network.network_profile.name} ({network.network_profile.network_id})
                </option>
              ))}
            </select>
          </div>

          {selectedNetworkId && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              {networks
                .filter((network) => network.network_profile.network_id === selectedNetworkId)
                .map((network) => (
                  <div key={network.network_profile.network_id}>
                    <h3 className="font-semibold mb-2">{network.network_profile.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{network.network_profile.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Host:</span> {network.network_profile.host}
                      </div>
                      <div>
                        <span className="font-medium">Port:</span> {network.network_profile.port}
                      </div>
                      <div>
                        <span className="font-medium">Agents:</span> {network.num_agents}
                      </div>
                      <div>
                        <span className="font-medium">Country:</span> {network.network_profile.country}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            onClick={handleConnect}
            disabled={isConnecting || !selectedNetworkId}
            className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <FiRefreshCw className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <FiWifi />
                Connect
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default NetworkSelector; 