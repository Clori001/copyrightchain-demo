import { BrowserProvider } from "ethers";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CHAIN_ID, NETWORK_NAME, RPC_URL, toHexChainId } from "../contract/address";

interface WalletContextValue {
  account: string;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  error: string;
  connectWallet: () => Promise<string | null>;
  switchNetwork: () => Promise<void>;
  getBrowserProvider: () => BrowserProvider;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

function parseChainId(value: string | number | null) {
  if (value === null) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number(BigInt(value));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Wallet request failed.";
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const getBrowserProvider = useCallback(() => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not available in this browser.");
    }

    return new BrowserProvider(window.ethereum);
  }, []);

  const readWalletState = useCallback(async () => {
    if (!window.ethereum) {
      return;
    }

    try {
      const accounts = await window.ethereum.request<string[]>({ method: "eth_accounts" });
      const walletChainId = await window.ethereum.request<string>({ method: "eth_chainId" });

      setAccount(accounts[0] || "");
      setChainId(parseChainId(walletChainId));
      setError("");
    } catch (walletError) {
      setError(getErrorMessage(walletError));
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask is not available in this browser.");
      return null;
    }

    try {
      const accounts = await window.ethereum.request<string[]>({ method: "eth_requestAccounts" });
      const walletChainId = await window.ethereum.request<string>({ method: "eth_chainId" });

      setAccount(accounts[0] || "");
      setChainId(parseChainId(walletChainId));
      setError("");

      return accounts[0] || null;
    } catch (walletError) {
      setError(getErrorMessage(walletError));
      return null;
    }
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask is not available in this browser.");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHexChainId(CHAIN_ID) }]
      });
      await readWalletState();
    } catch (switchError) {
      const errorWithCode = switchError as { code?: number };

      if (errorWithCode.code === 4902) {
        if (!RPC_URL) {
          setError(`Please add ${NETWORK_NAME} to MetaMask manually, then switch to chain ID ${CHAIN_ID}.`);
          return;
        }

        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: toHexChainId(CHAIN_ID),
              chainName: NETWORK_NAME,
              rpcUrls: RPC_URL ? [RPC_URL] : [],
              nativeCurrency: {
                name: "Testnet Token",
                symbol: "MON",
                decimals: 18
              }
            }
          ]
        });
        await readWalletState();
        return;
      }

      setError(getErrorMessage(switchError));
    }
  }, [readWalletState]);

  useEffect(() => {
    void readWalletState();

    if (!window.ethereum?.on) {
      return undefined;
    }

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = Array.isArray(args[0]) ? (args[0] as string[]) : [];
      setAccount(accounts[0] || "");
    };

    const handleChainChanged = (...args: unknown[]) => {
      setChainId(parseChainId(String(args[0])));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [readWalletState]);

  const value = useMemo(
    () => ({
      account,
      chainId,
      isConnected: Boolean(account),
      isCorrectNetwork: chainId === CHAIN_ID,
      error,
      connectWallet,
      switchNetwork,
      getBrowserProvider
    }),
    [account, chainId, connectWallet, error, getBrowserProvider, switchNetwork]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider");
  }

  return context;
}
