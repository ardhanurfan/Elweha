import moment from "moment";
import { formatRpReverse } from "./formatRp";

interface EmployeeAttendance {
  nama_karyawan: string;
  tanggal: Date;
  kehadiran_actual: number;
  kehadiran_standart: number;
  keterlambatan: number;
}

interface Pendapatan {
  tanggal: string;
  kategori: string;
  jumlah: number;
  pengirim: string;
  deskripsi: number;
}

interface Pengeluaran {
  tanggal: string;
  kategori: string;
  jenis: string;
  jumlah: number;
  deskripsi: number;
}

export function readEmt(originalData: any) {
  try {
    const mappedData: EmployeeAttendance[] = [];

    let kehadiranStandard = 0;
    for (let i = 1; i < originalData.length; i++) {
      if (
        Object.values(originalData[i])[0] != "ID :" &&
        Object.values(originalData[i])[0] != 1
      ) {
        const temp = Object.keys(originalData[i]).length;
        if (kehadiranStandard < temp) {
          kehadiranStandard = temp;
        }
      }
    }

    function compareTimeStrings(timeString1: string, timeString2: string) {
      const [hours1, minutes1] = timeString1.split(":").map(Number);
      const [hours2, minutes2] = timeString2.split(":").map(Number);

      if (hours1 < hours2 || (hours1 === hours2 && minutes1 < minutes2)) {
        return 0; // timeString1 is earlier
      } else if (hours1 === hours2 && minutes1 === minutes2) {
        return 0; // Both time strings are equal
      } else {
        return 1; // timeString1 is later
      }
    }

    const referenceTime = "08:00";
    function getKeterlambatan(obj: Object) {
      let lambat = 0;
      var value = Object.values(obj);
      for (const val of value) {
        const timeString = val.split("\n")[0];
        const comparisonResult = compareTimeStrings(timeString, referenceTime);

        if (comparisonResult === 1) {
          lambat++;
        }
      }

      return lambat;
    }

    let cekUser = false;
    let userIdx = 0;
    for (let i = 1; i < originalData.length; i++) {
      if (Object.values(originalData[i])[0] == "ID :") {
        cekUser = true;
        userIdx = i;
      }
      if (
        cekUser &&
        Object.values(originalData[i])[0] != "ID :" &&
        Object.values(originalData[i])[0] != 1
      ) {
        const employeeInfo: EmployeeAttendance = {
          nama_karyawan: originalData[userIdx]["__EMPTY_8"],
          tanggal: moment(originalData[0]["__EMPTY_1"], "YYYY-MM-DD").toDate(),
          kehadiran_actual: Object.keys(originalData[i]).length,
          kehadiran_standart: kehadiranStandard,
          keterlambatan: getKeterlambatan(originalData[i]),
        };
        mappedData.push(employeeInfo);
        cekUser = false;
      }
    }
    return mappedData;
  } catch (error) {
    throw "Please check excel format";
  }
}

export function readNonEmt(originalData: any) {
  try {
    const mappedData: EmployeeAttendance[] = [];

    let kehadiranStandard = 0;
    for (let i = 1; i < originalData.length; i++) {
      if (
        Object.values(originalData[i])[0] != "ID:" &&
        Object.values(originalData[i])[0] != 1
      ) {
        const temp = Object.keys(originalData[i]).length;
        if (kehadiranStandard < temp) {
          kehadiranStandard = temp;
        }
      }
    }

    function compareTimeStrings(timeString1: string, timeString2: string) {
      const [hours1, minutes1] = timeString1.split(":").map(Number);
      const [hours2, minutes2] = timeString2.split(":").map(Number);

      if (hours1 < hours2 || (hours1 === hours2 && minutes1 < minutes2)) {
        return 0; // timeString1 is earlier
      } else if (hours1 === hours2 && minutes1 === minutes2) {
        return 0; // Both time strings are equal
      } else {
        return 1; // timeString1 is later
      }
    }

    const referenceTime = "08:00";
    function getKeterlambatan(obj: Object) {
      let lambat = 0;
      var value = Object.values(obj);
      for (const val of value) {
        const timeString = val.slice(0, 5);
        const comparisonResult = compareTimeStrings(timeString, referenceTime);

        if (comparisonResult === 1) {
          lambat++;
        }
      }

      return lambat;
    }

    let cekUser = false;
    let userIdx = 0;
    for (let i = 0; i < originalData.length; i++) {
      if (Object.values(originalData[i])[0] == "ID:") {
        cekUser = true;
        userIdx = i;
      }
      if (
        cekUser &&
        Object.values(originalData[i])[0] != "ID:" &&
        Object.values(originalData[i])[0] != 1
      ) {
        const employeeInfo: EmployeeAttendance = {
          nama_karyawan: originalData[userIdx]["__EMPTY_9"],
          tanggal: moment(originalData[0]["__EMPTY_1"], "YYYY-MM-DD").toDate(),
          kehadiran_actual: Object.keys(originalData[i]).length,
          kehadiran_standart: kehadiranStandard,
          keterlambatan: getKeterlambatan(originalData[i]),
        };
        mappedData.push(employeeInfo);
        cekUser = false;
      }
    }
    return mappedData;
  } catch (error) {
    throw "Please check excel format";
  }
}

export function readPendapatan(originalData: any) {
  try {
    const mappedData: Pendapatan[] = [];

    for (let i = 0; i < originalData.length; i++) {
      const pendapatanInfo: Pendapatan = {
        tanggal: moment(originalData[i].tanggal).format("YYYY-MM-DD HH:mm:ss"),
        kategori: originalData[i].kategori,
        jumlah: parseInt(formatRpReverse(originalData[i].jumlah)),
        pengirim: originalData[i].pengirim,
        deskripsi: originalData[i].deskripsi,
      };
      mappedData.push(pendapatanInfo);
    }
    return mappedData;
  } catch (error) {
    throw "Please check excel format";
  }
}

export function readPengeluaran(originalData: any) {
  try {
    const mappedData: Pengeluaran[] = [];

    for (let i = 0; i < originalData.length; i++) {
      const pengeluaranInfo: Pengeluaran = {
        tanggal: moment(originalData[i].tanggal).format("YYYY-MM-DD HH:mm:ss"),
        kategori: originalData[i].kategori,
        jenis: originalData[i].jenis,
        jumlah: parseInt(formatRpReverse(originalData[i].jumlah)),
        deskripsi: originalData[i].deskripsi,
      };
      mappedData.push(pengeluaranInfo);
    }
    return mappedData;
  } catch (error) {
    throw "Please check excel format";
  }
}
