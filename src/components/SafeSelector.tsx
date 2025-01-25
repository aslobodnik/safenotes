import { useEffect, useState } from "react";
import { Safe } from "@/types/transfers";

interface SafeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SafeSelector({ value, onChange }: SafeSelectorProps) {
  const [safes, setSafes] = useState<Safe[]>([]);

  useEffect(() => {
    const fetchSafes = async () => {
      const response = await fetch("/api/safes");
      if (response.ok) {
        const data = await response.json();
        setSafes(data);
      }
    };
    fetchSafes();
  }, []);

  return (
    <div className="mb-4">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-2 border rounded-md min-w-[300px] text-black"
      >
        <option value="">Select a Safe</option>
        {safes.map((safe) => (
          <option key={safe.address} value={safe.address}>
            {`${safe.address.slice(0, 6)}...${safe.address.slice(-4)}`}
          </option>
        ))}
      </select>
    </div>
  );
}
