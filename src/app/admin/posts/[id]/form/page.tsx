'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from "@/providers/AuthProvider";
interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: string;
}

interface FormSchema {
  fields: FormField[];
}

const FIELD_TYPES = ['text', 'email', 'phone', 'number', 'date', 'select', 'textarea', 'checkbox', 'file'];

export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [post, setPost] = useState<any>(null);
  const [schema, setSchema] = useState<FormSchema>({ fields: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showNewFieldForm, setShowNewFieldForm] = useState(false);

const { token, user, ready } = useAuth();
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPost();
  }, [token, postId]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch posts');
      const posts = await res.json();
      const current = Array.isArray(posts) ? posts.find((p: any) => p.id === Number(postId)) : posts.posts?.find((p: any) => p.id === Number(postId));

      if (!current) throw new Error('Post not found');

      setPost(current);
      setSchema(current.formSchema || { fields: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching post');
    } finally {
      setLoading(false);
    }
  };

  const addField = (field: FormField) => {
    setSchema((prev) => ({
      fields: [...prev.fields, { ...field, id: Date.now().toString() }],
    }));
    setShowNewFieldForm(false);
  };

  const updateField = (id: string, field: Partial<FormField>) => {
    setSchema((prev) => ({
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...field } : f)),
    }));
  };

  const removeField = (id: string) => {
    setSchema((prev) => ({
      fields: prev.fields.filter((f) => f.id !== id),
    }));
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = schema.fields.findIndex((f) => f.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === schema.fields.length - 1)) {
      return;
    }

    const newFields = [...schema.fields];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];
    setSchema({ fields: newFields });
  };

  const saveForm = async () => {
    if (schema.fields.length === 0) {
      setError('Add at least one field');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/forms/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schema }),
      });

      if (!res.ok) throw new Error('Failed to save form');

      router.push('/admin/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving form');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!post) return <div className="p-6 text-center text-red-600">Post not found</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/posts" className="text-blue-600 hover:text-blue-900">
          ← Back to Posts
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Form Builder: {post.name}
        </h1>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Form Preview */}
        <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Application Form</h2>

          {schema.fields.length === 0 ? (
            <div className="text-center text-gray-500">
              No fields added yet. Add fields to build your form.
            </div>
          ) : (
            <div className="space-y-6">
              {schema.fields.map((field) => (
                <div key={field.id} className="rounded border border-gray-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-600"> *</span>}
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveField(field.id, 'up')}
                        className="text-gray-600 hover:text-gray-900"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveField(field.id, 'down')}
                        className="text-gray-600 hover:text-gray-900"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => setEditingField(field.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeField(field.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Field Preview */}
                  {field.type === 'text' && (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      disabled
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  )}
                  {field.type === 'email' && (
                    <input
                      type="email"
                      placeholder={field.placeholder}
                      disabled
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  )}
                  {field.type === 'textarea' && (
                    <textarea
                      placeholder={field.placeholder}
                      disabled
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  )}
                  {field.type === 'select' && (
                    <select disabled className="w-full rounded border border-gray-300 px-3 py-2">
                      <option>Select...</option>
                      {field.options?.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  {field.type === 'file' && (
                    <input
                      type="file"
                      disabled
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  )}
                  {field.type === 'checkbox' && (
                    <input
                      type="checkbox"
                      disabled
                      className="rounded border border-gray-300"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button
              onClick={saveForm}
              disabled={saving || schema.fields.length === 0}
              className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Form'}
            </button>
            <button
              onClick={() => router.push('/admin/posts')}
              className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Field Editor */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Add Fields</h2>

          {editingField ? (
            <FieldEditor
              field={schema.fields.find((f) => f.id === editingField)!}
              onSave={(updated) => {
                updateField(editingField, updated);
                setEditingField(null);
              }}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <div className="space-y-2">
              {FIELD_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    addField({
                      id: '',
                      type: type as any,
                      name: type,
                      label: `New ${type}`,
                      required: false,
                    })
                  }
                  className="w-full rounded border border-gray-300 py-2 text-left px-3 hover:bg-gray-50 capitalize"
                >
                  + {type} field
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldEditor({
  field,
  onSave,
  onCancel,
}: {
  field: FormField;
  onSave: (field: Partial<FormField>) => void;
  onCancel: () => void;
}) {
  const [edited, setEdited] = useState(field);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Label</label>
        <input
          type="text"
          value={edited.label}
          onChange={(e) => setEdited({ ...edited, label: e.target.value })}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={edited.name}
          onChange={(e) => setEdited({ ...edited, name: e.target.value })}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      {['text', 'email', 'textarea'].includes(edited.type) && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Placeholder</label>
          <input
            type="text"
            value={edited.placeholder || ''}
            onChange={(e) => setEdited({ ...edited, placeholder: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      )}

      {edited.type === 'select' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Options (comma-separated)</label>
          <textarea
            value={edited.options?.join(', ') || ''}
            onChange={(e) =>
              setEdited({ ...edited, options: e.target.value.split(',').map((s) => s.trim()) })
            }
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={edited.required}
          onChange={(e) => setEdited({ ...edited, required: e.target.checked })}
          id="required"
          className="rounded border-gray-300"
        />
        <label htmlFor="required" className="text-sm text-gray-700">
          Required field
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave(edited)}
          className="flex-1 rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 rounded border border-gray-300 px-3 py-2 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
