'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

export default function AgentPage() {
        const params = useParams();
        // Guard for null or array case:
        const slugParam = params?.slug;
        const slug =
          Array.isArray(slugParam) ? slugParam[0] : slugParam ?? '';  const [client, setClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<any>();
  const [joined, setJoined] = useState(false);


  

  useEffect(() => {
    async function joinAsExpert() {
      const userId = `expert-${slug}`;         // replace with your auth ID
      const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug: slug, userId }),
      });
      const { callId, token, apiKey } = await res.json();

      const user = { id: userId, name: 'Expert' };
      const svClient = new StreamVideoClient({ apiKey, user, token });
      await svClient.connectUser(user);                // authenticate the WS connection

      const callObj = svClient.call('default', callId);
      await callObj.join({ create: false});

      setClient(svClient);
      setCall(callObj);
      setJoined(true);
    }

    joinAsExpert();
  }, [slug]);

  if (!joined) {
    return <p className="p-8 text-xl">Joining call as expert…</p>;
  }

  return (
    <div className="min-h-screen p-8">
      <StreamVideo client={client!}>
        <StreamCall call={call!}>
          <StreamTheme>
            <SpeakerLayout />
            <CallControls />
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  );
}
