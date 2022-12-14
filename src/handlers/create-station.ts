import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import prisma from "../database";
import { headers } from "../constants";
import { z } from "zod";

export const requestBodySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  companyId: z.string(),
  stationTypeId: z.string(),
  status: z.enum(["Available", "Charging"]),
});

export const createStation: APIGatewayProxyHandler = async (
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

  const { id, name, companyId, stationTypeId, status } = parsedBody.data;
  const result = await prisma.station.upsert({
    where: { id },
    update: {
      name,
      companyId,
      stationTypeId,
      status,
    },
    create: {
      name,
      companyId,
      stationTypeId,
      status,
    },
    include: {
      company: true,
      stationType: true,
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers,
  };
};
