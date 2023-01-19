import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { Prisma } from "@prisma/client";
import prisma from "../database";
import { parseQueryParams } from "../utils";
import { headers } from "../constants";

export const getRestaurants: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const args = parseQueryParams(event.queryStringParameters || {});
  const searchValue = event.queryStringParameters?.searchValue;

  if (searchValue) {
    const multiResult = await Promise.all([
      await prisma.restaurant.findMany({
        where: {
          company: {
            name: {
              contains: searchValue,
              mode: "insensitive",
            },
          },
        },
        include: {
          company: true,
          restaurantType: true,
        },
        orderBy: {
          name: Prisma.SortOrder.asc,
        },
      }),
      await prisma.restaurant.findMany({
        where: {
          restaurantType: {
            name: {
              contains: searchValue,
              mode: "insensitive",
            },
          },
        },
        include: {
          company: true,
          restaurantType: true,
        },
        orderBy: {
          name: Prisma.SortOrder.asc,
        },
      }),
      await prisma.restaurant.findMany({
        where: {
          name: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
        include: {
          company: true,
          restaurantType: true,
        },
        orderBy: {
          name: Prisma.SortOrder.asc,
        },
      }),
    ]);

    const flatMultiResult = multiResult.flat();

    const getUniqueArray = (inputArray: Record<string, string>[]) => {
      const unique: Record<string, Record<string, string>> = {};
      inputArray.forEach((item: Record<string, string>) => {
        unique[item.id] = item;
      });
      return Object.values(unique);
    };
    const uniqueArray = getUniqueArray(flatMultiResult as any);

    return {
      statusCode: 200,
      body: JSON.stringify(uniqueArray),
      headers,
    };
  }

  const result = await prisma.restaurant.findMany({
    ...args,
    include: {
      company: true,
      restaurantType: true,
    },
    orderBy: {
      name: Prisma.SortOrder.asc,
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers,
  };
};
