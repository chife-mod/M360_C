export const getBasePath = () => {
    return process.env.NEXT_PUBLIC_BASE_PATH || '';
};

export const getAssetPath = (path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${getBasePath()}${cleanPath}`;
};
