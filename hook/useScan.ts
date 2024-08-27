import { useState, useCallback, useMemo } from "react";

export function useScan<T>(initialSelectedId: T | null = null) {
  const [selectedId, setSelectedId] = useState<T | null>(initialSelectedId);

  const handleSelection = useCallback((id: T) => {
    setSelectedId(id);
  }, []);

  const isSelected = useCallback(
    (id: T) => selectedId === id,
    [selectedId]
  );

  return {
    selectedId,
    handleSelection,
    isSelected,
  };
}