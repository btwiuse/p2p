import * as net from "net";
import { createLibp2p } from "libp2p";
import { echo } from "@libp2p/echo";
import { ping } from "@libp2p/ping";
import { identify, identifyPush } from "@libp2p/identify";
import { yamux } from "@chainsafe/libp2p-yamux";
import { webSockets } from "@libp2p/websockets";
import { multiaddr } from "@multiformats/multiaddr";
import { noise } from "@chainsafe/libp2p-noise";
import { pipe } from "it-pipe";
import * as toIterable from "stream-to-it";

class Proxy {
  host;
  dest;

  constructor(host, dest) {
    this.host = host;
    this.dest = multiaddr(dest);
  }

  async ServeAuto(port) {
    const server = net.createServer((socket) => this.serveConn(socket));

    server.listen(port, () => {
      console.log("proxy listening on", port);
    });

    server.on("error", (err) => {
      console.error("proxy error", err);
    });
  }

  async serveConn(socket) {
    socket.on("end", () => {
      console.log("client disconnected");
    });

    // type of libp2p.Stream is defined here:
    // https://libp2p.github.io/js-libp2p/interfaces/_libp2p_interface.Stream.html
    // if dest doesn't contain /p2p/<peer-id>, a new connection will be established each time
    // dialProtocol is called. Otherwise, the connection will be reused.
    let stream = await this.host.dialProtocol(this.dest, "/proxy-auto/0.0.1");
    pipe(
      stream.source,
      // convert Uint8ArrayList to Uint8Array
      async function* (source) {
        for await (const uint8arrayList of source) {
          for (const uint8array of uint8arrayList) {
            // console.log(new Date, uint8array);
            yield uint8array;
          }
        }
      },
      toIterable.sink(socket),
    );
    pipe(
      toIterable.source(socket),
      // transform Buffer to Uint8Array
      /*
	    async function* (source) {
		    for await (const chunk of source) {
			    let uint8array = new Uint8Array(chunk);
			    console.log(new Date, uint8array);
			    yield uint8array;
		    }
	    },
	    */
      stream.sink,
    );
    // socket.pipe(stream.sink);
  }
}

const node = await createLibp2p({
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

// get argument 1
if (process.argv.length < 3) {
  console.error("Usage: node index.mjs <dest>");
  process.exit(1);
}
let dest = process.argv[2];
let proxy = new Proxy(
  node,
  dest,
);
proxy.ServeAuto(9900);
