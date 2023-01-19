import { RestaurantStatus } from "@prisma/client";
import prisma from "../database";

const restaurantTypes: { name: string; franchiseFee: number }[] = [
  { name: "Basic", franchiseFee: 20 },
  { name: "Medium", franchiseFee: 40 },
  { name: "Premium", franchiseFee: 80 },
  { name: "Deluxe", franchiseFee: 100 },
];

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomLengthArray = (randomInt: number) =>
  Array.from({ length: randomInt }, (_, i) => i + 1);

export const main = async () => {
  console.log("Seeding database.");

  // Create restaurantTypes
  await prisma.restaurantType.createMany({ data: restaurantTypes });
  // Note: createMany doesn't return the created data: https://github.com/prisma/prisma/issues/8131
  const createdRestaurantTypes = await prisma.restaurantType.findMany();

  // Create Companies
  await Promise.all(
    randomLengthArray(randomInt(10, 30)).map(async (parentIdx) => {
      await prisma.company.create({
        data: {
          name: `Company${parentIdx}`,
          childCompanies: {
            create: randomLengthArray(randomInt(1, 3)).map((childIdx) => ({
              name: `Company${parentIdx}Child${childIdx}`,
              restaurants: {
                create: [
                  {
                    name: `Child${childIdx}Restaurant-${Math.random()
                      .toString(36)
                      .substring(2, 7)}`,
                    status: RestaurantStatus.Available,
                    restaurantType: {
                      connect: {
                        id: createdRestaurantTypes[
                          randomInt(0, restaurantTypes.length - 1)
                        ].id,
                      },
                    },
                  },
                ],
              },
            })),
          },
          restaurants: {
            create: [
              {
                name: `Company${parentIdx}Restaurant`,
                status: RestaurantStatus.Available,
                restaurantType: {
                  connect: {
                    id: createdRestaurantTypes[
                      randomInt(0, restaurantTypes.length - 1)
                    ].id,
                  },
                },
              },
            ],
          },
        },
      });
    })
  );

  console.log("Database seeding complete.");
};

if (require.main === module) {
  main().catch((error) => {
    console.trace(error);
    process.exit(1);
  });
}
