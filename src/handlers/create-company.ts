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
  parentCompanyId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (!val?.length ? null : val)),
});

export const createCompany: APIGatewayProxyHandler = async (
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

  const { id, name, parentCompanyId } = parsedBody.data;
  const result = await prisma.company.upsert({
    where: { id },
    update: {
      name,
      parentCompanyId,
    },
    create: {
      ...parsedBody.data,
    },
  });
  // const result = await prisma.company.create({ data: { ...parsedBody.data } });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers,
  };
};
