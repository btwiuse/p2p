import { createLibp2p } from "libp2p";
import { echo } from '@libp2p/echo'
import { tcp } from "@libp2p/tcp";
import { ping } from "@libp2p/ping";
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
