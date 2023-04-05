import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastify from 'fastify';
// import ws from '@fastify/websocket';
import type { FastifyCookieOptions } from '@fastify/cookie';
import cookie from '@fastify/cookie';
import { env } from '../../env.mjs';
import { appRouter } from './root';
import { createTRPCContext } from './fastify_trpc.js';

import dotenv from "dotenv";
dotenv.config();

export interface ServerOptions {
    dev?: boolean;
    port?: number;
    prefix?: string;
}



export function createServer(opts: ServerOptions) {
    const dev = opts.dev ?? true;
    const port = opts.port ?? 3000;
    const prefix = opts.prefix ?? '/trpc';
    const server = fastify({ maxParamLength: 5000, logger: dev });

    // void server.register(ws);

    void server.register(cookie, {
        secret: env.NEXTAUTH_SECRET, // for cookies signature
        parseOptions: {
            signed: true,
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: true,
            domain: `.${env.DOMAIN_NAME}`
        }     // options for parsing cookies
    } as FastifyCookieOptions)

    void server.register(fastifyTRPCPlugin, {
        prefix,
        // useWSS: true,
        trpcOptions: { router: appRouter, createContext: createTRPCContext },

    });

    server.get('/', () => {
        return { message: 'Server Running...' };
    });
    const stop = async () => {
        await server.close();
    };
    const start = async () => {
        try {
            await server.listen({ port });
            console.log(`Server running on http://localhost:${port}`);
        } catch (err) {
            server.log.error(err);
            process.exit(1);
        }
    };

    return { server, start, stop };
}


const serverConfig: ServerOptions = {
    dev: false,
    port: parseInt(env.PORT || "2022"),
    prefix: '/trpc',
};


const server = createServer(serverConfig);
void server.start();