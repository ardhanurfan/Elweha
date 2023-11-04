import { useContext, useEffect, useState } from "react";
import Button from "../../components/Button";
import Dropdown from "../../components/Dropdown";
import Footer from "../../components/Footer";
import Paginate from "../../components/Paginate";
import Table from "../../components/Table";
import TextField from "../../components/TextField";
import LoadingPage from "../../components/LoadingPage";
import Modal from "../../components/Modal";
import { getWithAuth, postWithAuth } from "../../api/api";
import { toastError, toastSuccess } from "../../components/Toast";
import DateFieldNormal from "../../components/DateFieldNormal";
import moment from "moment";
import { dataMonth } from "../../data/month";
import Filter from "../../components/Filter";
import { UserContext } from "../../Context/UserContext";
import { sparator, sparatorReverse } from "../../data/sparator";
import EditModal from "../../components/EditModal";

function Stok() {
  // Loading
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoadBarang, setIsTableLoadBarang] = useState(false);
  const [isAddBarang, setIsAddBarang] = useState(false);
  const [isEditBarang, setIsEditBarang] = useState(false);
  const [isHapusBarang, setIsHapusBarang] = useState(false);
  const [isTableLoadAmbil, setIsTableLoadAmbil] = useState(false);
  const [isAddAmbil, setIsAddAmbil] = useState(false);
  const [isEditAmbil, setIsEditAmbil] = useState(false);
  const [isHapusAmbil, setIsHapusAmbil] = useState(false);

  // PopUp
  const [showEditJenis, setShowEditJenis] = useState(false);
  const [showTambahBarang, setShowTambahBarang] = useState(false);
  const [showTambahAset, setShowTambahAset] = useState(false);
  const [showEditBarang, setShowEditBarang] = useState(false);
  const [showHapusBarang, setShowHapusBarang] = useState(false);
  const [showTambahAmbil, setShowTambahAmbil] = useState(false);
  const [showEditAmbil, setShowEditAmbil] = useState(false);
  const [showHapusAmbil, setShowHapusAmbil] = useState(false);

  // Dropdown
  const [jenisData, setJenisData] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [barangDataDropdown, setBarangDataDropdown] = useState<
    Array<{ value: string; label: string }>
  >([]);

  //Field
  const [period, setPeriod] = useState<{ value: string; label: string }>();
  const [tanggalBarang, setTanggalBarang] = useState<Date | null>();
  const [namaBarang, setNamaBarang] = useState("");
  const [jenisBarang, setJenisBarang] = useState<{
    value: string;
    label: string;
  }>();
  const [jumlahBarang, setJumlahBarang] = useState("");
  const [satuanBarang, setSatuanBarang] = useState("");
  const [barangAmbil, setBarangAmbil] = useState<{
    value: string;
    label: string;
  }>();
  const [jumlahAmbil, setJumlahAmbil] = useState("");
  const [namaPengambil, setNamaPengambil] = useState("");
  const [tanggalAmbil, setTanggalAmbil] = useState<Date | null>();
  const [searchBarang, setSearchBarang] = useState("");
  const [searchAset, setSearchAset] = useState("");
  const [searchAmbil, setSearchAmbil] = useState("");

  // Data
  const [dataBarang, setDataBarang] = useState([]);
  const [dataAset, setDataAset] = useState([]);
  const [dataAmbil, setDataAmbil] = useState([]);

  // Table Barang
  const [pageBarang, setPageBarang] = useState(1);
  const [totalPageBarang, setTotalPageBarang] = useState(1);
  const [totalDataBarang, setTotalDataBarang] = useState(0);
  const [pageAset, setPageAset] = useState(1);
  const [totalPageAset, setTotalPageAset] = useState(1);
  const [totalDataAset, setTotalDataAset] = useState(0);
  const [idEditBarang, setIdEditBarang] = useState(-1);
  const [jenisIdBarang, setJenisIdBarang] = useState<Array<number>>([]);
  const [onSelectedBarang, setOnSelectedBarang] = useState<Array<number>>([]);
  const [onSelectedAset, setOnSelectedAset] = useState<Array<number>>([]);

  // Table Barang
  const [pageAmbil, setPageAmbil] = useState(1);
  const [totalPageAmbil, setTotalPageAmbil] = useState(1);
  const [totalDataAmbil, setTotalDataAmbil] = useState(0);
  const [idEditAmbil, setIdEditAmbil] = useState(-1);
  const [jenisIdAmbil, setJenisIdAmbil] = useState<Array<number>>([]);
  const [onSelectedAmbil, setOnSelectedAmbil] = useState<Array<number>>([]);
  const kolomBarang = ["No", "Tanggal", "Barang", "Jenis", "Jumlah", "Satuan"];
  const kolomAmbil = [
    "No",
    "Tanggal",
    "Nama",
    "Barang",
    "Jenis",
    "Jumlah",
    "Satuan",
  ];

  const { user } = useContext(UserContext);
  const token = user?.token;

  const getData = async () => {
    if (token) {
      try {
        const jenis = await getWithAuth(token, "jenis-barang");
        setJenisData(
          jenis.data.data.map((data: any) => {
            return { value: data.id, label: data.nama };
          })
        );
        setJenisIdBarang(jenis.data.data.map((data: any) => data.id));
        setJenisIdAmbil(jenis.data.data.map((data: any) => data.id));
      } catch (error) {
        toastError("Get Some Data Failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStok = async () => {
    setOnSelectedBarang([]);
    setIsTableLoadBarang(true);
    if (token) {
      try {
        var filter = "";
        jenisIdBarang.forEach((id, idx) => {
          filter += `&jenis_id[${idx}]=${id}`;
        });
        const barang = await getWithAuth(
          token,
          `barang?kategori_barang=Stok&limit=10&page=${pageBarang}&month=${
            period ? period?.value.split("-")[0] : ""
          }&year=${
            period ? period?.value.split("-")[1] : ""
          }&search=${searchBarang}${filter}${
            user.role == "OFFICER" ? "&user_id=" + user.id : ""
          }`
        );
        setDataBarang(
          barang.data.data.data.map((data: any) => {
            return {
              id: data.id,
              tanggal: moment(data.tanggal).format("DD MMMM YYYY"),
              nama_barang: data.nama_barang,
              jenis: data.jenis.nama,
              jumlah: sparator(data.jumlah),
              satuan: data.satuan,
            };
          })
        );
        setTotalPageBarang(barang.data.data.last_page);
        setTotalDataBarang(barang.data.data.total);
        setBarangDataDropdown(
          barang.data.data.data.map((data: any) => {
            return {
              value: data.id,
              label: data.nama_barang,
            };
          })
        );
      } catch (error) {
        toastError("Get Data Barang Table Failed");
      } finally {
        setIsTableLoadBarang(false);
      }
    }
  };

  const getAset = async () => {
    setOnSelectedAset([]);
    setIsTableLoadBarang(true);
    if (token) {
      try {
        var filter = "";
        jenisIdBarang.forEach((id, idx) => {
          filter += `&jenis_id[${idx}]=${id}`;
        });
        const barang = await getWithAuth(
          token,
          `barang?kategori_barang=Aset&limit=10&page=${pageAset}&month=${
            period ? period?.value.split("-")[0] : ""
          }&year=${
            period ? period?.value.split("-")[1] : ""
          }&search=${searchAset}${filter}${
            user.role == "OFFICER" ? "&user_id=" + user.id : ""
          }`
        );
        setDataAset(
          barang.data.data.data.map((data: any) => {
            return {
              id: data.id,
              tanggal: moment(data.tanggal).format("DD MMMM YYYY"),
              nama_barang: data.nama_barang,
              jenis: data.jenis.nama,
              jumlah: sparator(data.jumlah),
              satuan: data.satuan,
            };
          })
        );
        setTotalPageAset(barang.data.data.last_page);
        setTotalDataAset(barang.data.data.total);
      } catch (error) {
        toastError("Get Data Barang Table Failed");
      } finally {
        setIsTableLoadBarang(false);
      }
    }
  };

  const getAmbil = async () => {
    setOnSelectedAmbil([]);
    setIsTableLoadAmbil(true);
    if (token) {
      try {
        var filter = "";
        jenisIdAmbil.forEach((id, idx) => {
          filter += `&jenis_id[${idx}]=${id}`;
        });
        const ambil = await getWithAuth(
          token,
          `pengambilan?limit=10&page=${pageAmbil}&month=${
            period ? period?.value.split("-")[0] : ""
          }&year=${
            period ? period?.value.split("-")[1] : ""
          }&search=${searchAmbil}${filter}${
            user.role == "OFFICER" ? "&user_id=" + user.id : ""
          }`
        );
        setDataAmbil(
          ambil.data.data.data.map((data: any) => {
            return {
              id: data.id,
              tanggal: moment(data.tanggal).format("DD MMMM YYYY"),
              nama_pengambil: data.nama_pengambil,
              nama_barang: data.barang.nama_barang,
              jenis: data.barang.jenis.nama,
              jumlah: sparator(data.jumlah),
              satuan: data.barang.satuan,
            };
          })
        );
        setTotalPageAmbil(ambil.data.data.last_page);
        setTotalDataAmbil(ambil.data.data.total);
      } catch (error) {
        toastError("Get Data Pengambilan Table Failed");
      } finally {
        setIsTableLoadAmbil(false);
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getStok();
  }, [
    pageBarang,
    totalDataBarang,
    period,
    searchBarang,
    jenisIdBarang,
    totalDataAmbil,
  ]);

  useEffect(() => {
    getAset();
  }, [
    pageAset,
    totalDataAset,
    period,
    searchAset,
    jenisIdBarang,
    totalDataBarang,
  ]);

  useEffect(() => {
    getAmbil();
  }, [
    pageAmbil,
    totalDataAmbil,
    period,
    searchAmbil,
    jenisIdAmbil,
    totalDataBarang,
  ]);

  const tambahJenis = async (nama: string) => {
    try {
      const response = await postWithAuth(
        "jenis-barang",
        {
          nama: nama,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setJenisData([
        ...jenisData,
        {
          value: response.data.data.id,
          label: response.data.data.nama,
        },
      ]);
      setJenisIdBarang([...jenisIdBarang, response.data.data.id]);
      setJenisIdAmbil([...jenisIdAmbil, response.data.data.id]);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    }
  };

  const deleteJenis = async (id: string) => {
    try {
      const response = await postWithAuth(
        "delete-jenis-barang",
        {
          id: id,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setJenisData([...jenisData.filter((el) => el.value != id)]);
      setJenisIdBarang([
        ...jenisIdBarang.filter((el) => el != Number.parseInt(id)),
      ]);
      setJenisIdAmbil([
        ...jenisIdAmbil.filter((el) => el != Number.parseInt(id)),
      ]);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    }
  };

  const editJenis = async (id: string, nama: string) => {
    try {
      const response = await postWithAuth(
        "update-jenis-barang",
        {
          id: id,
          nama: nama,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      var found = jenisData.find((element) => element.value == id);
      var idx = jenisData.indexOf(found!);
      var tempData = [...jenisData.filter((el) => el.value != id)];
      var tempBarangId = [
        ...jenisIdBarang.filter((el) => el != Number.parseInt(id)),
      ];
      var tempAmbilId = [
        ...jenisIdAmbil.filter((el) => el != Number.parseInt(id)),
      ];
      setJenisData([
        ...tempData.slice(0, idx),
        { value: id, label: nama },
        ...tempData.slice(idx),
      ]);
      setJenisIdBarang([
        ...tempBarangId.slice(0, idx),
        Number.parseInt(id),
        ...tempBarangId.slice(idx),
      ]);
      setJenisIdAmbil([
        ...tempAmbilId.slice(0, idx),
        Number.parseInt(id),
        ...tempAmbilId.slice(idx),
      ]);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    }
  };

  const tambahBarang = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddBarang(true);
    try {
      const response = await postWithAuth(
        "barang",
        {
          nama_barang: namaBarang,
          tanggal: moment(tanggalBarang).format("YYYY-MM-DD HH:mm:ss"),
          jenis_barang_id: jenisBarang?.value,
          kategori_barang: "Stok",
          jumlah: sparatorReverse(jumlahBarang),
          satuan: satuanBarang,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowTambahBarang(false);
      setTotalDataBarang(totalDataBarang + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsAddBarang(false);
    }
  };

  const tambahAset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddBarang(true);
    try {
      const response = await postWithAuth(
        "barang",
        {
          nama_barang: namaBarang,
          tanggal: moment(tanggalBarang).format("YYYY-MM-DD HH:mm:ss"),
          jenis_barang_id: jenisBarang?.value,
          kategori_barang: "Aset",
          jumlah: sparatorReverse(jumlahBarang),
          satuan: satuanBarang,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowTambahAset(false);
      setTotalDataAset(totalDataAset + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsAddBarang(false);
    }
  };

  const editBarang = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditBarang(true);
    try {
      const response = await postWithAuth(
        "update-barang",
        {
          id: idEditBarang,
          nama_barang: namaBarang,
          tanggal: moment(tanggalBarang).format("YYYY-MM-DD HH:mm:ss"),
          jenis_barang_id: jenisBarang?.value,
          jumlah: sparatorReverse(jumlahBarang),
          satuan: satuanBarang,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowEditBarang(false);
      setTotalDataBarang(totalDataBarang + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsEditBarang(false);
    }
  };

  const hapusBarang = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsHapusBarang(true);
    try {
      const response = await postWithAuth(
        "delete-barang",
        {
          selectedId: onSelectedBarang,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowHapusBarang(false);
      setTotalDataBarang(totalDataBarang + 1);
    } catch (error) {
      toastError((error as any).response.data.meta.message as string);
    } finally {
      setIsHapusBarang(false);
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
      setTotalDataAmbil(totalDataAmbil + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsAddAmbil(false);
    }
  };

  const editAmbil = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditAmbil(true);
    try {
      const response = await postWithAuth(
        "update-pengambilan",
        {
          id: idEditAmbil,
          tanggal: moment(tanggalAmbil).format("YYYY-MM-DD HH:mm:ss"),
          barang_id: barangAmbil?.value,
          jumlah: sparatorReverse(jumlahAmbil),
          nama_pengambil: namaPengambil,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowEditAmbil(false);
      setTotalDataAmbil(totalDataAmbil + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsEditAmbil(false);
    }
  };

  const hapusAmbil = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsHapusAmbil(true);
    try {
      const response = await postWithAuth(
        "delete-pengambilan",
        {
          selectedId: onSelectedAmbil,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowHapusAmbil(false);
      setTotalDataAmbil(totalDataAmbil + 1);
    } catch (error) {
      toastError((error as any).response.data.meta.message as string);
    } finally {
      setIsHapusAmbil(false);
    }
  };

  return (
    <>
      <LoadingPage isLoad={isLoading} />

      {/* Edit Jenis */}
      <EditModal
        dataItems={jenisData}
        visible={showEditJenis}
        onClose={() => setShowEditJenis(false)}
        onEdit={(e) => editJenis(e.value, e.label)}
        onDelete={(e) => deleteJenis(e)}
        onAdd={(e) => tambahJenis(e)}
        title={"Jenis"}
      />

      {/* Add Barang */}
      <Modal
        visible={showTambahBarang}
        onClose={() => setShowTambahBarang(false)}
      >
        <form
          onSubmit={(e) => tambahBarang(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Tambah Stok
          </h1>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Nama Barang</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Nama Barang"}
                onChange={(e) => setNamaBarang(e.target.value)}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Jenis Barang</p>
              <Dropdown
                required
                placeholder={"Jenis Barang"}
                type={"Jenis Barang"}
                options={jenisData}
                onChange={(e) => setJenisBarang(e!)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Jumlah Barang</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Jumlah Stok"}
                value={sparator(jumlahBarang)}
                onChange={(e) => setJumlahBarang(e.target.value)}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Satuan</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Satuan"}
                onChange={(e) => setSatuanBarang(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Tanggal</p>
              <DateFieldNormal
                required
                text={"Masukkan Tanggal"}
                onChange={(val: Date) => setTanggalBarang(val)}
                value={tanggalBarang}
              />
            </div>
          </div>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowTambahBarang(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              text={"Simpan Data"}
              type={"submit"}
              style={"primary"}
              isLoading={isAddBarang}
            />
          </div>
        </form>
      </Modal>

      {/* Add Aset */}  
      <Modal
        visible={showTambahAset}
        onClose={() => setShowTambahAset(false)}
      >
        <form
          onSubmit={(e) => tambahAset(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Tambah Aset
          </h1>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Nama Barang</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Nama Barang"}
                onChange={(e) => setNamaBarang(e.target.value)}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Jenis Barang</p>
              <Dropdown
                required
                placeholder={"Jenis Barang"}
                type={"Jenis Barang"}
                options={jenisData}
                onChange={(e) => setJenisBarang(e!)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Jumlah Barang</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Jumlah Stok"}
                value={sparator(jumlahBarang)}
                onChange={(e) => setJumlahBarang(e.target.value)}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Satuan</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Satuan"}
                onChange={(e) => setSatuanBarang(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Tanggal</p>
              <DateFieldNormal
                required
                text={"Masukkan Tanggal"}
                onChange={(val: Date) => setTanggalBarang(val)}
                value={tanggalBarang}
              />
            </div>
          </div>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowTambahAset(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              text={"Simpan Data"}
              type={"submit"}
              style={"primary"}
              isLoading={isAddBarang}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Barang */}
      <Modal visible={showEditBarang} onClose={() => setShowEditBarang(false)}>
        <form
          onSubmit={(e) => editBarang(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Edit Barang
          </h1>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Nama Barang</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Nama Barang"}
                onChange={(e) => setNamaBarang(e.target.value)}
                value={namaBarang}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Jenis Barang</p>
              <Dropdown
                required
                placeholder={"Jenis Barang"}
                type={"Jenis Barang"}
                options={jenisData}
                onChange={(e) => setJenisBarang(e!)}
                value={jenisBarang}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Jumlah Barang</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Jumlah Stok"}
                onChange={(e) => setJumlahBarang(e.target.value)}
                value={sparator(jumlahBarang)}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Satuan</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Satuan"}
                onChange={(e) => setSatuanBarang(e.target.value)}
                value={satuanBarang}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Tanggal</p>
              <DateFieldNormal
                required
                text={"Masukkan Tanggal"}
                onChange={(val: Date) => setTanggalBarang(val)}
                value={tanggalBarang}
              />
            </div>
          </div>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowEditBarang(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              text={"Simpan Data"}
              type={"submit"}
              style={"primary"}
              isLoading={isEditBarang}
            />
          </div>
        </form>
      </Modal>

      {/* Hapus Barang */}
      <Modal
        visible={showHapusBarang}
        onClose={() => setShowHapusBarang(false)}
      >
        <form
          onSubmit={(e) => hapusBarang(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Hapus Barang
          </h1>
          <p className="mb-5 w-full text-center text-12 xl:text-left xl:text-16">
            Apakah Anda yakin menghapus data?
          </p>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowHapusBarang(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              isLoading={isHapusBarang}
              text={"Hapus Data"}
              type={"submit"}
              style={"primary"}
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

      {/* Edit Ambil */}
      <Modal visible={showEditAmbil} onClose={() => setShowEditAmbil(false)}>
        <form
          onSubmit={(e) => editAmbil(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Edit Ambil Barang
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
                placeholder={"Kategori"}
                type={"Kategori"}
                options={barangDataDropdown}
                value={barangAmbil}
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
                onChange={(e) => setNamaPengambil(e.target.value)}
                value={namaPengambil}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Jumlah Pengambilan</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Jumlah"}
                onChange={(e) => setJumlahAmbil(e.target.value)}
                value={sparator(jumlahAmbil)}
              />
            </div>
          </div>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowEditAmbil(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              text={"Simpan Data"}
              type={"submit"}
              style={"primary"}
              isLoading={isEditAmbil}
            />
          </div>
        </form>
      </Modal>

      {/* Hapus Ambil */}
      <Modal visible={showHapusAmbil} onClose={() => setShowHapusAmbil(false)}>
        <form
          onSubmit={(e) => hapusAmbil(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Hapus Ambil Barang
          </h1>
          <p className="mb-5 w-full text-center text-12 xl:text-left xl:text-16">
            Apakah Anda yakin menghapus data?
          </p>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowHapusAmbil(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              isLoading={isHapusAmbil}
              text={"Hapus Data"}
              type={"submit"}
              style={"primary"}
            />
          </div>
        </form>
      </Modal>

      <div className="flex min-h-screen w-full flex-col bg-background px-5 pb-24 pt-[104px] xl:px-24">
        <h1 className="mb-12 hidden text-40 font-bold xl:block">Stok</h1>
        <div className="flex w-full items-center justify-between xl:justify-start">
          <p className="w-auto text-16 font-bold xl:w-[250px] xl:text-24 ">
            Periode
          </p>
          <div className="w-[160px] md:w-[200px]">
            <Dropdown
              placeholder={"Select Period"}
              type={"month"}
              options={dataMonth(new Date("01/01/2000"), new Date())}
              onChange={(e) => setPeriod(e!)}
            />
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-5 xl:flex-row">
          <div className="flex flex-col w-full">
            <div className="flex w-full flex-col rounded-xl bg-white py-5 shadow-card">
              <div className="mb-5 flex justify-end gap-5 px-3">
                {user?.role == "BOD" && (
                  <Button
                    onClick={() => setShowEditJenis(true)}
                    type="button"
                    style="third"
                    text="Edit Jenis"
                  />
                )}
                <Button
                  onClick={() => {
                    setShowTambahBarang(true);
                    // Reset
                    setJumlahBarang("");
                    setTanggalBarang(
                      period
                        ? new Date(
                            `${period.value.split("-")[1]}-${
                              period.value.split("-")[0]
                            }-01`
                          )
                        : null
                    );
                  }}
                  type="button"
                  style="primary"
                  text="Tambah Stok +"
                />
              </div>
              <div className="mb-5 flex w-full items-center justify-between gap-8 px-3">
                <p className="hidden text-16 font-bold xl:block xl:text-20">
                  Daftar Stok
                </p>
                <div className="flex items-center gap-2">
                  <TextField
                    type={"search"}
                    placeholder={"Cari"}
                    onChange={(e) => setSearchBarang(e.target.value)}
                  />
                  <Filter
                    onSelected={(val) => setJenisIdBarang(val)}
                    selected={jenisIdBarang}
                    data={jenisData}
                  />
                </div>
                <div
                  className={`${
                    onSelectedBarang.length > 0 ? "visible" : "invisible"
                  }`}
                >
                  <Button
                    onClick={() => setShowHapusBarang(true)}
                    text={"Hapus"}
                    type={"button"}
                    style={"delete"}
                  />
                </div>
              </div>
              <Table
                data={dataBarang}
                column={kolomBarang}
                isLoading={isTableLoadBarang}
                page={pageBarang}
                dataLimit={10}
                isEdit={user?.role == "BOD"}
                isCheck={user?.role == "BOD"}
                onEdit={(val) => {
                  setIdEditBarang((dataBarang[val] as any).id);
                  setShowEditBarang(true);
                  setJenisBarang(
                    jenisData.filter(
                      (item) => item.label == (dataBarang[val] as any).jenis
                    )[0]
                  );
                  setNamaBarang((dataBarang[val] as any).nama_barang);
                  setJumlahBarang((dataBarang[val] as any).jumlah);
                  setSatuanBarang((dataBarang[val] as any).satuan);
                  setTanggalBarang(
                    moment(
                      Date.parse((dataBarang[val] as any).tanggal)
                    ).toDate()
                  );
                }}
                onSelected={(val) => setOnSelectedBarang(val)}
                selected={onSelectedBarang}
              />
              <Paginate
                totalPages={totalPageBarang}
                current={(page) => setPageBarang(page)}
                totalData={totalDataBarang}
                dataLimit={10}
              />
            </div>
            <div className="flex w-full flex-col rounded-xl bg-white py-5 shadow-card mt-4">
              <div className="mb-5 flex justify-end gap-5 px-3">
                <Button
                  onClick={() => {
                    setShowTambahAset(true);
                    // Reset
                    setJumlahBarang("");
                    setTanggalBarang(
                      period
                        ? new Date(
                            `${period.value.split("-")[1]}-${
                              period.value.split("-")[0]
                            }-01`
                          )
                        : null
                    );
                  }}
                  type="button"
                  style="primary"
                  text="Tambah Aset +"
                />
              </div>
              <div className="mb-5 flex w-full items-center justify-between gap-8 px-3">
                <p className="hidden text-16 font-bold xl:block xl:text-20">
                  Daftar Aset
                </p>
                <div className="flex items-center gap-2">
                  <TextField
                    type={"search"}
                    placeholder={"Cari"}
                    onChange={(e) => setSearchAset(e.target.value)}
                  />
                  <Filter
                    onSelected={(val) => setJenisIdBarang(val)}
                    selected={jenisIdBarang}
                    data={jenisData}
                  />
                </div>
                <div
                  className={`${
                    onSelectedAset.length > 0 ? "visible" : "invisible"
                  }`}
                >
                  <Button
                    onClick={() => setShowHapusBarang(true)}
                    text={"Hapus"}
                    type={"button"}
                    style={"delete"}
                  />
                </div>
              </div>
              <Table
                data={dataAset}
                column={kolomBarang}
                isLoading={isTableLoadBarang}
                page={pageAset}
                dataLimit={10}
                isEdit={user?.role == "BOD"}
                isCheck={user?.role == "BOD"}
                onEdit={(val) => {
                  setIdEditBarang((dataAset[val] as any).id);
                  setShowEditBarang(true);
                  setJenisBarang(
                    jenisData.filter(
                      (item) => item.label == (dataAset[val] as any).jenis
                    )[0]
                  );
                  setNamaBarang((dataAset[val] as any).nama_barang);
                  setJumlahBarang((dataAset[val] as any).jumlah);
                  setSatuanBarang((dataAset[val] as any).satuan);
                  setTanggalBarang(
                    moment(
                      Date.parse((dataAset[val] as any).tanggal)
                    ).toDate()
                  );
                }}
                onSelected={(val) => setOnSelectedAset(val)}
                selected={onSelectedAset}
              />
              <Paginate
                totalPages={totalPageAset}
                current={(page) => setPageAset(page)}
                totalData={totalDataAset}
                dataLimit={10}
              />
            </div>
          </div>
          <div className="flex w-full flex-col rounded-xl bg-white py-5 shadow-card xl:w-1/2">
            <div className="mb-5 flex justify-end gap-5 px-3">
              <Button
                onClick={() => {
                  setShowTambahAmbil(true);
                  setNamaPengambil(user!.nama);
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
                type="button"
                style="primary"
                text="Ambil Stok"
              />
            </div>
            <div className="mb-5 flex w-full items-center justify-between gap-8 px-3">
              <p className="hidden text-16 font-bold xl:block xl:text-20">
                Daftar Pengambil
              </p>
              <div className="flex items-center gap-2">
                <TextField
                  type={"search"}
                  placeholder={"Cari"}
                  onChange={(e) => setSearchAmbil(e.target.value)}
                />
                <Filter
                  onSelected={(val) => setJenisIdAmbil(val)}
                  selected={jenisIdAmbil}
                  data={jenisData}
                />
              </div>
              <div
                className={`${
                  onSelectedAmbil.length > 0 ? "visible" : "invisible"
                }`}
              >
                <Button
                  onClick={() => setShowHapusAmbil(true)}
                  text={"Hapus"}
                  type={"button"}
                  style={"delete"}
                />
              </div>
            </div>
            <Table
              data={dataAmbil}
              column={kolomAmbil}
              isLoading={isTableLoadAmbil}
              page={pageAmbil}
              dataLimit={10}
              isEdit={user?.role == "BOD"}
              isCheck={user?.role == "BOD"}
              onEdit={(val) => {
                setIdEditAmbil((dataAmbil[val] as any).id);
                setShowEditAmbil(true);
                setBarangAmbil(
                  barangDataDropdown.filter(
                    (item) => item.label == (dataAmbil[val] as any).nama_barang
                  )[0]
                );
                setJumlahAmbil((dataAmbil[val] as any).jumlah);
                setNamaPengambil((dataAmbil[val] as any).nama_pengambil);
                setTanggalAmbil(
                  moment(Date.parse((dataAmbil[val] as any).tanggal)).toDate()
                );
              }}
              onSelected={(val) => setOnSelectedAmbil(val)}
              selected={onSelectedAmbil}
            />
            <Paginate
              totalPages={totalPageAmbil}
              current={(page) => setPageAmbil(page)}
              totalData={totalDataAmbil}
              dataLimit={10}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Stok;
