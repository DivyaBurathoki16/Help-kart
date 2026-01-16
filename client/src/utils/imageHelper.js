export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('data:')) return path; // Base64
    if (path.startsWith('http')) return path; // External URL

    // Handle relative paths (legacy file storage)
    // Ensure we don't double slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:5000${cleanPath}`;
};
