import { useState, useEffect } from "react";
import { TransferResponse, Transfer, PaginationInfo } from "@/types/transfers";
import SafeSelector from "@/components/SafeSelector";
import TransactionTable from "@/components/TransactionTable";
import { Layout } from "@/components/Layout";
import { trpc } from "@/utils/trpc";
import { SafeItem } from '@/db/schema';

export default function Home() {
  const { data, isLoading, error } = trpc.hello.useQuery({ text: "client" });
  const { data: safes, isLoading: safesLoading, error: safesError } = trpc.getSafes.useQuery();

  const [selectedSafe, setSelectedSafe] = useState("");
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const response = await fetch(`/api/transfers?page=${currentPage}`);
        if (response.ok) {
          const data: TransferResponse = await response.json();
          setTransfers(data.results);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch transfers:", error);
      }
    };

    fetchTransfers();
  }, [currentPage, selectedSafe]);

  const filteredTransfers = selectedSafe
    ? transfers.filter(
      (transfer) => transfer.safe.toLowerCase() === selectedSafe.toLowerCase()
    )
    : transfers;

  console.log(filteredTransfers.length);

  return (
    <Layout>
      <h1>Hello</h1>
      {data && <p>{data.greeting}</p>}
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {safes && <p>{safes.length}</p>}
      {safes && safes.map((safe: SafeItem) => <p key={safe.address}>{safe.address}</p>)}
      {safesLoading && <p>Loading...</p>}
      {safesError && <p>Error: {safesError.message}</p>}
      <div className="space-y-4">
        <SafeSelector value={selectedSafe} onChange={setSelectedSafe} />
        <TransactionTable
          transfers={filteredTransfers}
          safeAddress={selectedSafe}
          pagination={pagination}
          onPageChange={setCurrentPage}
        />
      </div>
    </Layout>
  );
}
