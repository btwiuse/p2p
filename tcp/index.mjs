import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'

const node = await createLibp2p({
	addresses: {
		listen: ['/ip4/127.0.0.1/tcp/3233']
	},
	transports: [tcp()],
})
