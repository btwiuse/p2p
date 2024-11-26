import { createLibp2p } from "libp2p";
import { echo } from "@libp2p/echo";
import { ping } from "@libp2p/ping";
import { identify, identifyPush } from "@libp2p/identify";
import { yamux } from "@chainsafe/libp2p-yamux";
import { webSockets } from "@libp2p/websockets";
import { multiaddr } from "@multiformats/multiaddr";
import { noise } from "@chainsafe/libp2p-noise";

const node = await createLibp2p({
  addresses: {
    listen: [
      // "/ip4/127.0.0.1/tcp/31337/ws",
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

node.addEventListener("peer:discovery", (evt) => {
  console.log("Discovered %s", evt.detail.id.toString()); // Log discovered peer
});

node.addEventListener("peer:connect", (evt) => {
  console.log("Connected to %s", evt.detail.toString()); // Log connected peer
});

node.addEventListener("peer:disconnect", (evt) => {
  console.log("Disconnected from %s", evt.detail.toString()); // Log disconnected peer
});

let remoteAddr = window.location.hash.replace(/^#/, "");
if (remoteAddr != "") {
  console.log("Connecting to", remoteAddr);
  let maddr = multiaddr(remoteAddr);
  let conn = await node.dial(maddr);
}
