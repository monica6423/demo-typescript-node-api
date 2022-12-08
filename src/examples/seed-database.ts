import { ChargingStatus } from "@prisma/client";
import prisma from "../database";

const stationTypes: { name: string; maxPower: number }[] = [
  { name: "Basic", maxPower: 20 },
  { name: "Medium", maxPower: 40 },
  { name: "Premium", maxPower: 80 },
  { name: "Deluxe", maxPower: 100 },
];

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomLengthArray = (randomInt: number) =>
  Array.from({ length: randomInt }, (_, i) => i + 1);

export const main = async () => {
  console.log("Seeding database.");

  // Create StationTypes
  await prisma.stationType.createMany({ data: stationTypes });
  // Note: createMany doesn't return the created data: https://github.com/prisma/prisma/issues/8131
  const createdStationTypes = await prisma.stationType.findMany();

  // Create Companies
  await Promise.all(
    randomLengthArray(randomInt(10, 30)).map(async (parentIdx) => {
      await prisma.company.create({
        data: {
          name: `Company${parentIdx}`,
          childCompanies: {
            create: randomLengthArray(randomInt(1, 3)).map((childIdx) => ({
              name: `Company${parentIdx}Child${childIdx}`,
              stations: {
                create: [
                  {
                    name: `Child${childIdx}Station-${Math.random()
                      .toString(36)
                      .substring(2, 7)}`,
                    status: ChargingStatus.Available,
                    stationType: {
                      connect: {
                        id: createdStationTypes[
                          randomInt(0, stationTypes.length - 1)
                        ].id,
                      },
                    },
                  },
                ],
              },
            })),
          },
          stations: {
            create: [
              {
                name: `Company${parentIdx}Station`,
                status: ChargingStatus.Available,
                stationType: {
                  connect: {
                    id: createdStationTypes[
                      randomInt(0, stationTypes.length - 1)
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
