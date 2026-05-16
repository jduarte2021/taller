export const TOKEN_SECRET = process.env.TOKEN_SECRET;

if (!TOKEN_SECRET) {
    throw new Error('[ERROR] TOKEN_SECRET no está definido en las variables de entorno. Agrégalo en Render > Environment.');
}
