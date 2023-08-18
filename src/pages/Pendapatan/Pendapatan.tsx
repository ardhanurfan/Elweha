import { useEffect, useState } from "react";
import Button from "../../components/Button";
import Dropdown from "../../components/Dropdown";
import TextField from "../../components/TextField";
import Table from "../../components/Table";
import Paginate from "../../components/Paginate";
import Modal from "../../components/Modal";
import DateFieldNormal from "../../components/DateFieldNormal";
import TextArea from "../../components/TextArea";
import LoadingPage from "../../components/LoadingPage";
import { dataMonth } from "../../data/month";
import { getWithAuth, postWithAuth } from "../../api/api";
import { toastError, toastSuccess } from "../../components/Toast";
import moment from "moment";
import { FormatRupiah } from "@arismun/format-rupiah";
import Filter from "../../components/Filter";

function Pendapatan() {
  // Loading
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoad, setIsTableLoad] = useState(false);
  const [isAddKategori, setIsAddKategori] = useState(false);
  const [isAddPendapatan, setIsAddPendapatan] = useState(false);
  const [isEditPendapatan, setIsEditPendapatan] = useState(false);
  const [isHapusPendapatan, setIsHapusPendapatan] = useState(false);

  // PopUp
  const [showTambahKategori, setShowTambahKategori] = useState(false);
  const [showTambahPendapatan, setShowTambahPendapatan] = useState(false);
  const [showEditPendapatan, setShowEditPendapatan] = useState(false);
  const [showHapusPendapatan, setShowHapusPendapatan] = useState(false);

  // Dropdown
  const [kategoriData, setKategoriData] = useState<
    Array<{ value: string; label: string }>
  >([]);

  //Field
  const [period, setPeriod] = useState<{ value: string; label: string }>();
  const [kategori, setKategori] = useState<{ value: string; label: string }>();
  const [addKategori, setAddKategori] = useState("");
  const [tanggal, setTanggal] = useState<Date | null>();
  const [jumlah, setJumlah] = useState("");
  const [pengirim, setPengirim] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [search, setSearch] = useState("");

  // Data
  const [data, setData] = useState([]);
  const [totalPendapatan, setTotalPendapatan] = useState(0);

  // Table
  const kolom = [
    "No",
    "Tanggal",
    "Kategori",
    "Jumlah",
    "Pengirim",
    "Deskripsi",
  ];
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [idEdit, setIdEdit] = useState(-1);
  const [kategoriId, setKategoriId] = useState<Array<number>>([]);
  const [onSelected, setOnSelected] = useState<Array<number>>([]);

  const token = localStorage.getItem("access_token");
  const getData = async () => {
    if (token) {
      try {
        const kategori = await getWithAuth(token, "kategori-pendapatan");
        setKategoriData(
          kategori.data.data.map((data: any) => {
            return { value: data.id, label: data.nama };
          })
        );
        setKategoriId(kategori.data.data.map((data: any) => data.id));
      } catch (error) {
        toastError("Get Some Data Failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getPendapatan = async () => {
    setOnSelected([]);
    setIsTableLoad(true);
    if (token) {
      try {
        var filter = "";
        kategoriId.forEach((id, idx) => {
          filter += `&kategori_id[${idx}]=${id}`;
        });
        const pendapatan = await getWithAuth(
          token,
          `pendapatan?limit=10&page=${page}&month=${
            period ? period?.value.split("-")[0] : ""
          }&year=${
            period ? period?.value.split("-")[1] : ""
          }&search=${search}${filter}`
        );
        setData(
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
        setTotalPendapatan(pendapatan.data.data.total_pendapatan);
        setTotalPage(pendapatan.data.data.table.last_page);
        setTotalData(pendapatan.data.data.table.total);
      } catch (error) {
        toastError("Get Data Table Failed");
      } finally {
        setIsTableLoad(false);
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getPendapatan();
  }, [page, totalData, period, search, kategoriId]);

  const tambahKategori = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddKategori(true);
    try {
      const response = await postWithAuth(
        "kategori-pendapatan",
        {
          nama: addKategori,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowTambahKategori(false);
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
    } finally {
      setIsAddKategori(false);
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
          kategori_pendapatan_id: kategori?.value,
          jumlah: jumlah,
          pengirim: pengirim,
          deskripsi: deskripsi,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowTambahPendapatan(false);
      setTotalData(totalData + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsAddPendapatan(false);
    }
  };

  const editPendapatan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditPendapatan(true);
    try {
      const response = await postWithAuth(
        "update-pendapatan",
        {
          id: idEdit,
          tanggal: moment(tanggal).format("YYYY-MM-DD HH:mm:ss"),
          kategori_pendapatan_id: kategori?.value,
          jumlah: jumlah,
          pengirim: pengirim,
          deskripsi: deskripsi,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowEditPendapatan(false);
      setTotalData(totalData + 1);
    } catch (error) {
      toastError((error as any).response.data.data.error as string);
    } finally {
      setIsEditPendapatan(false);
    }
  };

  const hapusPendapatan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsHapusPendapatan(true);
    try {
      const response = await postWithAuth(
        "delete-pendapatan",
        {
          selectedId: onSelected,
        },
        token ?? ""
      );
      toastSuccess(response.data.meta.message);
      setShowHapusPendapatan(false);
      setTotalData(totalData + 1);
    } catch (error) {
      toastError((error as any).response.data.meta.message as string);
    } finally {
      setIsHapusPendapatan(false);
    }
  };

  return (
    <>
      <LoadingPage isLoad={isLoading} />

      {/* Add Kategori */}
      <Modal
        visible={showTambahKategori}
        onClose={() => setShowTambahKategori(false)}
      >
        <form
          onSubmit={(e) => tambahKategori(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Tambah Kategori Pendapatan
          </h1>
          <div className="mb-5 w-full">
            <p className="mb-2 text-16 font-semibold">Nama Kategori</p>
            <TextField
              required
              type={"standart"}
              placeholder={"Masukkan Nama Kategori"}
              onChange={(e) => setAddKategori(e.target.value)}
            />
          </div>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowTambahKategori(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              isLoading={isAddKategori}
              text={"Simpan Data"}
              type={"submit"}
              style={"primary"}
            />
          </div>
        </form>
      </Modal>

      {/* Add Pendapatan */}
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
              <p className="mb-2 text-16 font-semibold">Jumlah Pendapatan</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Rp"}
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

      {/* Edit Pendapatan */}
      <Modal
        visible={showEditPendapatan}
        onClose={() => setShowEditPendapatan(false)}
      >
        <form
          onSubmit={(e) => editPendapatan(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Edit Pendapatan
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
              <p className="mb-2 text-16 font-semibold">Jumlah Pendapatan</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Rp"}
                onChange={(e) => setJumlah(e.target.value)}
                value={jumlah}
              />
            </div>
            <div className="w-full xl:w-1/2">
              <p className="mb-2 text-16 font-semibold">Pengirim</p>
              <TextField
                required
                type={"standart"}
                placeholder={"Masukkan Nama Pengirim"}
                onChange={(e) => setPengirim(e.target.value)}
                value={pengirim}
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
              onClick={() => setShowEditPendapatan(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              text={"Edit Data"}
              type={"submit"}
              style={"primary"}
              isLoading={isEditPendapatan}
            />
          </div>
        </form>
      </Modal>

      {/* Hapus Pendapatan */}
      <Modal
        visible={showHapusPendapatan}
        onClose={() => setShowHapusPendapatan(false)}
      >
        <form
          onSubmit={(e) => hapusPendapatan(e)}
          className="flex w-full flex-col gap-4"
        >
          <h1 className="text-center text-24 font-bold xl:text-start xl:text-40">
            Hapus Pendapatan
          </h1>
          <p className="mb-5 w-full text-center text-12 xl:text-left xl:text-16">
            Apakah Anda yakin menghapus data?
          </p>
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowHapusPendapatan(false)}
              text={"Batalkan"}
              type={"button"}
              style={"third"}
            />
            <Button
              isLoading={isHapusPendapatan}
              text={"Hapus Data"}
              type={"submit"}
              style={"primary"}
            />
          </div>
        </form>
      </Modal>

      <div className="flex min-h-screen w-full flex-col bg-background px-5 pb-24 pt-[104px] xl:px-24">
        <h1 className="mb-12 hidden text-40 font-bold xl:block">Pendapatan</h1>
        <div className="mb-5 flex w-full justify-between xl:justify-start">
          <p className="w-auto text-16 font-bold xl:w-[250px] xl:text-24">
            Total Pendapatan
          </p>
          <p className="text-16 font-semibold text-kText xl:text-24">
            <FormatRupiah value={totalPendapatan} />
          </p>
        </div>
        <div className="mb-5 flex flex-col justify-between gap-11 xl:flex-row">
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
          <div className="flex w-full justify-center gap-4 xl:justify-end">
            <Button
              onClick={() => setShowTambahPendapatan(true)}
              text={"Tambah Data +"}
              type={"button"}
              style={"primary"}
            />
            <Button
              onClick={() => setShowTambahKategori(true)}
              text={"Tambah Kategori +"}
              type={"button"}
              style={"third"}
            />
          </div>
        </div>
        <p className="mb-5 block text-16 font-bold xl:hidden xl:text-24">
          Daftar Pendapatan
        </p>
        <div className="flex grow flex-col rounded-lg bg-white py-3 shadow-card">
          <div className="mb-5 flex w-full items-center justify-between gap-1 px-3">
            <p className="hidden text-16 font-bold xl:block xl:text-24">
              Daftar Pendapatan
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
                onClick={() => setShowHapusPendapatan(true)}
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
            onEdit={(val) => {
              setIdEdit((data[val] as any).id);
              setShowEditPendapatan(true);
              setKategori(
                kategoriData.filter(
                  (item) => item.label == (data[val] as any).kategori
                )[0]
              );
              setTanggal(
                moment(Date.parse((data[val] as any).tanggal)).toDate()
              );
              setPengirim((data[val] as any).pengirim);
              setJumlah((data[val] as any).jumlah);
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

export default Pendapatan;
