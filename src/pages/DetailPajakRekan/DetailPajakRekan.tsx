import { useContext, useEffect, useState } from "react";
import Dropdown from "../../components/Dropdown";
import Table from "../../components/Table";
import { dataYear } from "../../data/year";
import { getWithAuth } from "../../api/api";
import { toastError } from "../../components/Toast";
import { convertMonth } from "../../data/convertMonth";
import { useNavigate, useParams } from "react-router-dom";
import { formatRp } from "../../data/formatRp";
import { UserContext } from "../../Context/UserContext";
import Button from "../../components/Button";
import { PajakPeriodContext } from "../../Context/PajakPeriodContext";

function DetailPajakRekan() {
  const { id } = useParams();

  const [isTableLoad, setIsTableLoad] = useState(false);

  //Field
  const pajakPeriodContext = useContext(PajakPeriodContext);
  const [year, setYear] = useState<{ value: string; label: string }>(
    pajakPeriodContext
      ? pajakPeriodContext.period
      : dataYear(new Date(), new Date())[0]
  );

  // Data
  const [data, setData] = useState([]);
  const [nama, setNama] = useState("");

  // Table
  const kolom = [
    "Bulan",
    "Jumlah Akta",
    "Jasa Bruto",
    "DPP",
    "DPP Akumulasi",
    "Pajak Akumulasi",
    "PPH Dipotong",
    "Transfer",
  ];

  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const token = user?.token;

  const getData = async () => {
    setIsTableLoad(true);
    if (token) {
      try {
        const pajak_rekan = await getWithAuth(
          token,
          `pajak-rekan-by-id?limit=12&rekan_id=${id}&year=${
            year ? year.value : ""
          }`
        );
        console.log(pajak_rekan.data.data.table.data);
        setData(
          pajak_rekan.data.data.table.data.map((data: any) => {
            return {
              id: data.rekan_id,
              bulan: convertMonth(data.bulan),
              jumlah_akta: data.jumlah_akta,
              jasa_bruto: formatRp(data.jasa_bruto),
              dpp: formatRp(data.dpp),
              dpp_akumulasi: formatRp(data.dpp_akumulasi),
              pajak_akumulasi: formatRp(data.pph_akumulasi),
              pph_potong: formatRp(data.pph),
              transfer: formatRp(data.transfer),
            };
          })
        );
        const rekan = await getWithAuth(token, `rekan?id=${id}`);
        setNama(rekan.data.data[0].nama);
      } catch (error) {
        toastError("Get Data Table Failed");
      } finally {
        setIsTableLoad(false);
      }
    }
  };

  useEffect(() => {
    getData();
  }, [year]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background px-5 pb-9 pt-[104px] xl:px-24">
      <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-40 font-bold xl:block">
          Detail Pajak Rekan {nama}
        </h1>
        <Button
          text={"Kembali"}
          type={"button"}
          style={"third"}
          onClick={() => navigate("/pajak-rekan")}
        />
      </div>
      <div className="mb-5 flex w-full items-center justify-between xl:justify-start">
        <p className="w-auto text-16 font-bold xl:w-[250px] xl:text-24 ">
          Periode
        </p>
        <div className="w-[160px] md:w-[200px]">
          <Dropdown
            isClearable={false}
            placeholder={"Select Period"}
            type={"year"}
            value={year}
            options={dataYear(new Date("01/01/2000"), new Date())}
            onChange={(e) => {
              setYear(e!);
              pajakPeriodContext?.updatePeriod(e!);
            }}
          />
        </div>
      </div>
      <p className="mb-5 block text-16 font-bold xl:hidden xl:text-24">
        Daftar Pajak Rekan
      </p>
      <div className="flex grow flex-col rounded-lg bg-white py-5 shadow-card">
        <div className="mb-5 flex w-full items-center justify-between gap-1 px-3">
          <p className="hidden text-16 font-bold xl:block xl:text-24">
            Daftar Pajak Rekan
          </p>
        </div>
        <Table
          data={data}
          column={kolom}
          isLoading={isTableLoad}
          page={1}
          dataLimit={12}
          isCheck={false}
          isNum={false}
          isEdit={false}
          isWithSum
        />
      </div>
    </div>
  );
}

export default DetailPajakRekan;
