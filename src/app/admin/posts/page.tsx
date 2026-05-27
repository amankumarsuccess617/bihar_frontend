'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from "@/providers/AuthProvider";

interface Post {
  id: number;
  recruitmentId: number;
  code: string;
  name: string;
  vacancies: number;
  formSchema?: any;
  isActive: boolean;
  createdAt: string;
}

interface Recruitment {
  id: number;
  title: string;
  code: string;
}

export default function PostsPage() {
  const router = useRouter();

  const { token, user, ready } = useAuth();

const isAdmin =
  user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

//   const [token, setToken] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);

  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [formData, setFormData] = useState({
    recruitmentId: '',
    code: '',
    name: '',
    vacancies: 0,
  });

  // =========================
  // AUTH CHECK
  // =========================

//   useEffect(() => {
//     const storedToken = localStorage.getItem('token');

//     if (!storedToken) {
//       router.push('/login');
//       return;
//     }

//     setToken(storedToken);
//   }, [router]);

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
  if (!ready) return;

  if (!token || !user) {
    router.replace("/login");
    return;
  }

  if (!isAdmin) {
    router.replace("/candidate");
    return;
  }

  fetchPosts();
  fetchRecruitments();
}, [ready, token, user, isAdmin]);

  // =========================
  // FETCH POSTS
  // =========================

  const fetchPosts = async () => {
    try {
      setLoading(true);

   console.log("TOKEN =>", token);

const res = await fetch('http://localhost:5000/api/posts', {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

     if (!res.ok) {
  const errText = await res.text();
  console.log("POST API ERROR =>", errText);

  throw new Error(`Failed: ${res.status}`);
}
      const data = await res.json();

      setPosts(Array.isArray(data) ? data : data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching posts');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH RECRUITMENTS
  // =========================

  const fetchRecruitments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/recruitments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch recruitments');
      }

      const data = await res.json();

      setRecruitments(Array.isArray(data) ? data : data.recruitments || []);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // CREATE / UPDATE POST
  // =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');

const method = editingPost ? 'PATCH' : 'POST';
      const url = editingPost
        ? `http://localhost:5000/api/posts/${editingPost.id}`
        : `http://localhost:5000/api/posts/recruitment/${formData.recruitmentId}`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          vacancies: Number(formData.vacancies),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);

        throw new Error(
          errorData?.message || 'Failed to save post'
        );
      }

      setShowForm(false);

      setEditingPost(null);

      setFormData({
        recruitmentId: '',
        code: '',
        name: '',
        vacancies: 0,
      });

      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving post');
    }
  };

  // =========================
  // EDIT POST
  // =========================

  const handleEdit = (post: Post) => {
    setEditingPost(post);

    setFormData({
      recruitmentId: post.recruitmentId.toString(),
      code: post.code,
      name: post.name,
      vacancies: post.vacancies,
    });

    setShowForm(true);
  };

  // =========================
  // DELETE POST
  // =========================

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this post?'
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to delete post');
      }

      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting post');
    }
  };


  // =========================
// TOGGLE POST STATUS
// =========================

const togglePostStatus = async (
  id: number
) => {

  try {

    const res = await fetch(
      `http://localhost:5000/api/posts/${id}/toggle`,
      {
        method: 'PATCH',

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(
        'Failed to update post status'
      );
    }

    fetchPosts();

  } catch (err) {

    setError(
      err instanceof Error
        ? err.message
        : 'Error updating post status'
    );
  }
};
  // =========================
  // LOADING
  // =========================

if (!ready) {
  return (
    <div className="p-6 text-center">
      Loading...
    </div>
  );
}

if (!token || !user) {
  return null;
}

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading...
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Job Posts
          </h1>

          <p className="text-gray-600">
            Manage job postings and application forms
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPost(null);

            setFormData({
              recruitmentId: '',
              code: '',
              name: '',
              vacancies: 0,
            });

            setShowForm(!showForm);
          }}
          className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ New Post'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">

              {/* Recruitment */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Recruitment Cycle
                </label>

                <select
                  value={formData.recruitmentId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recruitmentId: e.target.value,
                    })
                  }
                  required
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option value="">
                    Select Recruitment
                  </option>

                  {recruitments.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Code */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Post Code
                </label>

                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value,
                    })
                  }
                  required
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>

              {/* Name */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Post Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  required
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>

              {/* Vacancies */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vacancies
                </label>

                <input
                  type="number"
                  value={formData.vacancies}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vacancies: Number(e.target.value),
                    })
                  }
                  required
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                {editingPost ? 'Update Post' : 'Save Post'}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Code
              </th>

              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Post Name
              </th>

              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Recruitment
              </th>

              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Vacancies
              </th>

              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-6 py-3 text-sm text-gray-900">
                  {post.code}
                </td>

                <td className="px-6 py-3 text-sm text-gray-900">
                  {post.name}
                </td>

                <td className="px-6 py-3 text-sm text-gray-600">
                  {
                    recruitments.find(
                      (r) => r.id === post.recruitmentId
                    )?.title
                  }
                </td>

                <td className="px-6 py-3 text-sm text-gray-900">
                  {post.vacancies}
                </td>

                <td className="px-6 py-3 text-sm">
                <div className="flex gap-3">

  <Link
    href={`/admin/posts/${post.id}/form`}
    className="text-blue-600 hover:text-blue-900"
  >
    Form Builder
  </Link>

  <button
    onClick={() => handleEdit(post)}
    className="text-green-600 hover:text-green-900"
  >
    Edit
  </button>

  <button
    onClick={() =>
      togglePostStatus(post.id)
    }
    className={
      post.isActive
        ? "text-orange-600 hover:text-orange-900"
        : "text-emerald-600 hover:text-emerald-900"
    }
  >
    {post.isActive
      ? "Disable"
      : "Enable"}
  </button>

  <button
    onClick={() =>
      handleDelete(post.id)
    }
    className="text-red-600 hover:text-red-900"
  >
    Delete
  </button>

</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No posts found. Create your first post!
          </div>
        )}
      </div>
    </div>
  );
}