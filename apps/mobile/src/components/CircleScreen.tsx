"use client";

import { useState } from "react";
import { Heart, Lock, MessageCircle, Mic, Send, Volume2 } from "lucide-react";
import { relativeTime } from "@/lib/format";
import type { CirclePost, FlowPhase, Patient, SpeechLang } from "@/lib/types";

interface CircleScreenProps {
  patient: Patient;
  posts: CirclePost[];
  phase: FlowPhase;
  careNote: string | null;
  playingId: string | null;
  onPlay: (id: string, text: string, lang: SpeechLang) => void;
  onPublish: (input: { text: string; withVoice: boolean }) => Promise<void>;
  onToggleSupplement: () => void;
}

export function CircleScreen({
  patient,
  posts,
  phase,
  careNote,
  playingId,
  onPlay,
  onPublish,
  onToggleSupplement,
}: CircleScreenProps) {
  const [composerText, setComposerText] = useState("");
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [posting, setPosting] = useState(false);

  const firstName = patient.name.split(" ")[0] || patient.name;

  const publish = async (withVoice: boolean) => {
    const text = composerText.trim();
    if (!text && !withVoice) return;
    setPosting(true);
    await onPublish({ text, withVoice });
    setComposerText("");
    setPosting(false);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-[#EAE3D5] px-4 pb-2 pt-3">
        <span className="font-serif text-[19px] font-bold text-[#101828]">Sakhi</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#0F4C3A]">
            <Lock size={10} />
            Week {patient.gestationWeek} Circle
          </span>

        </div>
      </div>

      <div
        className={`flex shrink-0 items-center justify-between border-b border-[#EAE3D5] px-4 py-1.5 text-[11px] ${
          phase === "alert" ? "bg-[#FFF4F1]" : "bg-[#F5EFE4]"
        }`}
      >
        <span className={`font-semibold ${phase === "alert" ? "text-[#9C331A]" : "text-[#344054]"}`}>
          {phase === "alert"
            ? `Care team notified · ${patient.ashaName.split(" ")[0]} alerted`
            : `${patient.supplementName} · ${patient.supplementDaysCompleted}/${patient.supplementDaysTotal} days`}
        </span>
        {phase === "alert" && careNote ? (
          <button
            type="button"
            onClick={() => onPlay("care-recap", careNote, patient.speechLang)}
            className="cursor-pointer font-bold text-[#C8643B]"
          >
            {playingId === "care-recap" ? "Playing…" : "Replay advice"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleSupplement}
            className="cursor-pointer font-bold text-[#0F4C3A]"
          >
            {patient.supplementTakenToday ? "Taken ✓" : "Mark taken"}
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b border-[#EAE3D5] px-4 py-2">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#C8643B] text-[10px] font-bold text-white">
          {firstName.charAt(0).toUpperCase()}
        </div>
        <input
          type="text"
          value={composerText}
          onChange={(event) => setComposerText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void publish(false);
          }}
          placeholder="Share text or a voice note with your circle…"
          className="min-w-0 flex-1 bg-transparent text-[12px] text-[#101828] placeholder:text-[#667085] focus:outline-none"
        />
        <button
          type="button"
          title="Post a voice note"
          disabled={posting}
          onClick={() => void publish(true)}
          className="cursor-pointer text-[#C8643B] hover:opacity-80 disabled:opacity-40"
        >
          <Mic size={14} />
        </button>
        <button
          type="button"
          title="Post"
          disabled={posting}
          onClick={() => void publish(false)}
          className="cursor-pointer text-[#101828] hover:opacity-80 disabled:opacity-40"
        >
          <Send size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {posts.length === 0 && (
          <p className="px-4 py-6 text-[12px] text-[#667085]">
            No posts yet. Be the first to share how tonight felt.
          </p>
        )}

        {posts.map((post) => {
          const liked = Boolean(likedIds[post.id]);
          return (
            <div key={post.id} className="border-b border-[#EAE3D5] px-4 py-3">
              <div className="flex gap-2.5">
                <div className="flex shrink-0 flex-col items-center">
                  <div
                    className="grid h-7 w-7 place-items-center rounded-full text-[10.5px] font-bold"
                    style={{ backgroundColor: post.avatarBg, color: post.avatarText }}
                  >
                    {post.avatar}
                  </div>
                  {post.reply && <div className="my-1 w-[1.5px] flex-1 bg-[#DDD3C0]" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="truncate font-bold text-[#101828]">
                      {post.author}{" "}
                      <span className="font-medium text-[#667085]">· {post.badge}</span>
                    </span>
                    <span className="shrink-0 text-[10px] text-[#98A2B3]">
                      {relativeTime(post.createdAtIso)}
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-[1.45] text-[#101828]">{post.text}</p>

                  {post.voiceDuration && (
                    <button
                      type="button"
                      onClick={() =>
                        onPlay(
                          post.id,
                          post.text,
                          post.voiceLang === "Marathi"
                            ? "mr-IN"
                            : post.voiceLang === "English"
                              ? "en-IN"
                              : "hi-IN",
                        )
                      }
                      className={`mt-1.5 inline-flex cursor-pointer items-center gap-2 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${
                        post.voiceLang ? "bg-[#0F4C3A] text-[#FAF6EE]" : "bg-[#EFE6D5] text-[#101828]"
                      }`}
                    >
                      <Volume2 size={11} />
                      <span>
                        {playingId === post.id
                          ? "Playing…"
                          : `${post.voiceDuration}${post.voiceLang ? ` · ${post.voiceLang}` : ""}`}
                      </span>
                    </button>
                  )}

                  <div className="mt-1.5 flex items-center gap-4 text-[10.5px] text-[#667085]">
                    <button
                      type="button"
                      onClick={() =>
                        setLikedIds((current) => ({ ...current, [post.id]: !current[post.id] }))
                      }
                      className={`inline-flex cursor-pointer items-center gap-1 ${
                        liked ? "font-semibold text-[#C8643B]" : ""
                      }`}
                    >
                      <Heart size={11} fill={liked ? "#C8643B" : "none"} />
                      {post.likes + (liked ? 1 : 0)}
                    </button>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle size={11} />
                      {post.replies}
                    </span>
                  </div>
                </div>
              </div>

              {post.reply && (
                <div className="mt-2 flex gap-2.5">
                  <div className="flex w-7 shrink-0 justify-center">
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-[#D6E8DF] text-[10px] font-bold text-[#0F4C3A]">
                      {post.reply.avatar}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="font-bold text-[#101828]">
                        {post.reply.author}{" "}
                        <span className="font-medium text-[#667085]">· {post.reply.badge}</span>
                      </span>
                      <span className="text-[10px] text-[#98A2B3]">{post.reply.timeLabel}</span>
                    </div>
                    <p className="mt-0.5 text-[11.5px] leading-[1.4] text-[#344054]">
                      {post.reply.text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
