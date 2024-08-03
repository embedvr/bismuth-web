import { router as trpcRouter } from '$lib/trpc/router';
import { createContext as createTRPCContext } from '$lib/trpc/context';
import { resolveHTTPResponse } from '@trpc/server/http';
import type { RequestEvent } from '@sveltejs/kit';

async function trpc<Event extends RequestEvent<Partial<Record<string, string>>, string | null>>(
	event: Event
) {
	const apiEndpointUrl = '/api/trpc';
	const { request, url } = event;
	const router = trpcRouter;
	const createContext = createTRPCContext;

	const req = {
		method: request.method,
		headers: Object.fromEntries(request.headers.entries()),
		query: url.searchParams,
		body: await request.text()
	};

	const httpResponse = await resolveHTTPResponse({
		router,
		req,
		path: url.pathname.substring(apiEndpointUrl.length + 1),
		createContext: async () => createContext?.(event),
		onError: import.meta.env.DEV
			? ({ path, error }) => {
					console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
				}
			: undefined
	});

	const { status, headers, body } = httpResponse as {
		status: number;
		headers: Record<string, string>;
		body: string;
	};

	return new Response(body, { status, headers });
}

export const GET = trpc;
export const POST = trpc;
