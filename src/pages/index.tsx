import { useState, useEffect } from "react";
import { TransferResponse, Transfer, PaginationInfo } from "@/types/transfers";
import SafeSelector from "@/components/SafeSelector";
import TransactionTable from "@/components/TransactionTable";

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
  }, [currentPage]);

  const filteredTransfers = selectedSafe
    ? transfers.filter(
        (transfer) =>
          transfer.from.toLowerCase() === selectedSafe.toLowerCase() ||
          transfer.to.toLowerCase() === selectedSafe.toLowerCase()
      )
    : transfers;

  return (
    <main className="container mx-auto p-4">
      <SafeSelector value={selectedSafe} onChange={setSelectedSafe} />
      <TransactionTable
        transfers={filteredTransfers}
        safeAddress={selectedSafe}
        pagination={pagination}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}
