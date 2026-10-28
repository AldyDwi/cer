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
    username: "siswa",
    email: "siswa@gmail.com",
    password: "siswa123",
    nama_lengkap: "Siswa Percobaan",
    kelas: "TI-3A",
    role: "student",
  });
  worksheet.addRow({
    username: "guru",
    email: "guru@gmail.com",
    password: "guru1234",
    nama_lengkap: "Guru Demo",
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