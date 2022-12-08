import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import prisma from "../database";
import { parseQueryParams } from "../utils";
import { headers } from "../constants";

export const getStations: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const args = parseQueryParams(event.queryStringParameters || {});

  const result = await prisma.station.findMany({
    ...args,
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
