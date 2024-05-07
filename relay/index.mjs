import { createLibp2p } from "libp2p";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { tcp } from "@libp2p/tcp";
import { identify, identifyPush } from "@libp2p/identify";
import { yamux } from "@chainsafe/libp2p-yamux";
import { webSockets } from "@libp2p/websockets";
import { multiaddr } from "@multiformats/multiaddr";
import { noise } from "@chainsafe/libp2p-noise";

const node = await createLibp2p({
  addresses: {
    listen: [
      "/ip4/127.0.0.1/tcp/31337/ws",
    ],
  },
  connectionEncryption: [noise()],
  transports: [
    tcp(),
    webSockets(),
  ],
  services: {
    relay: circuitRelayServer(),
    identify: identify(),
    identifyPush: identifyPush(),
  },
  streamMuxers: [yamux()],
});

await node.start();
console.log("libp2p has started");

console.log("listening on addresses:");
node.getMultiaddrs().forEach((addr) => {
  console.log(addr.toString());
});
