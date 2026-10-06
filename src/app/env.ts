const endpoint = process.env.NEXT_PUBLIC_APPWRITE_HOST_URL?.trim();
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim();
const apiKey = process.env.APPWRITE_API_KEY?.trim();

if (!endpoint) {
    throw new Error("Missing NEXT_PUBLIC_APPWRITE_HOST_URL. Add it to your .env.local file.");
}

if (!projectId) {
    throw new Error("Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID. Add it to your .env.local file.");
}

if (!apiKey) {
    console.warn("APPWRITE_API_KEY is missing. Server-side Appwrite operations may fail.");
}

const env = {
    appwrite: {
        endpoint,
        projectId,
        apiKey: apiKey ?? "",
    },
};

export default env;