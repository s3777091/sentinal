import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScanArray } from "@/types/types";

interface ScanListProps {
  items: ScanArray[];
  onSelect: (id: number) => void;
}

export function ScanList({ items, onSelect }: ScanListProps) {
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  const handleSelection = React.useCallback(
    (id: number) => {
      setSelectedId(id);
      onSelect(id);
    },
    [onSelect] // only re-create when `onSelect` changes
  );

  const isSelected = (id: number) => selectedId === id;

  return (
    <ScrollArea className="h-[100vh]">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <MemoizedScanItem
            key={item.id}
            item={item}
            isSelected={isSelected(item.id)}
            onClick={handleSelection}
          />
        ))}
      </div>
    </ScrollArea>
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
          </div>
        </div>
      </div>
    </button>
  );
};

const MemoizedScanItem = React.memo(ScanItem);