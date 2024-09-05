import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox"; // ShadCN Checkbox component
import { ScanArray } from "@/types/types";

interface ScanListProps {
  items: ScanArray[];
  onSelect: (id: number) => void;
}

export function ScanList({ items, onSelect }: ScanListProps) {
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  // State for filters
  const [isDeepScan, setIsDeepScan] = React.useState<boolean>(false);


  const handleSelection = React.useCallback(
    (id: number) => {
      setSelectedId(id);
      onSelect(id);
    },
    [onSelect]
  );

  const isSelected = (id: number) => selectedId === id;

  // Filter items based on the selected filters
  const filteredItems = items.filter((item) => {
    if (isDeepScan && item.severity !== "Deep") return false;
    if (!isDeepScan && item.severity !== "Normal") return false;
    return true;
  });
  

  return (
    <div className="flex flex-col h-[100vh]">
      {/* Filter Section */}
      <div className="p-4">
        <div className="flex gap-4">
        </div>
      </div>

      {/* Scrollable List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4 pt-0">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MemoizedScanItem
                key={item.id}
                item={item}
                isSelected={isSelected(item.id)}
                onClick={handleSelection}
              />
            ))
          ) : (
            <div className="text-center text-muted">No items found</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ScanItemProps {
  item: ScanArray;
  isSelected: boolean;
  onClick: (id: number) => void;
}

const ScanItem: React.FC<ScanItemProps> = ({ item, isSelected, onClick }) => {
  const itemClassName = cn(
    "flex h-[10vh] flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-colors duration-200",
    isSelected ? "bg-accent text-foreground" : "bg-muted text-muted-foreground"
  );

  return (
    <button className={itemClassName} onClick={() => onClick(item.id)}>
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{item.title}</div>
            <div className="text-xs text-muted-foreground">{item.severity}</div>
          </div>
        </div>
      </div>
    </button>
  );
};

const MemoizedScanItem = React.memo(ScanItem);
