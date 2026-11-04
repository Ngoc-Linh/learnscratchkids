import { db } from "../src/lib/db";
import { isValidPhone, normalizePhone } from "../src/lib/phone";
import { createGuideSeedArticles } from "../src/lib/guide-seed";
import bcrypt from "bcryptjs";

async function main() {
  const rawPhone = process.env.ADMIN_PHONE?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if ((!rawPhone || !password) && process.env.NODE_ENV === "production") {
    throw new Error("Production cần đặt ADMIN_PHONE và ADMIN_PASSWORD để khởi tạo tài khoản quản trị.");
  }
  if (rawPhone || password) {
    if (!rawPhone || !password) throw new Error("Cần đặt đồng thời ADMIN_PHONE và ADMIN_PASSWORD.");
    const phone = normalizePhone(rawPhone);
    if (!isValidPhone(phone)) throw new Error("ADMIN_PHONE không hợp lệ");
    if (password.length < 12) throw new Error("ADMIN_PASSWORD cần tối thiểu 12 ký tự");

    const seedKey = `admin-credentials-seeded:${phone}`;
    if (!(await db.appSetting.findUnique({ where: { key: seedKey } }))) {
      const passwordHash = await bcrypt.hash(password, 12);
      await db.$transaction(async (tx) => {
        await tx.user.upsert({
          where: { phone },
          update: { name: "Quản trị viên", role: "ADMIN", passwordHash, isActive: true },
          create: { phone, name: "Quản trị viên", passwordHash, role: "ADMIN" },
        });
        await tx.appSetting.create({ data: { key: seedKey, value: "true" } });
      });
    } else {
      await db.user.updateMany({
        where: { phone },
        data: { role: "ADMIN", isActive: true },
      });
    }
    console.log(`Đã tạo/cập nhật tài khoản quản trị: ${phone}`);
  } else {
    console.warn("Bỏ qua seed Admin ở môi trường local vì chưa đặt ADMIN_PHONE / ADMIN_PASSWORD.");
  }

  const seedKey = "guide-articles-seeded";
  if (!(await db.appSetting.findUnique({ where: { key: seedKey } }))) {
    if ((await db.guideArticle.count()) === 0) {
      await db.guideArticle.createMany({ data: createGuideSeedArticles() });
    }
    await db.appSetting.create({ data: { key: seedKey, value: "true" } });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
