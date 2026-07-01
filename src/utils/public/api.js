const DEFAULT_API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8373/api'
    : 'https://server.finfiler.com/api';

const API_BASE = process.env.REACT_APP_API_BASE || DEFAULT_API_BASE;

export const getServerOrigin = () => API_BASE.replace(/\/api\/?$/, '');

export async function apiGet(endpoint) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  return response;
}

export async function fetchServices({ pageNo = 1, limit = 100, search = '', type = '' } = {}) {
  const params = new URLSearchParams({
    page_no: String(pageNo),
    limit: String(limit),
    search,
    type,
  });
  const response = await apiGet(`/services/list?${params.toString()}`);
  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Failed to load services');
  }

  return body.data;
}

export async function fetchServiceDetails(serviceId) {
  const response = await apiGet(`/services/details/${encodeURIComponent(serviceId)}`);
  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Service not found');
  }

  return body.data;
}

export async function fetchBlogs({ page = 1, limit = 10, search = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
  });
  const response = await apiGet(`/blogs/list?${params.toString()}`);
  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Failed to load blogs');
  }

  return body.data;
}

export async function fetchBlogById(blogId) {
  const data = await fetchBlogs({ page: 1, limit: 100 });
  const blog = data.blogs?.find(b => b.blog_id === blogId);
  if (!blog) throw new Error('Blog not found');
  return blog;
}
