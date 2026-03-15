import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, MessageCircle, MoreVertical, Edit2, Trash2, Send } from 'lucide-react';

export default function HealthBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create / Edit modal state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, title: '', content: '' });

  // Comments state
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  // Current User Info for authorization
  const currentUserEmail = localStorage.getItem("email"); // Fallback if needed, but best if we decode token or store user Id. We will compare by email for now if possible, else just let backend handle 403.
  const [userMap, setUserMap] = useState({}); // Optional: store current user details 

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/blog/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = formData.id 
        ? `http://localhost:8080/api/blog/post/${formData.id}`
        : 'http://localhost:8080/api/blog/post';
      
      const method = formData.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content
        })
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ id: null, title: '', content: '' });
        fetchPosts();
      } else {
        alert("Failed to save post. You might not be authorized.");
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/blog/post/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchPosts();
      } else {
        alert("Failed to delete. You might not be authorized.");
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLike = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/blog/post/${id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchPosts(); // Refresh likes
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const toggleComments = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    
    setExpandedPostId(postId);
    try {
      const response = await fetch(`http://localhost:8080/api/blog/post/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(prev => ({ ...prev, [postId]: data }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/blog/post/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      });

      if (response.ok) {
        const addedComment = await response.json();
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), addedComment]
        }));
        setNewComment('');
      } else {
        alert("Failed to add comment. Please log in.");
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) return <div className="page-content user-bg"><p style={{textAlign:'center', marginTop:'50px'}}>Loading Community Blog...</p></div>;

  return (
    <div className="section" style={{ paddingBottom: '30px' }}>
      <div className="section-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen color="#3b82f6" />
          <span>Health Blog</span>
        </div>
        <button 
          onClick={() => {
            setFormData({ id: null, title: '', content: '' });
            setShowForm(!showForm);
          }}
          className="modern-btn primary" 
          style={{ width: 'auto', padding: '8px 16px', fontSize: '14px' }}
        >
          {showForm ? 'Cancel' : 'Write Post'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            {formData.id ? 'Edit Post' : 'Create New Post'}
          </h3>
          <form className="form-row" onSubmit={handleSavePost}>
            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Share your health journey, tips, or questions..."
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea 
                className="form-input"
                rows="5"
                placeholder="Write your post here..."
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowForm(false)} className="modern-btn" style={{ background: '#f1f5f9', color: '#475569', width: 'auto' }}>Cancel</button>
              <button type="submit" className="modern-btn primary" style={{ width: 'auto' }}>
                {formData.id ? 'Update Post' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <BookOpen size={48} color="#cbd5e1" style={{marginBottom:'16px'}} />
            <p>No posts yet. Be the first to share your health journey!</p>
          </div>
        ) : (
          posts.map(post => {
            // Determine if current user is author (using simple email check for UI purposes - backend enforces actual security)
            const isAuthor = currentUserEmail === post.author.email; 

            return (
              <div key={post.id} style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '16px', background: '#eff6ff', color: '#3b82f6' }}>
                      {post.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{post.author.name}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  
                  {isAuthor && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => { setFormData(post); setShowForm(true); }}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                        title="Edit Post"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>{post.title}</h2>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <button 
                    onClick={() => handleLike(post.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                  >
                    <Heart size={18} color={post.likes > 0 ? '#ef4444' : '#94a3b8'} fill={post.likes > 0 ? '#ef4444' : 'none'} />
                    {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                  >
                    <MessageCircle size={18} />
                    Comments
                  </button>
                </div>

                {/* Comments Section */}
                {expandedPostId === post.id && (
                  <div style={{ marginTop: '20px', background: '#f8fafc', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                      {(!comments[post.id] || comments[post.id].length === 0) ? (
                        <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', margin: '10px 0' }}>No comments yet. Be the first!</p>
                      ) : (
                        comments[post.id].map(comment => (
                          <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                            <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px', minWidth: '32px', background: '#e2e8f0' }}>
                              {comment.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', flex: 1, border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{comment.user.name}</span>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatDate(comment.createdAt)}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>{comment.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <form onSubmit={(e) => handleAddComment(e, post.id)} style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Write a comment..." 
                        style={{ flex: 1, padding: '10px 14px', fontSize: '14px', borderRadius: '20px' }}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button type="submit" className="modern-btn primary" style={{ width: 'auto', padding: '10px 16px', borderRadius: '20px' }} disabled={!newComment.trim()}>
                        <Send size={16} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
