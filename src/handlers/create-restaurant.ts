import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import prisma from "../database";
import { headers } from "../constants";
import { z } from "zod";
import { RestaurantStatus } from "@prisma/client";

export const requestBodySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  companyId: z.string(),
  restaurantTypeId: z.string(),
  status: z.enum([RestaurantStatus.Available, RestaurantStatus.TemporaryClose]),
});

export const createRestaurant: APIGatewayProxyHandler = async (
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

  const { id, name, companyId, restaurantTypeId, status } = parsedBody.data;
  const result = await prisma.restaurant.upsert({
    where: { id },
    update: {
      name,
      companyId,
      restaurantTypeId,
      status,
    },
    create: {
      name,
      companyId,
      restaurantTypeId,
      status,
    },
    include: {
      company: true,
      restaurantType: true,
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers,
  };
};
