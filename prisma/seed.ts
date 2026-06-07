import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const hash = (plain: string) => bcrypt.hashSync(plain, 10);
const calcTotal = (c1: number, c2: number, c3: number) =>
  parseFloat(((c1 + c2 + c3) / 3).toFixed(2));


const ADMIN_ID       = "admin_zetech";
const ADMIN_PASSWORD = "admin123";

const TEAMS = [
  { teamName: "Aqua Smart Monitor",  boothNumber: "A1", password: "zetech2025" },
  { teamName: "EduBot Learning",     boothNumber: "A2", password: "zetech2025" },
  { teamName: "WasteTrack IoT",      boothNumber: "B1", password: "zetech2025" },
  { teamName: "HealthAlert System",  boothNumber: "B2", password: "zetech2025" },
  { teamName: "AgriSense Platform",  boothNumber: "C1", password: "zetech2025" },
  { teamName: "SmartParking Pro",    boothNumber: "C2", password: "zetech2025" },
];

const STUDENTS: { id: string; name: string }[] = [
  // TI Angkatan 2020
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
  // SI Angkatan 2020
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
  // MI Angkatan 2020
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
  // TI Angkatan 2021
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
  // SI Angkatan 2021
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

// NIDN
const LECTURERS: { id: string; name: string }[] = [
  { id: "0101017001", name: "Dr. Ahmad Fauzi, M.Kom" },
  { id: "0215028502", name: "Dr. Budi Santoso, M.T" },
  { id: "0308039003", name: "Ir. Candra Dewi, M.Sc" },
  { id: "0422047504", name: "Dr. Dian Puspita, M.Pd" },
  { id: "0530056005", name: "Prof. Eko Budiman, Ph.D" },
];

const VOTE_DISTRIBUTION = [
  ...Array.from({ length: 12 }, (_, i) => ({ si: i,      ti: 0 })), // A1
  ...Array.from({ length: 15 }, (_, i) => ({ si: 12 + i, ti: 1 })), // A2
  ...Array.from({ length: 6  }, (_, i) => ({ si: 27 + i, ti: 2 })), // B1
  ...Array.from({ length: 9  }, (_, i) => ({ si: 33 + i, ti: 3 })), // B2
  ...Array.from({ length: 4  }, (_, i) => ({ si: 42 + i, ti: 4 })), // C1
  ...Array.from({ length: 4  }, (_, i) => ({ si: 46 + i, ti: 5 })), // C2
];

const LECTURER_SCORES: Record<string, [number, number, number][]> = {
  "0101017001": [[85,82,88],[90,91,89],[73,78,75],[92,88,90],[68,72,70],[80,84,82]],
  "0215028502": [[87,84,90],[93,90,88],[76,79,77],[89,94,91],[71,74,72],[83,85,84]],
  "0308039003": [[90,87,93],[91,88,86],[77,81,79],[88,91,87],[72,75,74],[84,87,86]],
  "0422047504": [[86,83,89],[94,92,90],[74,77,76],[91,93,89],[69,73,71],[81,83,83]],
  "0530056005": [[88,86,91],[92,89,87],[75,80,78],[90,95,92],[70,74,73],[82,86,85]],
};

async function main() {
  console.log("🌱 ZeScore Database Seeder dimulai...\n");

  console.log("👑 Seeding Admin...");
  await prisma.user.upsert({
    where:  { id: ADMIN_ID },
    update: { password: hash(ADMIN_PASSWORD) },
    create: {
      id:       ADMIN_ID,
      name:     "Panitia ZeScore",
      role:     "ADMIN",
      password: hash(ADMIN_PASSWORD),
    },
  });
  console.log(`   ✅ ${ADMIN_ID} / ${ADMIN_PASSWORD}`);

  console.log("\n🏆 Seeding Tim Peserta...");
  const createdTeams: { id: string; boothNumber: string; teamName: string }[] = [];
  for (const team of TEAMS) {
    const created = await prisma.team.upsert({
      where:  { boothNumber: team.boothNumber },
      update: { teamName: team.teamName, password: hash(team.password) },
      create: {
        teamName:    team.teamName,
        boothNumber: team.boothNumber,
        password:    hash(team.password),
      },
    });
    createdTeams.push(created);
    console.log(`   ✅ Stand ${team.boothNumber} — ${team.teamName}`);
  }

  console.log("\n🎓 Seeding 50 Mahasiswa...");
  for (const s of STUDENTS) {
    await prisma.user.upsert({
      where:  { id: s.id },
      update: { name: s.name },
      create: { id: s.id, name: s.name, role: "STUDENT" },
    });
  }
  console.log(`   ✅ ${STUDENTS.length} mahasiswa berhasil di-seed`);

  console.log("\n👨‍🏫 Seeding 5 Dosen Juri...");
  for (const l of LECTURERS) {
    await prisma.user.upsert({
      where:  { id: l.id },
      update: { name: l.name },
      create: { id: l.id, name: l.name, role: "LECTURER" },
    });
  }
  console.log(`   ✅ ${LECTURERS.length} dosen berhasil di-seed`);

  console.log("\n🗳️  Seeding sample vote mahasiswa...");
  let voteCount = 0;
  for (const { si, ti } of VOTE_DISTRIBUTION) {
    const student = STUDENTS[si];
    const team    = createdTeams[ti];
    if (!student || !team) continue;

    await prisma.assessment.upsert({
      where:  { teamId_voterId: { teamId: team.id, voterId: student.id } },
      update: {},
      create: {
        teamId:     team.id,
        voterId:    student.id,
        isVoteOnly: true,
        totalScore: 0,
      },
    });
    voteCount++;
  }
  console.log(`   ✅ ${voteCount} vote berhasil di-seed`);

  console.log("\n📝 Seeding sample penilaian dosen...");
  let assessCount = 0;
  for (const lecturer of LECTURERS) {
    const scores = LECTURER_SCORES[lecturer.id];
    for (let i = 0; i < createdTeams.length; i++) {
      const team         = createdTeams[i];
      const [c1, c2, c3] = scores[i];
      const total        = calcTotal(c1, c2, c3);

      await prisma.assessment.upsert({
        where:  { teamId_voterId: { teamId: team.id, voterId: lecturer.id } },
        update: { criteria1: c1, criteria2: c2, criteria3: c3, totalScore: total },
        create: {
          teamId:     team.id,
          voterId:    lecturer.id,
          isVoteOnly: false,
          criteria1:  c1,
          criteria2:  c2,
          criteria3:  c3,
          totalScore: total,
        },
      });
      assessCount++;
    }
  }
  console.log(`   ✅ ${assessCount} penilaian dosen berhasil di-seed`);

  console.log("\n" + "─".repeat(55));
  console.log("🎉 Seeding selesai!");
  console.log("─".repeat(55));
  console.log(`  Admin      : admin_zetech     / admin123`);
  console.log(`  Tim Peserta: ${TEAMS.length} tim (A1–C2)  / zetech2025`);
  console.log(`  Mahasiswa  : ${STUDENTS.length} NIM`);
  console.log(`  Dosen Juri : ${LECTURERS.length} NIDN`);
  console.log(`  Votes      : ${voteCount}`);
  console.log(`  Penilaian  : ${assessCount}`);
  console.log("─".repeat(55));
}

main()
  .catch((e) => {
    console.error("❌ Seeder error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());