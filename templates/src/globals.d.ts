declare module '*.png';
declare module '*.pdf';

interface Window {
  ethereum?: import('ethers').providers.ExternalProvider;
}
