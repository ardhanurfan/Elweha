import { useContext, useEffect, useState } from "react";
import Button from "../../components/Button";
import Dropdown from "../../components/Dropdown";
import Table from "../../components/Table";
import LoadingPage from "../../components/LoadingPage";
import { toastError, toastSuccess } from "../../components/Toast";
import { getWithAuth, postWithAuth } from "../../api/api";
import { dataMonth } from "../../data/month";
import moment from "moment";
import { FormatRupiah } from "@arismun/format-rupiah";
import Modal from "../../components/Modal";
import DateFieldNormal from "../../components/DateFieldNormal";
import TextField from "../../components/TextField";
import TextArea from "../../components/TextArea";
import { UserContext } from "../../Context/UserContext";
import { sparator, sparatorReverse } from "../../data/sparator";
import { Link } from "react-router-dom";

function Dashboard() {
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoadAkta, setIsTableLoadAkta] = useState(false);

  const [isEditAkta, setIsEditAkta] = useState(false);
  const [showEditAkta, setShowEditAkta] = useState(false);
  const [tanggal, setTanggal] = useState<Date | null>();
  const [noAwal, setNoAwal] = useState("");
  const [noAkhir, setNoAkhir] = useState("");

  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [showTambahPendapatan, setShowTambahPendapatan] = useState(false);
  const [isAddPendapatan, setIsAddPendapatan] = useState(false);
  const [jumlah, setJumlah] = useState("");
  const [pengirim, setPengirim] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kategoriPendapatanVal, setKategoriPendapatanVal] = useState<{
    value: string;
    label: string;
  }>();
  const [kategoriPengeluaranVal, setKategoriPengeluaranVal] = useState<{
    value: string;
    label: string;
  }>();

  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [isAddPengeluaran, setIsAddPengeluaran] = useState(false);
  const [showTambahPengeluaran, setShowTambahPengeluaran] = useState(false);
  const [jenis, setJenis] = useState<{ value: string; label: string }>();
  const [jenisData, setJenisData] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [isAddAkta, setIsAddAkta] = useState(false);
  const [showTambahAkta, setShowTambahAkta] = useState(false);

  const [aktaTersisa, setAktaTersisa] = useState("");

  const [showTambahAmbil, setShowTambahAmbil] = useState(false);
  const [isAddAmbil, setIsAddAmbil] = useState(false);
  const [barangAmbil, setBarangAmbil] = useState<{
    value: string;
    label: string;
  }>();
  const [jumlahAmbil, setJumlahAmbil] = useState("");
  const [namaPengambil, setNamaPengambil] = useState("");
  const [tanggalAmbil, setTanggalAmbil] = useState<Date | null>();
  const [barangDataDropdown, setBarangDataDropdown] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [kategoriPendapatan, setKategoriPendapatan] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [kategoriPendapatanData, setKategoriPendapatanData] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [dataPendapatan, setDataPendapatan] = useState([]);
  const [kategoriPengeluaran, setKategoriPengeluaran] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [kategoriPengeluaranData, setKategoriPengeluaranData] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [dataPengeluaran, setDataPengeluaran] = useState([]);

  const [rekan, setRekan] = useState<{ value: string; label: string }>();
  const [rekanData, setRekanData] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [dataAkta, setDataAkta] = useState([]);
  const [idEditAkta, setIdEditAkta] = useState(-1);
  const [triggerAkta, setTriggerAkta] = useState(0);
  const [triggerBarang, setTriggerBarang] = useState(0);
  const [triggerPendapatan, setTriggerPendapatan] = useState(0);
  const [triggerPengeluaran, setTriggerPengeluaran] = useState(0);
  const [onSelectedAkta, setOnSelectedAkta] = useState<Array<number>>([]);

  const [hampirHabis, setHampirHabis] = useState<any | null>(null);
  const [stok, setStok] = useState<any | null>(null);

  const [period, setPeriod] = useState<{ value: string; label: string }>();

  const kolomAkta = ["No", "Tanggal", "No.Awal", "No.Akhir", "Jumlah Akta"];

  const { user } = useContext(UserContext);
  const token = user?.token;

  if (!token) {
    return <LoadingPage isLoad={true} />;
  }

  const pendapatanPerKategori = () => {
    const updatedKategoriPendapatan = kategoriPendapatan.map((row: any) => {
      const accumulatedValue = dataPendapatan.reduce(
        (total, row2: any) =>
          row2.kategori === row.label ? total + row2.jumlah : total,
        0
      );
      return { ...row, value: accumulatedValue };
    });

    setKategoriPendapatan(updatedKategoriPendapatan);
  };

  const pengeluaranPerKategori = () => {
    const updatedKategoriPengeluaran = kategoriPengeluaran.map((row: any) => {
      const accumulatedValue = dataPengeluaran.reduce(
        (total, row2: any) =>
          row2.kategori === row.label ? total + row2.jumlah : total,
        0
      );
      return { ...row, value: accumulatedValue };
    });
    setKategoriPengeluaran(updatedKategoriPengeluaran);
  };

  const getJenisData = async () => {
    if (token) {
      try {
        const jenis = await getWithAuth(token, "jenis-pengeluaran");
        setJenisData(
          jenis.data.data.map((data: any) => {
            return { value: data.id, label: data.nama };
          })
        );
      } catch (error) {
        console.log(error);
        toastError("Get Some Data Failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getTotalPendapatan = async () => {
    if (token) {
      try {
        const pendapatan = await getWithAuth(
          token,
          `pendapatan?month=${period ? period?.value.split("-")[0] : ""}&year=${
            period ? period?.value.split("-")[1] : ""
          }${user.role == "OFFICER" ? "&user_id=" + user.id : ""}`
        );

        setDataPendapatan(
          pendapatan.data.data.table.data.map((data: any) => {
            return {
              id: data.id,
              tanggal: moment(data.tanggal).format("DD MMMM YYYY"),
              kategori: data.kategori.nama,
              jumlah: data.jumlah,
              pengirim: data.pengirim,
              deskripsi: data.deskripsi,
            };
          })
        );
        const kategori = await getWithAuth(token, "kategori-pendapatan");
        setKategoriPendapatan(
          kategori.data.data.map((data: any) => {
            return { value: 0, label: data.nama };
          })
        );
        setKategoriPendapatanData(
          kategori.data.data.map((data: any) => {
            return { value: data.id, label: data.nama };
          })
        );
        setTotalPendapatan(pendapatan.data.data.total_pendapatan);
      } catch (error) {
        console.log(error);
        toastError("Get Some Data Failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const tambahPendapatan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddPendapatan(true);
    try {
      const response = await postWithAuth(
        "pendapatan",
        {
          tanggal: moment(tanggal).format("YYYY-MM-DD HH:mm:ss"),
          kategori_pendapatan_id: kategoriPendapatanVal?.value,
          jumlah: sparatorReverse(jumlah),
          pengirim: pengirim,
          deskripsi: deskripsi,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowTambahPendapatan(false);
      setTriggerPendapatan(triggerPendapatan + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsAddPendapatan(false);
    }
  };

  const getTotalPengeluaran = async () => {
    if (token) {
      try {
        const pengeluaran = await getWithAuth(
          token,
          `pengeluaran?month=${
            period ? period?.value.split("-")[0] : ""
          }&year=${period ? period?.value.split("-")[1] : ""}${
            user.role == "OFFICER" ? "&user_id=" + user.id : ""
          }`
        );
        setDataPengeluaran(
          pengeluaran.data.data.table.data.map((data: any) => {
            return {
              id: data.id,
              tanggal: moment(data.tanggal).format("DD MMMM YYYY"),
              kategori: data.kategori.nama,
              jumlah: data.jumlah,
              pengirim: data.pengirim,
              deskripsi: data.deskripsi,
            };
          })
        );
        const kategori = await getWithAuth(token, "kategori-pengeluaran");
        setKategoriPengeluaran(
          kategori.data.data.map((data: any) => {
            return { value: 0, label: data.nama };
          })
        );
        setKategoriPengeluaranData(
          kategori.data.data.map((data: any) => {
            return { value: data.id, label: data.nama };
          })
        );
        setTotalPengeluaran(pengeluaran.data.data.total_pengeluaran);
      } catch (error) {
        console.log(error);
        toastError("Get Some Data Failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const tambahPengeluaran = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddPengeluaran(true);
    try {
      const response = await postWithAuth(
        "pengeluaran",
        {
          tanggal: moment(tanggal).format("YYYY-MM-DD HH:mm:ss"),
          kategori_pengeluaran_id: kategoriPengeluaranVal?.value,
          jenis_pengeluaran_id: jenis?.value,
          jumlah: sparatorReverse(jumlah),
          deskripsi: deskripsi,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowTambahPengeluaran(false);
      setTriggerPengeluaran(triggerPengeluaran + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsAddPengeluaran(false);
    }
  };

  const getAkta = async () => {
    setOnSelectedAkta([]);
    setIsTableLoadAkta(true);
    if (token) {
      try {
        const akta = await getWithAuth(
          token,
          `pajak-rekan-akta?rekan_id=${rekan ? rekan?.value : ""}&year=${
            period ? period.value.split("-")[1] : ""
          }`
        );
        setDataAkta(
          akta.data.data.table.data.map((data: any) => {
            return {
              id: data.id,
              tanggal: moment(data.tanggal).format("DD MMMM YYYY"),
              noAwal: sparator(data.no_awal),
              noAkhir: sparator(data.no_akhir),
              jumlahAkta: data.jumlah_akta,
            };
          })
        );
      } catch (error) {
        console.log(error);
        toastError("Get Data Table Failed");
      } finally {
        setIsTableLoadAkta(false);
      }
    }
  };

  const getAktaTersisa = async () => {
    if (token) {
      try {
        const tersisa = await getWithAuth(
          token,
          `akta-tersisa?year=${
            period ? period?.value.split("-")[1] : ""
          }&rekan_id=${rekan ? rekan?.value : ""}`
        );
        setAktaTersisa(tersisa.data.data);
      } catch (error) {
        console.log(error);
        toastError("Get Data Table Failed");
      }
    }
  };

  const tambahAkta = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddAkta(true);
    try {
      const response = await postWithAuth(
        "pajak-rekan-akta",
        {
          rekan_id: rekan?.value,
          tanggal: moment(tanggal).format("YYYY-MM-DD HH:mm:ss"),
          no_awal: sparatorReverse(noAwal),
          no_akhir: sparatorReverse(noAkhir),
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowTambahAkta(false);
      setTriggerAkta(triggerAkta + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsAddAkta(false);
    }
  };

  const editAkta = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditAkta(true);
    try {
      const response = await postWithAuth(
        "update-pajak-rekan-akta",
        {
          id: idEditAkta,
          rekan_id: rekan?.value,
          tanggal: moment(tanggal).format("YYYY-MM-DD HH:mm:ss"),
          no_awal: sparatorReverse(noAwal),
          no_akhir: sparatorReverse(noAkhir),
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowEditAkta(false);
      setTriggerAkta(triggerAkta + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsEditAkta(false);
    }
  };

  const getRekan = async () => {
    if (token) {
      try {
        const rekan = await getWithAuth(token, "rekan");
        setRekanData(
          rekan.data.data.map((row: any) => {
            return {
              value: row.id,
              label: row.nama,
            };
          })
        );
      } catch (error) {
        console.log(error);
        toastError("Get Rekan Data Failed");
      }
    }
  };

  const getBarang = async () => {
    if (token) {
      try {
        const barang = await getWithAuth(token, `barang?kategori_barang=Stok`);
        setBarangDataDropdown(
          barang.data.data.data.map((data: any) => {
            return {
              value: data.id,
              label: data.nama_barang,
            };
          })
        );
      } catch (error) {
        console.log(error);
        toastError("Get Data Barang Table Failed");
      }
    }
  };

  const getStok = async () => {
    if (token) {
      try {
        const barang = await getWithAuth(
          token,
          `barang?kategori_barang=Stok&month=${
            period ? period?.value.split("-")[0] : ""
          }&year=${period ? period?.value.split("-")[1] : ""}`
        );
        setHampirHabis(
          barang.data.data.data
            .filter((datum: any) => datum.jumlah <= 5)
            .map((row: any) => {
              return {
                id: row.id,
                nama_barang: row.nama_barang,
                jenis: row.jenis.nama,
                jumlah: row.jumlah,
                satuan: row.satuan,
              };
            })
        );
        setStok(
          barang.data.data.data.map((row: any) => {
            return {
              id: row.id,
              nama_barang: row.nama_barang,
              jenis: row.jenis.nama,
              jumlah: row.jumlah,
              satuan: row.satuan,
            };
          })
        );
        if (
          barang.data.data.data.filter((datum: any) => datum.jumlah <= 5)
            .length > 0
        ) {
          setShowAlert(true);
        }
      } catch (error) {
        console.log(error);
        toastError("Get Data Barang Table Failed");
      }
    }
  };

  const tambahAmbil = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddAmbil(true);
    try {
      const response = await postWithAuth(
        "pengambilan",
        {
          tanggal: moment(tanggalAmbil).format("YYYY-MM-DD HH:mm:ss"),
          barang_id: barangAmbil?.value,
          jumlah: sparatorReverse(jumlahAmbil),
          nama_pengambil: namaPengambil,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowTambahAmbil(false);
      setTriggerBarang(triggerBarang + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsAddAmbil(false);
    }
  };

  useEffect(() => {
    getTotalPendapatan();
  }, [period, triggerPendapatan]);

  useEffect(() => {
    getTotalPengeluaran();
  }, [period, triggerPengeluaran]);

  useEffect(() => {
    pendapatanPerKategori();
  }, [totalPendapatan]);

  useEffect(() => {
    pengeluaranPerKategori();
  }, [totalPengeluaran]);

  useEffect(() => {
    getAkta();
  }, [triggerAkta, rekan, period]);

  useEffect(() => {
    getRekan();
  }, []);

  useEffect(() => {
    getStok();
  }, [period, triggerBarang]);

  useEffect(() => {
    getJenisData();
  }, []);

  useEffect(() => {
    getAktaTersisa();
  }, [triggerAkta, rekan, period]);

  useEffect(() => {
    getBarang();
  }, [period, triggerBarang]);

  return (
    <>
      <LoadingPage isLoad={isLoading} />

      <Modal visible={showAlert} onClose={() => setShowAlert(false)}>
        <div className="flex w-full flex-col gap-4">
          <h1 className="text-center text-24 font-bold text-kRed xl:text-start xl:text-40">
            Stok Hampir Habis
          </h1>
          <p>Berikut barang yang stoknya hampir habis:</p>
          {hampirHabis &&
            hampirHabis.map((row: any, index: number) => (
              <div key={index} className="flex">
                <h1 className="text-14 font-medium xl:text-20">
                  {row.nama_barang}
                </h1>
              </div>
            ))}
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowAlert(false)}
              text={"Close"}
              type={"button"}
              style={"primary"}
            />
          </div>
        </div>
      </Modal>

      {/* Modal Add Pendapatan */}
      <Modal
        visible={showTambahPendapatan}
        onClose={() => setShowTambahPendapatan(false)}
      >
        <form
          onSubmit={(e) => tambahPendapatan(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Tambah Pendapatan
          </h1>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Tanggal</p>
              <DateFieldNormal
                required
                text={"Masukkan Tanggal"}
                onChange={(val: Date) => setTanggal(val)}
                value={tanggal}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Kategori</p>
              <Dropdown
                required
                placeholder={"Kategori"}
                type={"Kategori"}
                options={kategoriPendapatanData}
                onChange={(e) => setKategoriPendapatanVal(e!)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Jumlah Pendapatan</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Rp"}
                value={sparator(jumlah)}
                onChange={(e) => setJumlah(e.target.value)}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Pengirim</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Nama Pengirim"}
                onChange={(e) => setPengirim(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full">
            <p className="mb-2 text-16 font-semibold">Deskripsi</p>
            <TextArea
              required
              placeholder={"Deskripsi"}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
          </div>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowTambahPendapatan(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              text={"Simpan Data"}
              type={"submit"}
              style={"primary"}
              isLoading={isAddPendapatan}
            />
          </div>
        </form>
      </Modal>

      {/* Add Pengeluaran */}
      <Modal
        visible={showTambahPengeluaran}
        onClose={() => setShowTambahPengeluaran(false)}
      >
        <form
          onSubmit={(e) => tambahPengeluaran(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Tambah Pengeluaran
          </h1>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Tanggal</p>
              <DateFieldNormal
                required
                text={"Masukkan Tanggal"}
                onChange={(val: Date) => setTanggal(val)}
                value={tanggal}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Kategori</p>
              <Dropdown
                required
                placeholder={"Kategori"}
                type={"Kategori"}
                options={kategoriPengeluaranData}
                onChange={(e) => setKategoriPengeluaranVal(e!)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Jumlah Pengeluaran</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Rp"}
                value={sparator(jumlah)}
                onChange={(e) => setJumlah(e.target.value)}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Jenis</p>
              <Dropdown
                required
                placeholder={"Jenis"}
                type={"Jenis"}
                options={jenisData}
                onChange={(e) => setJenis(e!)}
              />
            </div>
          </div>
          <div className="w-full">
            <p className="mb-2 text-16 font-semibold">Deskripsi</p>
            <TextArea
              required
              placeholder={"Deskripsi"}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
          </div>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowTambahPengeluaran(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              text={"Simpan Data"}
              type={"submit"}
              style={"primary"}
              isLoading={isAddPengeluaran}
            />
          </div>
        </form>
      </Modal>

      {/* Add Akta */}
      <Modal visible={showTambahAkta} onClose={() => setShowTambahAkta(false)}>
        <form
          onSubmit={(e) => tambahAkta(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Tambah Akta
          </h1>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full">
              <p className="mb-2 text-16 font-semibold">Tanggal</p>
              <DateFieldNormal
                required
                text={"Masukkan Tanggal"}
                onChange={(val: Date) => setTanggal(val)}
                value={tanggal}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">No Awal Angka</p>
              <TextField
                required
                type={"standart"}
                placeholder={"No Akta Awal"}
                value={sparator(noAwal)}
                onChange={(e) => setNoAwal(e.target.value)}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">No Akhir Angka</p>
              <TextField
                required
                type={"standart"}
                placeholder={"No Akta Akhir"}
                value={sparator(noAkhir)}
                onChange={(e) => setNoAkhir(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-5 flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowTambahAkta(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              text={"Tambah Data"}
              type={"submit"}
              style={"primary"}
              isLoading={isAddAkta}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Edit Akta */}
      <Modal visible={showEditAkta} onClose={() => setShowEditAkta(false)}>
        <form
          onSubmit={(e) => editAkta(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Edit Akta
          </h1>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full">
              <p className="mb-2 text-16 font-semibold">Tanggal</p>
              <DateFieldNormal
                required
                text={"Masukkan Tanggal"}
                onChange={(val: Date) => setTanggal(val)}
                value={tanggal}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">No Awal Angka</p>
              <TextField
                required
                type={"standart"}
                placeholder={"No Akta Awal"}
                onChange={(e) => setNoAwal(e.target.value)}
                value={sparator(noAwal)}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">No Akhir Angka</p>
              <TextField
                required
                type={"standart"}
                placeholder={"No Akta Akhir"}
                onChange={(e) => setNoAkhir(e.target.value)}
                value={sparator(noAkhir)}
              />
            </div>
          </div>
          <div className="mt-5 flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowEditAkta(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              text={"Tambah Data"}
              type={"submit"}
              style={"primary"}
              isLoading={isEditAkta}
            />
          </div>
        </form>
      </Modal>

      {/* Add Ambil */}
      <Modal
        visible={showTambahAmbil}
        onClose={() => setShowTambahAmbil(false)}
      >
        <form
          onSubmit={(e) => tambahAmbil(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Ambil Barang
          </h1>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Tanggal</p>
              <DateFieldNormal
                required
                text={"Masukkan Tanggal"}
                onChange={(val: Date) => setTanggalAmbil(val)}
                value={tanggalAmbil}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Nama Barang</p>
              <Dropdown
                required
                placeholder={"Nama Barang"}
                type={"Nama Barang"}
                options={barangDataDropdown}
                onChange={(e) => setBarangAmbil(e!)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Nama Pengambil</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Nama"}
                value={namaPengambil}
                onChange={(e) => setNamaPengambil(e.target.value)}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Jumlah Pengambilan</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Jumlah"}
                value={sparator(jumlahAmbil)}
                onChange={(e) => setJumlahAmbil(e.target.value)}
              />
            </div>
          </div>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowTambahAmbil(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              text={"Simpan Data"}
              type={"submit"}
              style={"primary"}
              isLoading={isAddAmbil}
            />
          </div>
        </form>
      </Modal>

      {/* <Navbar onLoading={(navLoad: boolean) => setNavLoad(navLoad)} /> */}
      <div className="min-h-screen w-full bg-background px-5 pb-24 pt-[104px] xl:px-24">
        <div className="mb-12 xl:flex xl:justify-between xl:pr-16">
          <h1 className="hidden text-40 font-bold xl:block">Dashboard</h1>
          <div className="flex items-center justify-between">
            <h2 className="text-16 font-bold lg:mr-10 xl:text-24">Periode</h2>
            <div className="w-[160px] md:w-[200px]">
              <Dropdown
                placeholder={"Select Period"}
                type={"month"}
                options={dataMonth(new Date("01/01/2000"), new Date())}
                onChange={(e) => setPeriod(e!)}
              />
            </div>
          </div>
        </div>
        <div className="mb-5 flex w-full justify-between xl:justify-start">
          <p className="w-auto text-16 font-bold xl:w-[250px] xl:text-24">
            Saldo PNBP
          </p>
          <p className="text-16 font-semibold xl:text-24">
            <FormatRupiah
              value={
                (kategoriPendapatan.filter((val) => val.label == "PNBP")
                  .length == 0
                  ? 0
                  : kategoriPendapatan.filter((val) => val.label == "PNBP")[0]
                      .value) -
                (kategoriPengeluaran.filter((val) => val.label == "PNBP")
                  .length == 0
                  ? 0
                  : kategoriPengeluaran.filter((val) => val.label == "PNBP")[0]
                      .value)
              }
            />
          </p>
        </div>
        <div className="mt-10 flex w-full flex-wrap justify-center gap-5">
          {/* PENDAPATAN */}
          <div className="h-auto w-full rounded-[10px] bg-white p-[30px] drop-shadow-card xl:w-[49%] xl:p-[50px]">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
              <Link
                className="text-20 font-bold hover:text-kOrange-300 active:text-kOrange-500 xl:text-24"
                to={"/pendapatan"}
              >
                Pendapatan
              </Link>
              <h1 className="whitespace-nowrap text-20 font-semibold text-kGreen xl:text-28 ">
                <FormatRupiah value={totalPendapatan} />
              </h1>
            </div>
            <hr className="my-3 bg-black" />
            <div className="h-[120px] w-full overflow-auto pr-2">
              {kategoriPendapatan.map(
                (row: { value: number; label: string }, index: number) => (
                  <div
                    key={index}
                    className="my-3 flex items-center justify-between"
                  >
                    <h1 className="text-14 font-medium xl:text-20">
                      {row.label}
                    </h1>
                    <h1 className="whitespace-nowrap text-14 font-normal text-kText xl:text-20">
                      <FormatRupiah value={row.value} />
                    </h1>
                  </div>
                )
              )}
            </div>
            <div className="mt-5 flex w-full justify-center xl:justify-end">
              <Button
                text={"Tambah Pendapatan +"}
                type={"button"}
                style={"primary"}
                onClick={() => {
                  setShowTambahPendapatan(true);
                  // Reset
                  setJumlah("");
                  setTanggal(
                    period
                      ? new Date(
                          `${period.value.split("-")[1]}-${
                            period.value.split("-")[0]
                          }-01`
                        )
                      : null
                  );
                }}
              />
            </div>
          </div>

          {/* PENGELUARAN */}
          <div className="h-auto w-full rounded-[10px] bg-white p-[30px] drop-shadow-card xl:w-[49%] xl:p-[50px]">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
              <Link
                className="text-20 font-bold hover:text-kOrange-300 active:text-kOrange-500 xl:text-24"
                to={"/pengeluaran"}
              >
                Pengeluaran
              </Link>
              <h1 className="whitespace-nowrap text-20 font-semibold text-kRed xl:text-28 ">
                <FormatRupiah value={totalPengeluaran} />
              </h1>
            </div>
            <hr className="my-3 bg-black" />
            <div className="h-[120px] w-full overflow-auto pr-2">
              {kategoriPengeluaran.map(
                (row: { value: number; label: string }, index: number) => (
                  <div
                    key={index}
                    className="my-3 flex items-center justify-between"
                  >
                    <h1 className="text-14 font-medium xl:text-20">
                      {row.label}
                    </h1>
                    <h1 className="whitespace-nowrap text-14 font-normal text-kText xl:text-20">
                      <FormatRupiah value={row.value} />
                    </h1>
                  </div>
                )
              )}
            </div>
            <div className="mt-5 flex w-full justify-center xl:justify-end">
              <Button
                text={"Tambah Pengeluaran +"}
                type={"button"}
                style={"primary"}
                onClick={() => {
                  setShowTambahPengeluaran(true);
                  // Reset
                  setJumlah("");
                  setTanggal(
                    period
                      ? new Date(
                          `${period.value.split("-")[1]}-${
                            period.value.split("-")[0]
                          }-01`
                        )
                      : null
                  );
                }}
              />
            </div>
          </div>

          {/* PAJAK REKAN */}
          <div className="h-[450px] w-full overflow-auto rounded-[10px] bg-white p-[30px] drop-shadow-card xl:w-[49%] xl:p-[50px]">
            <Link
              className="text-20 font-bold hover:text-kOrange-300 active:text-kOrange-500 xl:text-24"
              to={"/pajak-rekan"}
            >
              Pajak Rekan
            </Link>
            <hr className="my-3 bg-black" />
            <div className="my-3 flex items-center justify-between">
              <h1 className="text-14 font-semibold xl:text-20">
                No. Akta Tersisa
              </h1>
              <h1 className="whitespace-nowrap text-14 font-normal text-kText xl:text-20">
                {aktaTersisa}
              </h1>
            </div>
            <div className="my-3 flex items-center justify-between">
              <h1 className="text-14 font-semibold xl:text-20">Daftar Akta</h1>
              {rekan && (
                <Button
                  text={"Tambah Data +"}
                  type={"button"}
                  style={"primary"}
                  onClick={() => {
                    setShowTambahAkta(true);
                    // Reset
                    setNoAwal("");
                    setNoAkhir("");
                    setTanggal(null);
                  }}
                />
              )}
            </div>
            <div className="mt-2 w-full px-12 md:px-40 lg:px-20">
              <Dropdown
                placeholder={"Pilih Rekan"}
                type={"Rekan"}
                onChange={(e) => setRekan(e!)}
                options={rekanData}
              />
            </div>
            <div className="mt-4">
              <Table
                data={dataAkta}
                column={kolomAkta}
                isLoading={isTableLoadAkta}
                page={1}
                dataLimit={10}
                isCheck={user?.role == "BOD"}
                isEdit={user?.role == "BOD"}
                onEdit={(val) => {
                  setIdEditAkta((dataAkta[val] as any).id);
                  setShowEditAkta(true);
                  setTanggal(
                    moment(Date.parse((dataAkta[val] as any).tanggal)).toDate()
                  );
                  setNoAwal((dataAkta[val] as any).noAwal);
                  setNoAkhir((dataAkta[val] as any).noAkhir);
                }}
                onSelected={(val) => setOnSelectedAkta(val)}
                selected={onSelectedAkta}
              />
            </div>
          </div>

          {/* STOK BARANG */}
          <div className="w-full xl:w-[49%]">
            <div className="h-auto w-full rounded-[10px] bg-white p-[30px] drop-shadow-card xl:p-[50px]">
              <Link
                className="text-20 font-bold hover:text-kOrange-300 active:text-kOrange-500 xl:text-24"
                to={"/stok"}
              >
                Stok Barang
              </Link>
              <hr className="my-3 bg-black" />
              <div className="h-[120px] w-full overflow-auto pr-2">
                {stok &&
                  stok.map((row: any, index: number) => (
                    <div
                      key={index}
                      className="my-3 flex items-center justify-between"
                    >
                      <h1 className="text-14 font-medium xl:text-20">
                        {row.nama_barang}
                      </h1>
                      <h1 className="whitespace-nowrap text-14 font-normal text-kText xl:text-20">
                        {row.jumlah} {row.satuan}
                      </h1>
                    </div>
                  ))}
              </div>
              <div className="mt-5 flex w-full justify-center xl:justify-end">
                <Button
                  text={"Ambil Barang +"}
                  type={"button"}
                  style={"primary"}
                  onClick={() => {
                    setShowTambahAmbil(true);
                    setNamaPengambil(user.nama);
                    // Reset
                    setJumlahAmbil("");
                    setTanggalAmbil(
                      period
                        ? new Date(
                            `${period.value.split("-")[1]}-${
                              period.value.split("-")[0]
                            }-01`
                          )
                        : null
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
