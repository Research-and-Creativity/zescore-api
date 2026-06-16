import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const hash = (plain: string) => bcrypt.hashSync(plain, 10);
const ADMIN_ID = "admin_zetech";
const ADMIN_PASS = "admin123";

const TEAMS = [
  { teamName: "Aqua Smart Monitor", boothNumber: "A1", password: "zetech2025" },
  { teamName: "EduBot Learning", boothNumber: "A2", password: "zetech2025" },
  { teamName: "WasteTrack IoT", boothNumber: "B1", password: "zetech2025" },
  { teamName: "HealthAlert System", boothNumber: "B2", password: "zetech2025" },
  { teamName: "AgriSense Platform", boothNumber: "C1", password: "zetech2025" },
  { teamName: "SmartParking Pro", boothNumber: "C2", password: "zetech2025" },
];

const STUDENTS: { id: string; name: string }[] = [
  { id: "2011001", name: "Aldi Prasetyo" },
  { id: "2011002", name: "Bella Maharani" },
  { id: "2011003", name: "Cahyo Nugroho" },
  { id: "2011004", name: "Dinda Kusuma" },
  { id: "2011005", name: "Eko Saputra" },
  { id: "2011006", name: "Farah Ayu" },
  { id: "2011007", name: "Gilang Ramadhan" },
  { id: "2011008", name: "Hana Pertiwi" },
  { id: "2011009", name: "Irfan Maulana" },
  { id: "2011010", name: "Jasmine Putri" },
  { id: "2012001", name: "Kevin Ardiansyah" },
  { id: "2012002", name: "Luna Safitri" },
  { id: "2012003", name: "Muhammad Rizki" },
  { id: "2012004", name: "Nadia Amelia" },
  { id: "2012005", name: "Oscar Wijaya" },
  { id: "2012006", name: "Putri Handayani" },
  { id: "2012007", name: "Qori Ananda" },
  { id: "2012008", name: "Rafi Santoso" },
  { id: "2012009", name: "Sari Dewi" },
  { id: "2012010", name: "Taufik Hidayat" },
  { id: "2013001", name: "Ulfa Rahmawati" },
  { id: "2013002", name: "Vino Setiawan" },
  { id: "2013003", name: "Wulandari Susanti" },
  { id: "2013004", name: "Xander Pratama" },
  { id: "2013005", name: "Yuni Astuti" },
  { id: "2013006", name: "Zaky Firmansyah" },
  { id: "2013007", name: "Adit Kurniawan" },
  { id: "2013008", name: "Bayu Setiabudi" },
  { id: "2013009", name: "Citra Lestari" },
  { id: "2013010", name: "Dani Hermawan" },
  { id: "2111001", name: "Eka Nugroho" },
  { id: "2111002", name: "Fira Anggraini" },
  { id: "2111003", name: "Galih Prabowo" },
  { id: "2111004", name: "Hendra Wijaya" },
  { id: "2111005", name: "Indah Permata" },
  { id: "2111006", name: "Joko Waluyo" },
  { id: "2111007", name: "Kiki Rahayu" },
  { id: "2111008", name: "Lukman Hakim" },
  { id: "2111009", name: "Maya Sari" },
  { id: "2111010", name: "Nanda Putra" },
  { id: "2112001", name: "Okta Wibowo" },
  { id: "2112002", name: "Putri Rahayu" },
  { id: "2112003", name: "Rendi Syahputra" },
  { id: "2112004", name: "Shinta Amelia" },
  { id: "2112005", name: "Tegar Santoso" },
  { id: "2112006", name: "Umi Kalsum" },
  { id: "2112007", name: "Valdo Pratama" },
  { id: "2112008", name: "Wahyu Ningsih" },
  { id: "2112009", name: "Xenia Putri" },
  { id: "2112010", name: "Yudha Prasetya" },
];

const LECTURERS: { id: string; name: string }[] = [
  { id: "0101017001", name: "Dr. Ahmad Fauzi, M.Kom" },
  { id: "0215028502", name: "Dr. Budi Santoso, M.T" },
  { id: "0308039003", name: "Ir. Candra Dewi, M.Sc" },
  { id: "0422047504", name: "Dr. Dian Puspita, M.Pd" },
  { id: "0530056005", name: "Prof. Eko Budiman, Ph.D" },
];

// Vote distribution per tim (index mahasiswa → index tim)
const VOTE_DIST = [
  ...Array.from({ length: 12 }, (_, i) => ({ si: i, ti: 0 })),
  ...Array.from({ length: 15 }, (_, i) => ({ si: 12 + i, ti: 1 })),
  ...Array.from({ length: 6 }, (_, i) => ({ si: 27 + i, ti: 2 })),
  ...Array.from({ length: 9 }, (_, i) => ({ si: 33 + i, ti: 3 })),
  ...Array.from({ length: 4 }, (_, i) => ({ si: 42 + i, ti: 4 })),
  ...Array.from({ length: 4 }, (_, i) => ({ si: 46 + i, ti: 5 })),
];

// Nilai dosen per tim: [poster, product]
const LECTURER_SCORES: Record<string, [number, number][]> = {
  "0101017001": [
    [85, 88],
    [90, 89],
    [73, 75],
    [92, 90],
    [68, 70],
    [80, 82],
  ],
  "0215028502": [
    [87, 90],
    [93, 88],
    [76, 77],
    [89, 91],
    [71, 72],
    [83, 84],
  ],
  "0308039003": [
    [90, 93],
    [91, 86],
    [77, 79],
    [88, 87],
    [72, 74],
    [84, 86],
  ],
  "0422047504": [
    [86, 89],
    [94, 90],
    [74, 76],
    [91, 89],
    [69, 71],
    [81, 83],
  ],
  "0530056005": [
    [88, 91],
    [92, 87],
    [75, 78],
    [90, 92],
    [70, 73],
    [82, 85],
  ],
};

async function main() {
  console.log("🌱 ZeScore Database Seeder dimulai...\n");

  // Admin
  console.log("👑 Seeding Admin...");
  await prisma.user.upsert({
    where: { id: ADMIN_ID },
    update: { password: hash(ADMIN_PASS) },
    create: {
      id: ADMIN_ID,
      name: "Panitia ZeScore",
      role: "ADMIN",
      password: hash(ADMIN_PASS),
    },
  });
  console.log(`   ✅ ${ADMIN_ID} / ${ADMIN_PASS}`);

  // Teams
  // console.log("\n🏆 Seeding Tim Peserta...");
  // const createdTeams: { id: string; boothNumber: string; teamName: string }[] =
  //   [];
  // for (const t of TEAMS) {
  //   const team = await prisma.team.upsert({
  //     where: { boothNumber: t.boothNumber },
  //     update: { teamName: t.teamName, password: hash(t.password) },
  //     create: {
  //       teamName: t.teamName,
  //       boothNumber: t.boothNumber,
  //       password: hash(t.password),
  //     },
  //   });
  //   createdTeams.push(team);
  //   console.log(`   ✅ Stand ${t.boothNumber} — ${t.teamName}`);
  // }

  // // Students
  // console.log("\n🎓 Seeding 50 Mahasiswa...");
  // for (const s of STUDENTS) {
  //   await prisma.user.upsert({
  //     where: { id: s.id },
  //     update: { name: s.name },
  //     create: { id: s.id, name: s.name, role: "STUDENT" },
  //   });
  // }
  // console.log(`   ✅ ${STUDENTS.length} mahasiswa berhasil di-seed`);

  // // Lecturers
  // console.log("\n👨‍🏫 Seeding 5 Dosen Juri...");
  // for (const l of LECTURERS) {
  //   await prisma.user.upsert({
  //     where: { id: l.id },
  //     update: { name: l.name },
  //     create: { id: l.id, name: l.name, role: "LECTURER" },
  //   });
  // }
  // console.log(`   ✅ ${LECTURERS.length} dosen berhasil di-seed`);

  // // Sample votes — POSTER category per mahasiswa
  // console.log("\n🗳️  Seeding sample vote mahasiswa (kategori POSTER)...");
  // let voteCount = 0;
  // for (const { si, ti } of VOTE_DIST) {
  //   const student = STUDENTS[si];
  //   const team = createdTeams[ti];
  //   if (!student || !team) continue;

  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   await (prisma.assessment as any).upsert({
  //     where: {
  //       teamId_voterId_category: {
  //         teamId: team.id,
  //         voterId: student.id,
  //         category: "POSTER",
  //       },
  //     },
  //     update: {},
  //     create: {
  //       teamId: team.id,
  //       voterId: student.id,
  //       category: "POSTER",
  //       isVoteOnly: true,
  //       totalScore: 0,
  //     },
  //   });
  //   voteCount++;
  // }
  // console.log(`   ✅ ${voteCount} vote POSTER berhasil di-seed`);

  // // Sample lecturer scores — POSTER & PRODUCT per dosen per tim
  // console.log("\n📝 Seeding sample penilaian dosen (POSTER & PRODUCT)...");
  // let assessCount = 0;
  // for (const lecturer of LECTURERS) {
  //   const scores = LECTURER_SCORES[lecturer.id];
  //   for (let i = 0; i < createdTeams.length; i++) {
  //     const team = createdTeams[i];
  //     const [poster, product] = scores[i];

  //     for (const [cat, score] of [
  //       ["POSTER", poster],
  //       ["PRODUCT", product],
  //     ] as [string, number][]) {
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       await (prisma.assessment as any).upsert({
  //         where: {
  //           teamId_voterId_category: {
  //             teamId: team.id,
  //             voterId: lecturer.id,
  //             category: cat,
  //           },
  //         },
  //         update: {
  //           criteria1: cat === "POSTER" ? score : null,
  //           criteria2: cat === "PRODUCT" ? score : null,
  //           totalScore: score,
  //         },
  //         create: {
  //           teamId: team.id,
  //           voterId: lecturer.id,
  //           category: cat,
  //           isVoteOnly: false,
  //           criteria1: cat === "POSTER" ? score : null,
  //           criteria2: cat === "PRODUCT" ? score : null,
  //           totalScore: score,
  //         },
  //       });
  //       assessCount++;
  //     }
  //   }
}
// console.log(`   ✅ ${assessCount} penilaian dosen berhasil di-seed`);

console.log("\n" + "─".repeat(55));
console.log("🎉 Seeding selesai!");
console.log("─".repeat(55));
console.log(`  Admin      : admin_zetech     / admin123`);
console.log(`  Tim Peserta: ${TEAMS.length} tim (A1–C2)  / zetech2025`);
console.log(`  Mahasiswa  : ${STUDENTS.length} NIM`);
console.log(`  Dosen Juri : ${LECTURERS.length} NIDN`);
// console.log(`  Votes      : ${voteCount} (POSTER)`);
// console.log(
//   `  Penilaian  : ${assessCount} (${assessCount / 2} POSTER + ${assessCount / 2} PRODUCT)`,
// );
console.log("─".repeat(55));

main()
  .catch((e) => {
    console.error("❌ Seeder error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
