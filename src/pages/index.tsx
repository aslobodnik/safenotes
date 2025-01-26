import { useState, useEffect } from "react";
import { TransferResponse, Transfer, PaginationInfo } from "@/types/transfers";
import SafeSelector from "@/components/SafeSelector";
import TransactionTable from "@/components/TransactionTable";
import { Layout } from "@/components/Layout";

export default function Home() {
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
