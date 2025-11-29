'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type ApiComment = {
    id: string;
    content: string;
    createdAt: string;
    parentId: string | null;
    incidentId: string;
    userId: string;
    firstName: string;
    lastName: string;
    deletedAt: string | null;
};

function buildTree(comments: ApiComment[]) {
    const byId = new Map<string, ApiComment & { replies: ApiComment[] }>();
    comments.forEach((c) => byId.set(c.id, { ...c, replies: [] }));
    const roots: (ApiComment & { replies: ApiComment[] })[] = [];
    byId.forEach((c) => {
        if (c.parentId && byId.has(c.parentId)) {
            byId.get(c.parentId)!.replies.push(c);
        } else {
            roots.push(c);
        }
    });
    return roots;
}

export function Comments({ incidentId }: { incidentId: string }) {
    const [comments, setComments] = useState<ApiComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const replyInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Fetch current user ID from session or API
        fetch('/api/auth/me').then(async (res) => {
            if (res.ok) {
                const data = await res.json();
                setCurrentUserId(data.user?.id || null);
            }
        }).catch(() => { });
    }, []);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/incidents/${incidentId}/comments`, { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load comments');
            // normalize dates to string
            const normalized = (data.comments || []).map((c: any) => ({
                ...c,
                createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date(c.createdAt).toISOString(),
            }));
            setComments(normalized);
        } catch (e: any) {
            setError(e.message || 'Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [incidentId]);

    const tree = useMemo(() => buildTree(comments), [comments]);

    const post = async (text: string, parentId?: string | null) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const body: any = { content: trimmed };
        if (parentId) body.parentId = parentId;
        try {
            const res = await fetch(`/api/incidents/${incidentId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to post comment');
            if (!parentId) {
                // only clear main input for top-level comment
                setContent('');
            }
            setReplyTo(null);
            await load();
        } catch (e: any) {
            setError(e.message || 'Failed to post comment');
        }
    };

    const deleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            const res = await fetch(`/api/incidents/${incidentId}/comments/${commentId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete comment');
            await load();
        } catch (e: any) {
            setError(e.message || 'Failed to delete comment');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Comments</h3>

            {/* New comment */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                    type="button"
                    onClick={() => post(content, null)}
                    disabled={!content.trim()}
                    className="px-4 py-2 bg-green-700 text-white rounded-lg disabled:opacity-50"
                >
                    Comment
                </button>
            </div>

            {error && <p className="text-sm text-red-600">⚠️ {error}</p>}
            {loading && <p className="text-sm text-gray-500">Loading comments…</p>}

            {/* Comments tree */}
            <div className="space-y-4">
                {tree.map((c) => (
                    <CommentNode
                        key={c.id}
                        node={c}
                        onReply={(id) => {
                            setReplyTo(id);
                            setTimeout(() => replyInputRef.current?.focus(), 0);
                        }}
                        onSubmitReply={async (id, value) => {
                            await post(value, id);
                        }}
                        onDelete={deleteComment}
                        currentUserId={currentUserId}
                        replyTo={replyTo}
                        replyInputRef={replyInputRef}
                    />
                ))}
            </div>
        </div>
    );
}

function CommentNode({
    node,
    onReply,
    onSubmitReply,
    onDelete,
    currentUserId,
    replyTo,
    replyInputRef,
}: {
    node: ApiComment & { replies: ApiComment[] };
    onReply: (id: string) => void;
    onSubmitReply: (id: string, value: string) => Promise<void>;
    onDelete: (id: string) => void;
    currentUserId: string | null;
    replyTo: string | null;
    replyInputRef: React.RefObject<HTMLInputElement | null>;
}) {
    const [replyValue, setReplyValue] = useState('');
    const isDeleted = !!node.deletedAt;
    const isAuthor = currentUserId === node.userId;

    return (
        <div className="border border-gray-100 rounded-lg p-4 relative">
            <div className="mb-2 flex items-start justify-between gap-4">
                <p className="text-sm text-gray-900 break-words flex-1 min-w-0">
                    <span className="font-semibold break-words">
                        {isDeleted ? '[deleted]' : `${node.firstName} ${node.lastName}`}
                    </span>
                    <span className="text-gray-400"> · {new Date(node.createdAt).toLocaleString()}</span>
                </p>
                <div className="flex gap-2 flex-shrink-0">
                    {!isDeleted && (
                        <button
                            className="text-xs text-green-700 hover:text-green-900 underline"
                            onClick={() => onReply(node.id)}
                        >
                            Reply
                        </button>
                    )}
                    {!isDeleted && isAuthor && (
                        <button
                            className="text-xs text-red-600 hover:text-red-800 underline"
                            onClick={() => onDelete(node.id)}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
            <p className="text-sm break-words whitespace-pre-wrap" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word', color: isDeleted ? '#9ca3af' : '#1f2937', fontStyle: isDeleted ? 'italic' : 'normal' }}>
                {isDeleted ? '[comment deleted]' : node.content}
            </p>

            {replyTo === node.id && (
                <div className="flex gap-2 mt-3">
                    <input
                        ref={replyInputRef}
                        type="text"
                        value={replyValue}
                        onChange={(e) => setReplyValue(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                        type="button"
                        onClick={async () => {
                            const trimmed = replyValue.trim();
                            if (!trimmed) return;
                            await onSubmitReply(node.id, trimmed);
                            setReplyValue('');
                        }}
                        disabled={!replyValue.trim()}
                        className="px-3 py-2 bg-green-700 text-white rounded-lg disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            )}

            {node.replies?.length > 0 && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100">
                    {node.replies.map((r) => (
                        <CommentNode
                            key={r.id}
                            node={{ ...r, replies: (r as any).replies || [] }}
                            onReply={onReply}
                            onSubmitReply={onSubmitReply}
                            onDelete={onDelete}
                            currentUserId={currentUserId}
                            replyTo={replyTo}
                            replyInputRef={replyInputRef}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Comments;
