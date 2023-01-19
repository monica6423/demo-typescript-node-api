import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import prisma from "../database";
import { headers } from "../constants";

export const getCompanies: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const parentCompanies = event.queryStringParameters?.parent;
  if (parentCompanies === "true") {
    const result = await prisma.company.findMany({
      where: {
        parentCompanyId: null,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers,
    };
  }

  const result = await prisma.company.findMany();

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers,
  };
};
