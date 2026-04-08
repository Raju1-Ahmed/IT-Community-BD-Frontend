import { useEffect, useMemo, useState } from "react";
import {
  ImagePlus,
  Lightbulb,
  Loader2,
  MessageCircle,
  PartyPopper,
  RefreshCcw,
  SendHorizontal,
  Share2,
  ThumbsUp,
  Trash2
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const FORUM_REACTIONS = [
  { key: "like", label: "Like", icon: ThumbsUp, activeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "insightful", label: "Insightful", icon: Lightbulb, activeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "support", label: "Support", icon: MessageCircle, activeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "celebrate", label: "Celebrate", icon: PartyPopper, activeClass: "bg-pink-50 text-pink-700 border-pink-200" }
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const toAbsoluteUrl = (url) => {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.startsWith("http")) return value;
  return `${BACKEND_ORIGIN}${value}`;
};

const formatRelativeTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
};

const ForumPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [composerText, setComposerText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busyPostId, setBusyPostId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeReactionLookup = useMemo(
    () =>
      FORUM_REACTIONS.reduce((acc, item) => {
        acc[item.key] = item;
        return acc;
      }, {}),
    []
  );

  const loadForum = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage("");

    try {
      const [metaRes, postsRes] = await Promise.all([
        api.get("/forum/meta", { meta: { skipLoader: true } }),
        api.get("/forum/posts", { meta: { skipLoader: true } })
      ]);

      setTags(Array.isArray(metaRes.data?.tags) ? metaRes.data.tags : []);
      setPosts(Array.isArray(postsRes.data?.posts) ? postsRes.data.posts : []);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to load forum feed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadForum();
  }, []);

  const handleComposerFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setAttachments((current) => [...current, ...files]);
    event.target.value = "";
  };

  const removeAttachment = (targetName) => {
    setAttachments((current) => current.filter((file) => file.name !== targetName));
  };

  const toggleTag = (tag) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag].slice(0, 4)
    );
  };

  const handleCreatePost = async () => {
    if (!user) {
      setErrorMessage("Please login to create a community post.");
      return;
    }

    if (!composerText.trim()) {
      setErrorMessage("Write something before posting.");
      return;
    }

    setPosting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const uploadedAttachments = [];

      for (const file of attachments) {
        const formData = new FormData();
        formData.append("attachment", file);

        const { data } = await api.post("/forum/attachments", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          meta: { skipLoader: true }
        });

        if (data?.attachment) {
          uploadedAttachments.push(data.attachment);
        }
      }

      const { data } = await api.post(
        "/forum/posts",
        {
          content: composerText.trim(),
          tags: selectedTags,
          attachments: uploadedAttachments
        },
        { meta: { skipLoader: true } }
      );

      if (data?.post) {
        setPosts((current) => [data.post, ...current]);
        setComposerText("");
        setSelectedTags([]);
        setAttachments([]);
        setSuccessMessage("Your post is now live in the community feed.");
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to publish the post.");
    } finally {
      setPosting(false);
    }
  };

  const updatePostInFeed = (updatedPost) => {
    setPosts((current) => current.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
  };

  const handleReaction = async (postId, type) => {
    if (!user) {
      setErrorMessage("Please login to react to a post.");
      return;
    }

    setBusyPostId(postId);
    try {
      const { data } = await api.post(
        `/forum/posts/${postId}/reactions`,
        { type },
        { meta: { skipLoader: true } }
      );
      if (data?.post) {
        updatePostInFeed(data.post);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to update reaction.");
    } finally {
      setBusyPostId("");
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!user) {
      setErrorMessage("Please login to comment on a post.");
      return;
    }

    const content = String(commentDrafts[postId] || "").trim();
    if (!content) return;

    setBusyPostId(postId);
    try {
      const { data } = await api.post(
        `/forum/posts/${postId}/comments`,
        { content },
        { meta: { skipLoader: true } }
      );
      if (data?.post) {
        updatePostInFeed(data.post);
        setCommentDrafts((current) => ({ ...current, [postId]: "" }));
        setExpandedComments((current) => ({ ...current, [postId]: true }));
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to add comment.");
    } finally {
      setBusyPostId("");
    }
  };

  const handleShare = async (postId) => {
    try {
      const shareUrl = `${window.location.origin}/forum#post-${postId}`;
      if (navigator.share) {
        await navigator.share({ title: "IT Community BD Forum", url: shareUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }

      const { data } = await api.post(`/forum/posts/${postId}/share`, {}, { meta: { skipLoader: true } });
      if (data?.post) {
        updatePostInFeed(data.post);
      }
      setSuccessMessage("Post link is ready to share.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        setErrorMessage(error?.response?.data?.message || "Failed to share this post.");
      }
    }
  };

  const handleDeletePost = async (postId) => {
    setBusyPostId(postId);
    try {
      await api.delete(`/forum/posts/${postId}`, { meta: { skipLoader: true } });
      setPosts((current) => current.filter((post) => post.id !== postId));
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to delete the post.");
    } finally {
      setBusyPostId("");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Community Forum
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Tech discussions for the Bangladesh IT community</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Share problems, post updates, ask for help, and discuss tools, hiring, freelancing, networking, cybersecurity,
              graphics, and more in one live community feed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadForum({ silent: true })}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
            Refresh Feed
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.72fr_0.28fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                {getInitials(user?.name || "IT")}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-slate-900">Create a post</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {user ? "Share a problem, update, opinion, or helpful resource with the community." : "Login to create a forum post and join the discussion."}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <textarea
                value={composerText}
                onChange={(event) => setComposerText(event.target.value)}
                disabled={!user || posting}
                placeholder="What would you like to discuss with the IT Community BD today?"
                className="min-h-[150px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-emerald-300 focus:bg-white"
              />

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    disabled={!user || posting}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selectedTags.includes(tag)
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {attachments.map((file) => (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="min-w-[180px] rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700">{file.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{Math.max(1, Math.round(file.size / 1024))} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(file.name)}
                        className="text-xs font-semibold text-slate-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
              ) : null}

              {successMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 ${user ? "cursor-pointer hover:bg-slate-50" : "cursor-not-allowed opacity-60"}`}>
                  <ImagePlus size={15} />
                  Add image or file
                  <input type="file" multiple className="hidden" onChange={handleComposerFiles} disabled={!user || posting} />
                </label>

                <button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={!user || posting}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {posting ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
                  {posting ? "Publishing..." : "Post to Community"}
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {loading ? (
              <>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-200" />
                      <div className="space-y-2">
                        <div className="h-3 w-40 rounded bg-slate-200" />
                        <div className="h-3 w-28 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="mt-4 h-4 w-11/12 rounded bg-slate-100" />
                    <div className="mt-2 h-4 w-8/12 rounded bg-slate-100" />
                    <div className="mt-5 h-40 rounded-2xl bg-slate-100" />
                  </div>
                ))}
              </>
            ) : null}

            {!loading && posts.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">No forum posts yet</h3>
                <p className="mt-2 text-sm text-slate-500">Be the first one to start a useful discussion for the community.</p>
              </div>
            ) : null}

            {posts.map((post) => {
              const visibleComments = expandedComments[post.id] ? post.comments : post.comments.slice(0, 2);

              return (
                <article
                  key={post.id}
                  id={`post-${post.id}`}
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {post.author.profileImage ? (
                        <img
                          src={toAbsoluteUrl(post.author.profileImage)}
                          alt={post.author.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                          {getInitials(post.author.name)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{post.author.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {post.author.currentPosition || post.author.companyName || "Community member"} · {formatRelativeTime(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    {post.canEdit ? (
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={busyPostId === post.id}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                      >
                        {busyPostId === post.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        Delete
                      </button>
                    ) : null}
                  </div>

                  {post.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{post.content}</p>

                  {post.attachments?.length ? (
                    <div className="mt-4 space-y-3">
                      {post.attachments.map((attachment) =>
                        attachment.mimeType?.startsWith("image/") ? (
                          <a
                            key={attachment.url}
                            href={toAbsoluteUrl(attachment.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-2xl border border-slate-200"
                          >
                            <img src={toAbsoluteUrl(attachment.url)} alt={attachment.name} className="max-h-[420px] w-full object-cover" />
                          </a>
                        ) : (
                          <a
                            key={attachment.url}
                            href={toAbsoluteUrl(attachment.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                          >
                            <ImagePlus size={15} />
                            {attachment.name}
                          </a>
                        )
                      )}
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-slate-100 py-3 text-xs font-semibold text-slate-500">
                    <span>{post.reactionSummary?.total || 0} reactions</span>
                    <span>{post.commentCount || 0} comments</span>
                    <span>{post.shareCount || 0} shares</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {FORUM_REACTIONS.map((reaction) => {
                      const Icon = reaction.icon;
                      const isActive = post.currentUserReaction === reaction.key;
                      return (
                        <button
                          key={reaction.key}
                          type="button"
                          onClick={() => handleReaction(post.id, reaction.key)}
                          disabled={busyPostId === post.id}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                            isActive ? reaction.activeClass : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Icon size={14} />
                          {reaction.label}
                          <span>{post.reactionSummary?.[reaction.key] || 0}</span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handleShare(post.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="space-y-3">
                      {visibleComments.map((comment) => (
                        <div key={comment.id} className="rounded-2xl bg-white px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-800">{comment.author.name}</p>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                              {formatRelativeTime(comment.createdAt)}
                            </p>
                          </div>
                          <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{comment.content}</p>
                        </div>
                      ))}
                    </div>

                    {post.comments.length > 2 ? (
                      <button
                        type="button"
                        onClick={() => setExpandedComments((current) => ({ ...current, [post.id]: !current[post.id] }))}
                        className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        {expandedComments[post.id] ? "Show fewer comments" : `View all ${post.comments.length} comments`}
                      </button>
                    ) : null}

                    <div className="mt-4 flex flex-col gap-3 md:flex-row">
                      <input
                        value={commentDrafts[post.id] || ""}
                        onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                        placeholder={user ? "Write a comment..." : "Login to join the discussion"}
                        disabled={!user || busyPostId === post.id}
                        className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!user || busyPostId === post.id}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyPostId === post.id ? <Loader2 size={15} className="animate-spin" /> : <SendHorizontal size={15} />}
                        Comment
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Forum topics</h2>
            <p className="mt-2 text-sm text-slate-500">Use these popular topics when starting or joining a discussion.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">How this helps</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <p>Post technical problems, recent updates, opinions, and useful resources for the community.</p>
              <p>React and comment on the same page so discussions feel fast, open, and community-driven.</p>
              <p>Share useful posts with teammates and keep helpful discussions visible across the platform.</p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default ForumPage;
