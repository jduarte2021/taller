export const TOKEN_SECRET = process.env.TOKEN_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('TOKEN_SECRET no está definido en las variables de entorno');
    }
    console.warn('[WARN] TOKEN_SECRET no definido — usando valor de desarrollo. NO usar en producción.');
    return 'dev_secret_local';
})();