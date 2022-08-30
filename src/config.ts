export const appConfig = {
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY as string,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY as string,
    MONGO_URL: process.env.MONGO_URL as string,
    MINIO_HOST: process.env.MINIO_HOST as string,
    MINIO_PORT: Number(process.env.MINIO_PORT),
    MINIO_BUCKET: process.env.MINIO_BUCKET || 'image-storage',
    MINIO_REGION: process.env.MINIO_REGION || 'us-east-1'
}

export const checkMissingConfig = (config: Record<string, any>) => {
    for (let key in config) {
        if (!config[key]) {
            throw new Error(`Missing env ${key}`)
        }
    }
}