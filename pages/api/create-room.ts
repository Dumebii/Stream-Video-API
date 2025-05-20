// pages/api/create-room.ts

import { StreamClient } from '@stream-io/node-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const apiKey = process.env.STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

// Instantiate the Stream client
const serverClient = new StreamClient(apiKey, apiSecret);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { productSlug, userId } = req.body;
  if (!productSlug || !userId) {
    return res.status(400).json({ message: 'Missing productSlug or userId' });
  }

  try {
    const callId = `product-${productSlug}`;

    // **Use the .video namespace** to create/get your call
    const call = serverClient.video.call('default', callId);

    // getOrCreate expects your payload under `data`
    await call.getOrCreate({
      data: { created_by_id: userId }
    });

    // Token API is on the root client
    const token = serverClient.createToken(userId);

    return res.status(200).json({ callId, token, apiKey });
  } catch (err: any) {
    console.error('Error in create-room:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
