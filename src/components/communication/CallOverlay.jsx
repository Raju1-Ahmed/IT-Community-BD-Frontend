import { useEffect } from "react";
import { Mic, MicOff, Phone, Video, VideoOff, X } from "lucide-react";

const formatDuration = (seconds = 0) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

const CallOverlay = ({ call, localStream, remoteStream, localVideoRef, remoteVideoRef, duration, onAccept, onReject, onEnd, onToggleMute, onToggleVideo }) => {
  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream, localVideoRef, remoteVideoRef]);

  if (!call) return null;
  const incoming = call.status === "incoming";
  const connecting = ["ringing", "connecting"].includes(call.status);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex h-[min(760px,calc(100dvh-1.5rem))] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl ring-1 ring-white/10 sm:h-[min(720px,calc(100dvh-3rem))]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div><p className="text-sm font-semibold">{call.audioOnly ? "Audio call" : "Video call"}</p><p className="text-xs text-slate-400">{call.remoteName || "IT Community BD"} · {connecting ? "Connecting..." : formatDuration(duration)}</p></div>
          <button type="button" onClick={onEnd} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close call"><X size={18} /></button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-900">
          {!call.audioOnly ? <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" /> : <audio ref={remoteVideoRef} autoPlay />}
          <div className={`${call.audioOnly ? "flex h-full" : "absolute bottom-4 right-4 h-32 w-24 sm:h-40 sm:w-32"} items-center justify-center overflow-hidden rounded-2xl bg-slate-800 ring-1 ring-white/15`}>
            {!call.audioOnly ? <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" /> : <div className="text-center text-sm text-slate-300"><Phone size={28} className="mx-auto mb-2" />Audio only</div>}
          </div>
          {incoming ? <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300"><Phone size={28} /></div><p className="text-lg font-semibold">{call.remoteName || "Someone"} is calling</p><p className="mt-1 text-sm text-slate-400">{call.audioOnly ? "Audio call" : "Video call"}</p></div> : null}
        </div>

        <div className="flex items-center justify-center gap-3 px-4 py-4">
          {incoming ? <><button type="button" onClick={onReject} className="rounded-full bg-rose-600 p-4 hover:bg-rose-700" aria-label="Reject call"><Phone size={20} /></button><button type="button" onClick={onAccept} className="rounded-full bg-emerald-600 p-4 hover:bg-emerald-700" aria-label="Accept call"><Phone size={20} /></button></> : <><button type="button" onClick={onToggleMute} className="rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label={call.muted ? "Unmute" : "Mute"}>{call.muted ? <MicOff size={18} /> : <Mic size={18} />}</button>{!call.audioOnly ? <button type="button" onClick={onToggleVideo} className="rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label={call.videoOff ? "Turn video on" : "Turn video off"}>{call.videoOff ? <VideoOff size={18} /> : <Video size={18} />}</button> : null}<button type="button" onClick={onEnd} className="rounded-full bg-rose-600 p-4 hover:bg-rose-700" aria-label="End call"><Phone size={20} /></button></>}
        </div>
      </div>
    </div>
  );
};

export default CallOverlay;
