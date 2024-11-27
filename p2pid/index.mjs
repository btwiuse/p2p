import { generateKeyPairFromSeed } from "@libp2p/crypto/keys";
import { crypto } from "@std/crypto";
import { encodeHex } from "@std/encoding/hex";

// Peer ID Seed Env String
const PID_SEED = "PID_SEED";

/**
 * Creates a persistent identity option for libp2p using environment variable
 * @returns {Promise<import('@libp2p/interface-libp2p').LibP2pOptions['peerId']>}
 */
export async function persistentIdentity() {
  return persistentIdentityFromEnv(PID_SEED);
}

/**
 * Gets environment variable across different platforms
 * @param {string} key - Environment variable key
 * @returns {string|undefined}
 */
function getEnvVar(key) {
  if (typeof process !== "undefined" && process.env) {
    // Node.js environment
    return process.env[key];
  } else if (typeof Deno !== "undefined") {
    // Deno environment
    return Deno.env.get(key);
  } else {
    // Browser environment - could use localStorage or other storage mechanism
    return localStorage.getItem(key);
  }
}

/**
 * Creates a persistent identity option from a specific environment variable
 * @param {string} envVar - Environment variable name containing the seed
 * @returns {Promise<import('@libp2p/interface-libp2p').LibP2pOptions['peerId']>}
 */
export async function persistentIdentityFromEnv(envVar) {
  const seed = getEnvVar(envVar);

  // If seed is empty, return undefined to let libp2p generate random identity
  if (!seed) {
    return undefined;
  }

  return await persistentIdentityFromSeed(seed);
}

/**
 * Creates a persistent identity directly from a seed string
 * @param {string} seed - Seed string to generate identity from
 * @returns {Promise<import('@libp2p/interface-libp2p').LibP2pOptions['peerId']>}
 */
export async function persistentIdentityFromSeed(seed) {
  const hashedSeed = await createHashedReader(seed);
  return persistentIdentityFromReader(hashedSeed);
}

/**
 * Creates a persistent identity from a byte source
 * @param {Uint8Array} bytes - Bytes to use as seed
 * @returns {Promise<import('@libp2p/interface-libp2p').LibP2pOptions['peerId']>}
 */
export async function persistentIdentityFromReader(bytes) {
  const keyPair = await generateKeyPairFromSeed("Ed25519", bytes);

  return keyPair;
}

/**
 * Creates a deterministic byte source from a string seed
 * @param {string} seed - Seed string
 * @returns {Promise<Uint8Array>} - 32 byte array
 */
async function createHashedReader(seed) {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer);
}
