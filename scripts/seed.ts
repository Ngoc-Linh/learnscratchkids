import { db } from "../src/lib/db";
import { isValidPhone, normalizePhone } from "../src/lib/phone";
import bcrypt from "bcryptjs";

async function main() {
  const rawPhone = process.env.ADMIN_PHONE?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!rawPhone || !password) {
    console.log("Bỏ qua: chưa đặt ADMIN_PHONE / ADMIN_PASSWORD");
    return;
  }
  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) throw new Error("ADMIN_PHONE không hợp lệ");
  if (password.length < 8) throw new Error("ADMIN_PASSWORD cần tối thiểu 8 ký tự");

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.upsert({
    where: { phone },
    update: { role: "ADMIN", passwordHash, isActive: true },
    create: { phone, name: "Quản trị viên", passwordHash, role: "ADMIN" },
  });
  console.log(`Đã tạo/cập nhật tài khoản quản trị: ${phone}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
