import { NhostClient } from '@nhost/nhost-js';

const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN || 'fglrgnpgtyzshqcnrjke';
const region = import.meta.env.VITE_NHOST_REGION || 'ap-south-1';

console.log("Nhost configuration:", { subdomain, region });

const nhost = new NhostClient({
  subdomain,
  region,
  autoSignIn: true,
  autoRefreshToken: true
});

console.log("Nhost client initialized");

export default nhost;