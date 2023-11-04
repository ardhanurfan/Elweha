import { useContext, useEffect, useState } from "react";
import Button from "../../components/Button";
import Dropdown from "../../components/Dropdown";
import TextField from "../../components/TextField";
import Table from "../../components/Table";
import Paginate from "../../components/Paginate";
import Modal from "../../components/Modal";
import DateFieldNormal from "../../components/DateFieldNormal";
import TextArea from "../../components/TextArea";
import LoadingPage from "../../components/LoadingPage";
import { getWithAuth, postWithAuth, postWithAuthJson } from "../../api/api";
import { toastError, toastSuccess } from "../../components/Toast";
import moment from "moment";
import { dataMonth } from "../../data/month";
import { FormatRupiah } from "@arismun/format-rupiah";
import Filter from "../../components/Filter";
import { formatRp, formatRpReverse } from "../../data/formatRp";
import { UserContext } from "../../Context/UserContext";
import { sparator, sparatorReverse } from "../../data/sparator";
import EditModal from "../../components/EditModal";
import UploadFile from "../../components/UploadFile";
import * as XLSX from "xlsx";
import { readPengeluaran } from "../../data/excelToJson";
import * as FileSaver from "file-saver";

function Pengeluaran() {
  // Loading
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoad, setIsTableLoad] = useState(false);
  const [isAddPengeluaran, setIsAddPengeluaran] = useState(false);
  const [isEditPengeluaran, setIsEditPengeluaran] = useState(false);
  const [isHapusPengeluaran, setIsHapusPengeluaran] = useState(false);

  // PopUp
  const [showEditKategori, setShowEditKategori] = useState(false);
  const [showEditJenis, setShowEditJenis] = useState(false);
  const [showTambahPengeluaran, setShowTambahPengeluaran] = useState(false);
  const [showEditPengeluaran, setShowEditPengeluaran] = useState(false);
  const [showHapusPengeluaran, setShowHapusPengeluaran] = useState(false);

  // Dropdown
  const [kategoriData, setKategoriData] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [jenisData, setJenisData] = useState<
    Array<{ value: string; label: string }>
  >([]);

  //Field
  const [period, setPeriod] = useState<{ value: string; label: string }>();
  const [kategori, setKategori] = useState<{ value: string; label: string }>();
  const [jenis, setJenis] = useState<{ value: string; label: string }>();
  const [tanggal, setTanggal] = useState<Date | null>();
  const [jumlah, setJumlah] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [search, setSearch] = useState("");

  // Data
  const [data, setData] = useState([]);
  const [exportData, setExportData] = useState([]);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);

  // Table
  const kolom = ["No", "Tanggal", "Kategori", "Jenis", "Jumlah", "Notes"];
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [idEdit, setIdEdit] = useState(-1);
  const [kategoriId, setKategoriId] = useState<Array<number>>([]);
  const [onSelected, setOnSelected] = useState<Array<number>>([]);

  //Upload File
  const [showUpload, setShowUpload] = useState(false);
  const [isUpload, setIsUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const { user } = useContext(UserContext);
  const token = user?.token;

  const getData = async () => {
    if (token) {
      try {
        const kategori = await getWithAuth(token, "kategori-pengeluaran");
        setKategoriData(
          kategori.data.data.map((data: any) => {
            return { value: data.id, label: data.nama };
          })
        );
        setKategoriId(kategori.data.data.map((data: any) => data.id));
        const jenis = await getWithAuth(token, "jenis-pengeluaran");
        setJenisData(
          jenis.data.data.map((data: any) => {
            return { value: data.id, label: data.nama };
          })
        );
      } catch (error) {
        toastError("Get Some Data Failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getPengeluaran = async () => {
    setOnSelected([]);
    setIsTableLoad(true);
    if (token) {
      try {
        var filter = "";
        kategoriId.forEach((id, idx) => {
          filter += `&kategori_id[${idx}]=${id}`;
        });
        const pengeluaran = await getWithAuth(
          token,
          `pengeluaran?limit=10&page=${page}&month=${
            period ? period?.value.split("-")[0] : ""
          }&year=${
            period ? period?.value.split("-")[1] : ""
          }&search=${search}${filter}${
            user.role == "OFFICER" ? "&user_id=" + user.id : ""
          }`
        );
        const pengeluaran1 = await getWithAuth(
          token,
          `pengeluaran?month=${
            period ? period?.value.split("-")[0] : ""
          }&year=${
            period ? period?.value.split("-")[1] : ""
          }&search=${search}${filter}${
            user.role == "OFFICER" ? "&user_id=" + user.id : ""
          }`
        );
        setData(
          pengeluaran.data.data.table.data.map((data: any) => {
            return {
              id: data.id,
              tanggal: moment(data.tanggal).format("DD MMMM YYYY"),
              kategori: data.kategori.nama,
              jenis: data.jenis.nama,
              jumlah: formatRp(data.jumlah),
              deskripsi: data.deskripsi,
            };
          })
        );
        setExportData(
          pengeluaran1.data.data.table.data.map((data: any) => {
            return {
              id: data.id,
              tanggal: moment(data.tanggal).format("DD MMMM YYYY"),
              kategori: data.kategori.nama,
              jenis: data.jenis.nama,
              jumlah: formatRp(data.jumlah),
              deskripsi: data.deskripsi,
            };
          })
        );
        setTotalPengeluaran(pengeluaran.data.data.total_pengeluaran);
        setTotalPage(pengeluaran.data.data.table.last_page);
        setTotalData(pengeluaran.data.data.table.total);
      } catch (error) {
        toastError("Get Data Table Failed");
      } finally {
        setIsTableLoad(false);
      }
    }
  };

  useEffect(() => {
    getData();
  }, [totalData]);

  useEffect(() => {
    getPengeluaran();
  }, [page, totalData, period, search, kategoriId]);

  const tambahKategori = async (nama: string) => {
    try {
      const response = await postWithAuth(
        "kategori-pengeluaran",
        {
          nama: nama,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setKategoriData([
        ...kategoriData,
        {
          value: response.data.data.id,
          label: response.data.data.nama,
        },
      ]);
      setKategoriId([...kategoriId, response.data.data.id]);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    }
  };

  const deleteKategori = async (id: string) => {
    try {
      const response = await postWithAuth(
        "delete-kategori-pengeluaran",
        {
          id: id,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setKategoriData([...kategoriData.filter((el) => el.value != id)]);
      setKategoriId([...kategoriId.filter((el) => el != Number.parseInt(id))]);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    }
  };

  const editKategori = async (id: string, nama: string) => {
    try {
      const response = await postWithAuth(
        "update-kategori-pengeluaran",
        {
          id: id,
          nama: nama,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      var found = kategoriData.find((element) => element.value == id);
      var idx = kategoriData.indexOf(found!);
      var tempData = [...kategoriData.filter((el) => el.value != id)];
      var tempId = [...kategoriId.filter((el) => el != Number.parseInt(id))];
      setKategoriData([
        ...tempData.slice(0, idx),
        { value: id, label: nama },
        ...tempData.slice(idx),
      ]);
      setKategoriId([
        ...tempId.slice(0, idx),
        Number.parseInt(id),
        ...tempId.slice(idx),
      ]);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    }
  };

  const tambahJenis = async (nama: string) => {
    try {
      const response = await postWithAuth(
        "jenis-pengeluaran",
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
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    }
  };

  const deleteJenis = async (id: string) => {
    try {
      const response = await postWithAuth(
        "delete-jenis-pengeluaran",
        {
          id: id,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setJenisData([...jenisData.filter((el) => el.value != id)]);
      setTotalData(totalData + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    }
  };

  const editJenis = async (id: string, nama: string) => {
    try {
      const response = await postWithAuth(
        "update-jenis-pengeluaran",
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
      setJenisData([
        ...tempData.slice(0, idx),
        { value: id, label: nama },
        ...tempData.slice(idx),
      ]);
      setTotalData(totalData + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
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
          kategori_pengeluaran_id: kategori?.value,
          jenis_pengeluaran_id: jenis?.value,
          jumlah: sparatorReverse(jumlah),
          deskripsi: deskripsi,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowTambahPengeluaran(false);
      setTotalData(totalData + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsAddPengeluaran(false);
    }
  };

  const editPengeluaran = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditPengeluaran(true);
    try {
      const response = await postWithAuth(
        "update-pengeluaran",
        {
          id: idEdit,
          tanggal: moment(tanggal).format("YYYY-MM-DD HH:mm:ss"),
          kategori_pengeluaran_id: kategori?.value,
          jenis_pengeluaran_id: jenis?.value,
          jumlah: sparatorReverse(jumlah),
          deskripsi: deskripsi,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowEditPengeluaran(false);
      setTotalData(totalData + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsEditPengeluaran(false);
    }
  };

  const hapusPengeluaran = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsHapusPengeluaran(true);
    try {
      const response = await postWithAuth(
        "delete-pengeluaran",
        {
          selectedId: onSelected,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowHapusPengeluaran(false);
      setTotalData(totalData + 1);
    } catch (error) {
      toastError((error as any).response.data.meta.message as string);
    } finally {
      setIsHapusPengeluaran(false);
    }
  };

  const uploadFile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpload(true);
    try {
      let selectedFile = file;
      const fileType = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (selectedFile) {
        if (selectedFile && fileType.includes(selectedFile.type)) {
          let reader = new FileReader();
          reader.readAsArrayBuffer(selectedFile);
          reader.onload = async (e) => {
            var excelFile = e.target!.result;
            const workbook = XLSX.read(excelFile, { type: "buffer" });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            try {
              await postWithAuthJson(
                "upload-pengeluaran",
                readPengeluaran(data),
                token ?? ""
              );
              toastSuccess("Upload successfully");
              setShowUpload(false);
              setTotalData(totalData + 1 + readPengeluaran(data).length);
            } catch (error) {
              toastError(error as string);
            }
          };
        } else {
          toastError("Please select only excel file types");
          setFile(null);
        }
      } else {
        toastError("Please select your file");
      }
    } catch (error) {
      toastError("Upload file failed");
    } finally {
      setIsUpload(false);
    }
  };

  const ExportFile = (data: any, name: string) => {
    try {
      if (data.length > 0){
        const fileType = [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ];
        const fileExtension = ".xlsx";
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const datum = new Blob([excelBuffer], { type: fileType[0] });
        FileSaver.saveAs(datum, name + fileExtension);
      }else{
        toastError("Export file failed. Data is empty");
      }
    } catch (error) {
      toastError("Export file failed");
    }
  };

  return (
    <>
      <LoadingPage isLoad={isLoading} />

      {/* Edit Kategori */}
      <EditModal
        dataItems={kategoriData}
        visible={showEditKategori}
        onClose={() => setShowEditKategori(false)}
        onEdit={(e) => editKategori(e.value, e.label)}
        onDelete={(e) => deleteKategori(e)}
        onAdd={(e) => tambahKategori(e)}
        title={"Kategori"}
      />

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
                options={kategoriData}
                onChange={(e) => setKategori(e!)}
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

      {/* Edit Pengeluaran */}
      <Modal
        visible={showEditPengeluaran}
        onClose={() => setShowEditPengeluaran(false)}
      >
        <form
          onSubmit={(e) => editPengeluaran(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Edit Pengeluaran
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
                options={kategoriData}
                onChange={(e) => setKategori(e!)}
                value={kategori}
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
                onChange={(e) => setJumlah(e.target.value)}
                value={sparator(jumlah)}
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
                value={jenis}
              />
            </div>
          </div>
          <div className="w-full">
            <p className="mb-2 text-16 font-semibold">Deskripsi</p>
            <TextArea
              required
              placeholder={"Deskripsi"}
              onChange={(e) => setDeskripsi(e.target.value)}
              value={deskripsi}
            />
          </div>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowEditPengeluaran(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              text={"Edit Data"}
              type={"submit"}
              style={"primary"}
              isLoading={isEditPengeluaran}
            />
          </div>
        </form>
      </Modal>

      {/* Hapus Pengeluaran */}
      <Modal
        visible={showHapusPengeluaran}
        onClose={() => setShowHapusPengeluaran(false)}
      >
        <form
          onSubmit={(e) => hapusPengeluaran(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Hapus Pengeluaran
          </h1>
          <p className="mb-5 w-full text-center text-12 xl:text-left xl:text-16">
            Apakah Anda yakin menghapus data?
          </p>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowHapusPengeluaran(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              isLoading={isHapusPengeluaran}
              text={"Hapus Data"}
              type={"submit"}
              style={"primary"}
            />
          </div>
        </form>
      </Modal>

      {/* Upload Pengeluaran */}
      <Modal visible={showUpload} onClose={() => setShowUpload(false)}>
        <form
          onSubmit={(e) => uploadFile(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Upload File Pengeluaran
          </h1>
          <div className="flex flex-col justify-between gap-4 xl:flex-row">
            <UploadFile childToParent={(e) => setFile(e)} />
          </div>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowUpload(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              text={"Input Data"}
              type={"submit"}
              style={"primary"}
              isLoading={isUpload}
            />
          </div>
        </form>
      </Modal>

      <div className="flex min-h-screen w-full flex-col bg-background px-5 pb-24 pt-[104px] xl:px-24">
        <h1 className="mb-12 hidden text-40 font-bold xl:block">Pengeluaran</h1>
        <div className="mb-5 flex w-full justify-between xl:justify-start">
          <p className="w-auto text-16 font-bold xl:w-[250px] xl:text-24">
            Total Pengeluaran
          </p>
          <p className="text-16 font-semibold text-kText xl:text-24">
            <FormatRupiah value={totalPengeluaran} />
          </p>
        </div>
        <div className="mb-5 flex w-full items-center justify-between xl:justify-start">
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
        <div className="mb-5 flex flex-col justify-between gap-11 xl:flex-row">
          <div className="flex w-full items-center justify-between xl:justify-start gap-4">
            <Button
              onClick={() => setShowUpload(true)}
              text={"Import Pengeluaran"}
              type={"button"}
              style={"third"}
            />
            <Button
              onClick={() => ExportFile(exportData, "Pengeluaran")}
              text={"Export Pengeluaran"}
              type={"button"}
              style={"third"}
            />
          </div>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            {user?.role == "BOD" && (
              <Button
                onClick={() => setShowEditJenis(true)}
                text={"Edit Jenis"}
                type={"button"}
                style={"third"}
              />
            )}
            {user?.role == "BOD" && (
              <Button
                onClick={() => setShowEditKategori(true)}
                text={"Edit Kategori"}
                type={"button"}
                style={"third"}
              />
            )}
            <Button
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
              text={"Tambah Data +"}
              type={"button"}
              style={"primary"}
            />
          </div>
        </div>
        <p className="mb-5 block text-16 font-bold xl:hidden xl:text-24">
          Daftar Pengeluaran
        </p>
        <div className="flex grow flex-col rounded-lg bg-white py-3 shadow-card">
          <div className="mb-5 flex w-full items-center justify-between gap-1 px-3">
            <p className="hidden text-16 font-bold xl:block xl:text-24">
              Daftar Pengeluaran
            </p>
            <div className="flex items-center gap-2">
              <TextField
                type={"search"}
                placeholder={"Cari"}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Filter
                onSelected={(val) => setKategoriId(val)}
                selected={kategoriId}
                data={kategoriData}
              />
            </div>
            <div
              className={`${onSelected.length > 0 ? "visible" : "invisible"}`}
            >
              <Button
                onClick={() => setShowHapusPengeluaran(true)}
                text={"Hapus"}
                type={"button"}
                style={"delete"}
              />
            </div>
          </div>
          <Table
            data={data}
            column={kolom}
            isLoading={isTableLoad}
            page={page}
            dataLimit={10}
            isEdit={user?.role == "BOD"}
            isCheck={user?.role == "BOD"}
            onEdit={(val) => {
              setIdEdit((data[val] as any).id);
              setShowEditPengeluaran(true);
              setKategori(
                kategoriData.filter(
                  (item) => item.label == (data[val] as any).kategori
                )[0]
              );
              setTanggal(
                moment(Date.parse((data[val] as any).tanggal)).toDate()
              );
              setJenis(
                jenisData.filter(
                  (item) => item.label == (data[val] as any).jenis
                )[0]
              );
              setJumlah(formatRpReverse((data[val] as any).jumlah));
              setDeskripsi((data[val] as any).deskripsi);
            }}
            onSelected={(val) => setOnSelected(val)}
            selected={onSelected}
          />
          <Paginate
            totalPages={totalPage}
            current={(page) => setPage(page)}
            totalData={totalData}
            dataLimit={10}
          />
        </div>
      </div>
    </>
  );
}

export default Pengeluaran;
