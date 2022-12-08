import { z } from 'zod';
import { APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import prisma from '../database';
import { headers } from '../constants';

export const requestBodySchema = z.object({
  method: z.string(),
  model: z.string(),
  query: z.object({}).passthrough().optional(),
});

// RPC endpoint for development purposes, do not deploy to production
export const rpc: APIGatewayProxyHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Request body is required.' }),
      headers,
    };
  }

  const parsedBody = requestBodySchema.safeParse(JSON.parse(event.body));
  if (!parsedBody.success) {
    console.error(`Request parsing failed. Error: ${parsedBody.error.message}.`);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body.' }),
      headers,
    };
  }

  const { model, method, query } = parsedBody.data;

  const result = await (prisma as any)[model][method](query ? query : {});

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers,
  };
};
