const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const existing = await prisma.company.findFirst({
        where: { deletedAt: null }
    });

    if (!existing) {
        await prisma.company.create({
            data: { name: "Technosynergians" }
        });
        console.log("SUCCESS: Created the default 'Technosynergians' company!");
    } else {
        console.log("SUCCESS: A company already exists in the database.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
