// components/VideoSession.tsx
'use client';

import { useEffect, useState } from 'react';
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

interface VideoSessionProps {
  apiKey: string;
  token: string;
  callId: string;
  onEnd: () => void;
}

export function VideoSession({ apiKey, token, callId, onEnd }: VideoSessionProps) {
  const [client] = useState(() => new StreamVideoClient({ apiKey, user: { id: token }, token }));
  const [call] = useState(() => client.call('default', callId));

  // join + publish tracks on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      await client.connectUser({ id: token, name: 'Expert' });
      await call.join({ create: false });
    })();
    return () => {
      if (!mounted) return;
      call.leave().catch(() => {});
      client.disconnectUser().catch(() => {});
      mounted = false;
    };
  }, [client, call]);

  // useCallStateHooks is now safely scoped here
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const local = useLocalParticipant();
  const remoteCount = participants.filter(p => p.sessionId !== local?.sessionId).length;

  return (
    <div className="relative">
      <div className="mb-4 p-2 rounded bg-green-100 text-green-800">
        {remoteCount < 1
          ? 'Waiting for expert to join…'
          : '✅ Expert has joined!'}
      </div>

      <StreamVideo client={client}>
        <StreamCall call={call}>
          <StreamTheme>
            <SpeakerLayout />
          </StreamTheme>
          <button
            onClick={onEnd}
            className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full"
          >
            ✕
          </button>
          <CallControls  />
        </StreamCall>
      </StreamVideo>
    </div>
  );
}
