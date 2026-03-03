const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

function hashPin(pin) {
    const salt = crypto.randomBytes(16).toString("hex");
    const digest = crypto.scryptSync(pin, salt, 64).toString("hex");
    return `scrypt$${salt}$${digest}`;
}

async function main() {
    console.log("Ensuring default company...");
    let company = await prisma.company.findFirst({
        where: { deletedAt: null }
    });

    if (!company) {
        company = await prisma.company.create({
            data: { name: "Technosynergians" }
        });
        console.log("Created default company.");
    }

    console.log("Ensuring ADMIN role...");
    const ALL_PERMISSIONS = [
        "view_users", "manage_users", "view_roles", "manage_roles",
        "view_master_data", "manage_master_data", "view_inventory",
        "manage_inventory", "view_sales", "manage_sales",
        "view_purchases", "manage_purchases", "view_production",
        "manage_production", "view_reports"
    ];

    let adminRole = await prisma.role.findFirst({
        where: { companyId: company.id, name: "ADMIN" }
    });

    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: {
                companyId: company.id,
                name: "ADMIN",
                permissions: ALL_PERMISSIONS
            }
        });
        console.log("Created ADMIN role.");
    }

    console.log("Ensuring Techno user...");
    let techno = await prisma.employee.findFirst({
        where: { companyId: company.id, code: "Techno" }
    });

    if (!techno) {
        await prisma.employee.create({
            data: {
                companyId: company.id,
                code: "Techno",
                name: "Techno Admin",
                pinHash: hashPin("kundanrajesh"),
                pinUpdatedAt: new Date(),
                active: true,
                roles: {
                    create: {
                        roleId: adminRole.id
                    }
                }
            }
        });
        console.log("Created Techno user.");
    } else {
        // Force update password just in case
        await prisma.employee.update({
            where: { id: techno.id },
            data: { pinHash: hashPin("kundanrajesh") }
        });
    }

    console.log("Ensuring admin user...");
    let admin = await prisma.employee.findFirst({
        where: { companyId: company.id, code: "admin" }
    });

    if (!admin) {
        await prisma.employee.create({
            data: {
                companyId: company.id,
                code: "admin",
                name: "Admin User",
                pinHash: hashPin("shaswat"),
                pinUpdatedAt: new Date(),
                active: true,
                roles: {
                    create: {
                        roleId: adminRole.id
                    }
                }
            }
        });
        console.log("Created admin user.");
    } else {
        // Force update password just in case
        await prisma.employee.update({
            where: { id: admin.id },
            data: { pinHash: hashPin("shaswat") }
        });
    }

    console.log("SUCCESS: Both users created and passwords set!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
