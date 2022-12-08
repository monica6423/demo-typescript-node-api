import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { Prisma } from "@prisma/client";
import prisma from "../database";
import { headers } from "../constants";
import { z } from "zod";

export const requestBodySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  maxPower: z
    .string()
    .transform((val) => parseInt(val))
    .or(z.number()),
});

export const createStationType: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Request body is required." }),
      headers,
    };
  }

  const parsedBody = requestBodySchema.safeParse(JSON.parse(event.body));
  if (!parsedBody.success) {
    console.error(
      `Request parsing failed. Error: ${parsedBody.error.message}.`
    );
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body." }),
      headers,
    };
  }

  const { id, name, maxPower } = parsedBody.data;

  const result = await prisma.stationType.upsert({
    where: { id },
    update: {
      name,
      maxPower,
    },
    create: {
      ...parsedBody.data,
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers,
  };
};
