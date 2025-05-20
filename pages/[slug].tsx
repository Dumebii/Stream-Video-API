'use client';

import { useState, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { contentfulClient } from '../lib/contentful';
import { Product } from '../types/product';

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { VideoSession } from './componenets/VideoSession';


type SessionData = {
    apiKey: string;
    token: string;
    callId: string;
  };

type Props = { product: Product };

export default function ProductPage({ product }: Props) {
  // —— State Hooks —— 
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const [call, setCall]         = useState<any>();
  const [joined, setJoined]     = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating]     = useState(0);
  const [session, setSession] = useState<SessionData | null>(null);

  // —— Hook to count remote participants —— 
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const local = useLocalParticipant();
  const remoteCount = participants.filter(p => p.sessionId !== local?.sessionId).length;

  // —— Cleanup on unmount —— 
  useEffect(() => {
    return () => {
      call?.leave().catch(() => {});
      videoClient?.disconnectUser().catch(() => {});
    };
  }, [call, videoClient]);

  // —— Join Call Handler —— 
  const joinCall = async () => {
    const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    const res = await fetch('/api/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productSlug: product.slug, userId }),
    });
    const { callId, token, apiKey } = await res.json();

    const client = new StreamVideoClient({ apiKey, user: { id: userId }, token });
    await client.connectUser({ id: userId, name: 'User' });

    const callObj = client.call('default', callId);
    await callObj.join({ create: true });

    setVideoClient(client);
    setCall(callObj);
    setJoined(true);
  };

  // —— End Call Handler —— 
  const endCall = async () => {
    await call?.leave();
    await videoClient?.disconnectUser();
    setJoined(false);
    setShowFeedback(true);
  };

  // —— Feedback Submit Handler —— 
  const submitFeedback = () => {
    console.log('User rating:', rating);
    setShowFeedback(false);
  };

  // —— Render Logic —— 
  if (showFeedback) {
    // Post-call feedback UI
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow w-80">
          <h2 className="text-2xl font-bold mb-4">Rate Your Session</h2>
          <div className="flex space-x-2 mb-4">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-4xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
          <button
            onClick={submitFeedback}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <VideoSession
        apiKey={session.apiKey}
        token={session.token}
        callId={session.callId}
        onEnd={endCall}
      />
    );
  }

  if (!joined) {
    // Before joining: product info + join button
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
        <img src={product.imageUrl} alt={product.name} className="mb-4 max-w-md" />
        <p className="mb-8">{product.description}</p>
        <button
          onClick={joinCall}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Talk to a Product Expert
        </button>
        <Link href={`/agent/${product.slug}`}>
            View Expert Dashboard
        </Link>
      </div>
    );
  }

  // Joined state: in-call UI
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-2">In Call: {product.name}</h1>
      <div className="mb-4 p-2 rounded bg-green-100 text-green-800">
        {remoteCount < 1
          ? 'Waiting for expert to join…'
          : '✅ Expert has joined!'}
      </div>
      <StreamCall call={call!}>
      <StreamVideo client={videoClient!}>

          <StreamTheme>
            <SpeakerLayout />
          </StreamTheme>
          {/* Hang-up button */}
          <button
            onClick={endCall}
            className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full"
          >
            ✕
          </button>
          <CallControls  />
      </StreamVideo>
      </StreamCall>
    </div>
  );
}

// —— Data Fetching —— 

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await contentfulClient.getEntries({ content_type: 'pageProduct' });
  const paths = entries.items.map((i: any) => ({ params: { slug: i.fields.slug } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params!.slug as string;
  const entries = await contentfulClient.getEntries({
    content_type: 'pageProduct',
    'fields.slug': slug,
  });
  const item = entries.items[0] as any;
  if (!item) return { notFound: true };
  const product: Product = {
    name: item.fields.name as string,
    slug: item.fields.slug as string,
    description: item.fields.description as string,
    imageUrl: 'https:' + (item.fields.image?.fields.file.url as string),
  };
  return { props: { product } };
};
