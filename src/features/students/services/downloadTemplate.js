import ExcelJS from "exceljs";

export async function downloadUserTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Template User");

  // Definisi kolom header
  worksheet.columns = [
    { header: "username", key: "username", width: 15 },
    { header: "email", key: "email", width: 25 },
    { header: "password", key: "password", width: 15 },
    { header: "nama_lengkap", key: "nama_lengkap", width: 25 },
    { header: "kelas", key: "kelas", width: 12 },
    { header: "role", key: "role", width: 12 },
  ];

  // Tambahkan data dummy
  worksheet.addRow({
    username: "ahmad",
    email: "ahmad@mail.com",
    password: "siswa123",
    nama_lengkap: "Ahmad Fajar",
    kelas: "TI-3A",
    role: "student",
  });
  worksheet.addRow({
    username: "citra",
    email: "citrai@mail.com",
    password: "siswa123",
    nama_lengkap: "Citra Lestari",
    kelas: "TI-3B",
    role: "student",
  });
  worksheet.addRow({
    username: "hendra",
    email: "hendra@mail.com",
    password: "guru1234",
    nama_lengkap: "Dr. Hendra Wijaya",
    kelas: "",
    role: "teacher",
  });

  // Generate file buffer dan trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "template_import_user.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}