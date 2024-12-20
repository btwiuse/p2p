import { createLibp2p } from "libp2p";
import { echo } from "@libp2p/echo";
import { ping } from "@libp2p/ping";
import { identify, identifyPush } from "@libp2p/identify";
import { yamux } from "@chainsafe/libp2p-yamux";
import { webSockets } from "@libp2p/websockets";
import { multiaddr } from "@multiformats/multiaddr";
import { noise } from "@chainsafe/libp2p-noise";
import { persistentIdentity } from "../p2pid/index.mjs";

const node = await createLibp2p({
  privateKey: await persistentIdentity(),
  addresses: {
    listen: [
      "/ip4/127.0.0.1/tcp/31337/ws",
    ],
  },
  connectionEncrypters: [noise()],
  transports: [
    webSockets(),
  ],
  services: {
    echo: echo(),
    ping: ping({
      protocolPrefix: "ipfs", // default
    }),
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

const protocols = await node.getProtocols();
console.log("registered protocols:", protocols);
