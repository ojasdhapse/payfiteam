import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

// Shardeum network configuration
export const SHARDEUM_NETWORK = {
  chainId: '0x1F92', // 8082 in hex
  chainName: 'Shardeum Sphinx',
  nativeCurrency: {
    name: 'Shardeum',
    symbol: 'SHM',
    decimals: 18,
  },
  rpcUrls: [import.meta.env.VITE_SHARDEUM_RPC_URL || 'https://sphinx.shardeum.org/'],
  blockExplorerUrls: ['https://explorer-sphinx.shardeum.org/'],
};

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connectWallet(): Promise<string | null> {
    try {
      const ethereum = await detectEthereumProvider();
      
      if (!ethereum) {
        throw new Error('MetaMask not detected');
      }

      // Request account access
      const accounts = await (ethereum as any).request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Switch to Shardeum network
      await this.switchToShardeum();

      this.provider = new ethers.BrowserProvider(ethereum as any);
      this.signer = await this.provider.getSigner();

      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async switchToShardeum(): Promise<void> {
    try {
      const ethereum = (window as any).ethereum;
      
      // Try to switch to Shardeum network
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SHARDEUM_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SHARDEUM_NETWORK],
        });
      } else {
        throw switchError;
      }
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async sendTransaction(to: string, amount: string): Promise<string> {
    if (!this.signer) throw new Error('Signer not initialized');

    const tx = await this.signer.sendTransaction({
      to,
      value: ethers.parseEther(amount),
    });

    await tx.wait();
    return tx.hash;
  }

  async deployContract(abi: any[], bytecode: string, ...args: any[]): Promise<string> {
    if (!this.signer) throw new Error('Signer not initialized');

    const factory = new ethers.ContractFactory(abi, bytecode, this.signer);
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();

    return await contract.getAddress();
  }

  async callContract(address: string, abi: any[], method: string, ...args: any[]): Promise<any> {
    if (!this.provider) throw new Error('Provider not initialized');

    const contract = new ethers.Contract(address, abi, this.provider);
    return await contract[method](...args);
  }

  async sendContractTransaction(address: string, abi: any[], method: string, ...args: any[]): Promise<string> {
    if (!this.signer) throw new Error('Signer not initialized');

    const contract = new ethers.Contract(address, abi, this.signer);
    const tx = await contract[method](...args);
    await tx.wait();

    return tx.hash;
  }

  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }
}

export const web3Service = new Web3Service();