import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import prisma from "../database";
import { parseQueryParams } from "../utils";
import { headers } from "../constants";
import { z } from "zod";

export const requestQuerySchema = z.object({
  id: z.string().uuid().optional(),
});

export const getRestaurantsByCompanyId: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const args = parseQueryParams(event.queryStringParameters || {});

  const parsedQuery = requestQuerySchema.safeParse(
    event.queryStringParameters || {}
  );
  if (!parsedQuery.success) {
    console.error(
      `Request parsing failed. Error: ${parsedQuery.error.message}.`
    );
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body." }),
      headers,
    };
  }

  const { id } = parsedQuery.data;

  const result = await prisma.restaurant.findMany({
    where: { OR: [{ companyId: id }, { company: { parentCompanyId: id } }] },
    include: {
      restaurantType: true,
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers,
  };
};
