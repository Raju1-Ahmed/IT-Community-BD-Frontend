import { useEffect, useState } from "react";
import { ImagePlus, Loader2, MessageCircle, Pencil, SendHorizontal, ThumbsUp, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
const POST_PREVIEW_LIMIT = 220;

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

const buildPostPreview = (text = "", expanded = false) => {
  const content = String(text || "");
  if (expanded || content.length <= POST_PREVIEW_LIMIT) {
    return { text: content, truncated: false };
  }

  return {
    text: `${content.slice(0, POST_PREVIEW_LIMIT).trimEnd()}...`,
    truncated: true
  };
};

const SeekerMyProfile = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [composerText, setComposerText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [editingPostId, setEditingPostId] = useState("");
  const [editingText, setEditingText] = useState("");
  const [editingAttachments, setEditingAttachments] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [posting, setPosting] = useState(false);
  const [busyPostId, setBusyPostId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const profileImageUrl = user?.profileImage ? toAbsoluteUrl(user.profileImage) : "";

  const loadPosts = async () => {
    setLoadingPosts(true);
    setErrorMessage("");
    try {
      const { data } = await api.get("/forum/posts?author=me", { meta: { skipLoader: true } });
      setPosts(Array.isArray(data?.posts) ? data.posts : []);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to load your posts.");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleComposerFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setAttachments((current) => [...current, ...files]);
    event.target.value = "";
  };

  const removeAttachment = (targetName) => {
    setAttachments((current) => current.filter((file) => `${file.name}-${file.size}` !== targetName));
  };

  const handleEditingFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setEditingAttachments((current) => [...current, ...files]);
    event.target.value = "";
  };

  const removeEditingAttachment = (targetKey) => {
    setEditingAttachments((current) =>
      current.filter((item) => {
        if (item instanceof File) {
          return `${item.name}-${item.size}` !== targetKey;
        }
        return item.url !== targetKey;
      })
    );
  };

  const handleCreatePost = async () => {
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
          attachments: uploadedAttachments
        },
        { meta: { skipLoader: true } }
      );

      if (data?.post) {
        setPosts((current) => [data.post, ...current]);
        setComposerText("");
        setAttachments([]);
        setSuccessMessage("Post published on your profile.");
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to publish your post.");
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    setBusyPostId(postId);
    setErrorMessage("");
    try {
      await api.delete(`/forum/posts/${postId}`, { meta: { skipLoader: true } });
      setPosts((current) => current.filter((post) => post.id !== postId));
      if (editingPostId === postId) {
        setEditingPostId("");
        setEditingText("");
        setEditingAttachments([]);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to delete your post.");
    } finally {
      setBusyPostId("");
    }
  };

  const startEditing = (post) => {
    setEditingPostId(post.id);
    setEditingText(post.content || "");
    setEditingAttachments(Array.isArray(post.attachments) ? post.attachments : []);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleUpdatePost = async (postId) => {
    if (!editingText.trim()) {
      setErrorMessage("Post content cannot be empty.");
      return;
    }

    setBusyPostId(postId);
    setErrorMessage("");
    try {
      const uploadedAttachments = [];

      for (const item of editingAttachments) {
        if (!(item instanceof File)) {
          uploadedAttachments.push(item);
          continue;
        }

        const formData = new FormData();
        formData.append("attachment", item);

        const { data: uploadData } = await api.post("/forum/attachments", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          meta: { skipLoader: true }
        });

        if (uploadData?.attachment) {
          uploadedAttachments.push(uploadData.attachment);
        }
      }

      const { data } = await api.patch(
        `/forum/posts/${postId}`,
        {
          content: editingText.trim(),
          attachments: uploadedAttachments
        },
        { meta: { skipLoader: true } }
      );

      if (data?.post) {
        setPosts((current) => current.map((post) => (post.id === postId ? data.post : post)));
        setEditingPostId("");
        setEditingText("");
        setEditingAttachments([]);
        setSuccessMessage("Post updated.");
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to update your post.");
    } finally {
      setBusyPostId("");
    }
  };

  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="relative h-52 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.30),_transparent_38%),linear-gradient(135deg,_#0f172a_0%,_#1e293b_45%,_#0f766e_100%)] sm:h-60">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt={user?.name || "Profile cover"} className="absolute inset-0 h-full w-full object-cover opacity-20 blur-[1px]" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-950/55" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <div className="h-24 w-24 overflow-hidden rounded-3xl border-4 border-white/80 bg-white shadow-lg sm:h-28 sm:w-28">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt={user?.name || "Profile"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-emerald-600 text-3xl font-bold text-white">
                      {getInitials(user?.name || "U")}
                    </div>
                  )}
                </div>
                <div className="pb-1 text-white">
                  <p className="text-2xl font-bold tracking-tight sm:text-3xl">{user?.name || "Your profile"}</p>
                  <p className="mt-1 text-sm text-white/80 sm:text-base">{user?.currentPosition || "Professional title"}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-emerald-200">
                    {user?.jobCategory || "Job seeker profile"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to="/seeker-profile" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Edit Profile
                </Link>
                <Link to="/seeker-resume" className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                  My Resume
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
          <StatCard label="Posts" value={posts.length} />
          <StatCard label="Projects" value={Array.isArray(user?.projects) ? user.projects.length : 0} />
          <StatCard label="Skills" value={Array.isArray(user?.skills) ? user.skills.length : 0} />
        </div>
      </article>

      <article className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
            {getInitials(user?.name || "IT")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <input
                value={composerText}
                onChange={(event) => setComposerText(event.target.value)}
                disabled={posting}
                placeholder="Share an update, achievement, work sample, or quick thought."
                className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-sm outline-none transition focus:border-emerald-300 focus:bg-white"
              />

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <label className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 ${posting ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-slate-50"}`}>
                  <ImagePlus size={15} />
                  Add file
                  <input type="file" multiple className="hidden" onChange={handleComposerFiles} disabled={posting} />
                </label>

                <button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={posting}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {posting ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-4">
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
                    onClick={() => removeAttachment(`${file.name}-${file.size}`)}
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
        </div>
      </article>

      <section className="space-y-4">
        {loadingPosts ? (
          [...Array(3)].map((_, index) => (
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
            </div>
          ))
        ) : null}

        {!loadingPosts && posts.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">No posts yet</h3>
            <p className="mt-2 text-sm text-slate-500">Your updates, work samples, and career posts will appear here.</p>
          </div>
        ) : null}

        {posts.map((post) => {
          const preview = buildPostPreview(post.content, expandedPosts[post.id]);

          return (
            <article key={post.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt={user?.name || "Profile"} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                      {getInitials(user?.name || "U")}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user?.name || "You"}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {user?.currentPosition || "Community member"} {" - "} {formatRelativeTime(post.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(post)}
                    disabled={busyPostId === post.id}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    disabled={busyPostId === post.id}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                  >
                    {busyPostId === post.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    Delete
                  </button>
                </div>
              </div>

              {editingPostId === post.id ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={editingText}
                    onChange={(event) => setEditingText(event.target.value)}
                    className="h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none"
                  />
                  <div className="flex flex-wrap gap-3">
                    {editingAttachments.map((attachment) => {
                      const key = attachment instanceof File ? `${attachment.name}-${attachment.size}` : attachment.url;
                      const label = attachment instanceof File ? attachment.name : attachment.name;
                      return (
                        <div key={key} className="min-w-[180px] rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-700">{label}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                {attachment instanceof File ? "New file" : "Current attachment"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeEditingAttachment(key)}
                              className="text-xs font-semibold text-slate-400 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <ImagePlus size={15} />
                      Change image or file
                      <input type="file" multiple className="hidden" onChange={handleEditingFiles} />
                    </label>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPostId("");
                        setEditingText("");
                        setEditingAttachments([]);
                      }}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdatePost(post.id)}
                      disabled={busyPostId === post.id}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {busyPostId === post.id ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{preview.text}</p>
                  {(preview.truncated || expandedPosts[post.id]) ? (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedPosts((current) => ({ ...current, [post.id]: !current[post.id] }))
                      }
                      className="mt-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      {expandedPosts[post.id] ? "See less" : "See more"}
                    </button>
                  ) : null}
                </div>
              )}

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

              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <ThumbsUp size={15} />
                  {post.reactionSummary?.total || 0} likes
                </span>
                <span className="inline-flex items-center gap-2">
                  <MessageCircle size={15} />
                  {post.commentCount || 0} comments
                </span>
                <span>{post.shareCount || 0} shares</span>
              </div>

              {Array.isArray(post.reactionUsers) && post.reactionUsers.length ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Liked by</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {post.reactionUsers.map((reaction) => (
                      <span
                        key={`${post.id}-reaction-${reaction.id}-${reaction.type}`}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {reaction.user?.name || "Community member"}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {Array.isArray(post.comments) && post.comments.length ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Comments</p>
                  <div className="mt-3 space-y-3">
                    {post.comments.map((comment) => (
                      <div key={`${post.id}-comment-${comment.id}`} className="rounded-2xl bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">{comment.author?.name || "Community member"}</p>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                            {formatRelativeTime(comment.createdAt)}
                          </p>
                        </div>
                        <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </section>
  );
};

const StatCard = ({ label, value }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
  </div>
);

export default SeekerMyProfile;
