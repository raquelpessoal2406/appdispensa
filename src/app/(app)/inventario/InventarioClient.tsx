"use client";

import { useMemo, useState } from "react";
import { formatAmount } from "@/lib/amount";
import { getExpiryStatus, isLowStock } from "@/lib/alerts";
import { normalizeName } from "@/lib/ingredientMatch";
import type { Item } from "@/lib/types";
import { createZone } from "./actions";
import { ItemSheet } from "./ItemSheet";

export function InventarioClient({
  initialItems,
  initialZones,
}: {
  initialItems: Item[];
  initialZones: string[];
}) {
  const [activeZone, setActiveZone] = useState<string>("Todos");
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<Item | null | "new">(null);
  const [addingZone, setAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");

  function selectZone(zone: string) {
    setActiveZone(zone);
    setActiveCategory("Todas");
  }

  const itemsInZone = useMemo(
    () => (activeZone === "Todos" ? initialItems : initialItems.filter((i) => i.zone === activeZone)),
    [activeZone, initialItems],
  );

  const categories = useMemo(() => {
    const names = new Set<string>();
    for (const item of itemsInZone) {
      if (item.category) names.add(item.category);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "pt"));
  }, [itemsInZone]);

  const knownCategories = useMemo(() => {
    const names = new Set<string>();
    for (const item of initialItems) {
      if (item.category) names.add(item.category);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "pt"));
  }, [initialItems]);

  const filteredItems = useMemo(() => {
    const query = normalizeName(search);
    return itemsInZone.filter((item) => {
      if (activeCategory !== "Todas" && item.category !== activeCategory) return false;
      if (query && !normalizeName(item.name).includes(query)) return false;
      return true;
    });
  }, [itemsInZone, activeCategory, search]);

  const zoneGroups = useMemo(() => {
    const zonesToShow = activeZone === "Todos" ? initialZones : [activeZone];
    return zonesToShow
      .map((zone) => ({
        zone,
        items: filteredItems
          .filter((i) => i.zone === zone)
          .sort((a, b) => a.name.localeCompare(b.name, "pt")),
      }))
      .filter((g) => g.items.length > 0);
  }, [activeZone, filteredItems, initialZones]);

  async function handleAddZone() {
    const name = newZoneName.trim();
    if (!name) return;
    await createZone(name);
    setNewZoneName("");
    setAddingZone(false);
  }

  return (
    <>
      <h2 className="mb-3.5 mt-0.5 text-lg font-extrabold">Inventário</h2>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Pesquisar ingrediente…"
        className="input mb-3"
      />

      <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          className={`chip ${activeZone === "Todos" ? "active" : ""}`}
          onClick={() => selectZone("Todos")}
        >
          Todos
        </button>
        {initialZones.map((zone) => (
          <button
            key={zone}
            className={`chip ${activeZone === zone ? "active" : ""}`}
            onClick={() => selectZone(zone)}
          >
            {zone}
          </button>
        ))}
        {addingZone ? (
          <span className="flex items-center gap-1.5">
            <input
              autoFocus
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddZone()}
              placeholder="Nome da zona"
              className="input !w-32 !py-1.5"
            />
            <button className="chip chip-add" onClick={handleAddZone}>
              ✓
            </button>
          </span>
        ) : (
          <button className="chip chip-add" onClick={() => setAddingZone(true)}>
            + Zona
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div className="mb-3.5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            className={`chip ${activeCategory === "Todas" ? "active" : ""}`}
            onClick={() => setActiveCategory("Todas")}
          >
            Todas categorias
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {zoneGroups.length === 0 && (
        <div className="empty">
          <div className="big">🗄️</div>
          <p>Não há itens que correspondam à pesquisa/filtro.</p>
        </div>
      )}

      {zoneGroups.map((group) => (
        <div key={group.zone}>
          {activeZone === "Todos" && (
            <p className="mb-2 mt-4.5 text-[13px] font-extrabold text-ink-soft first:mt-0">
              {group.zone}
            </p>
          )}
          {group.items.map((item) => (
            <ItemRow key={item.id} item={item} onClick={() => setEditingItem(item)} />
          ))}
        </div>
      ))}

      <button className="fab" onClick={() => setEditingItem("new")} aria-label="Adicionar item">
        +
      </button>

      <ItemSheet
        open={editingItem !== null}
        onClose={() => setEditingItem(null)}
        zones={initialZones}
        knownCategories={knownCategories}
        item={editingItem === "new" || editingItem === null ? null : editingItem}
      />
    </>
  );
}

function ItemRow({ item, onClick }: { item: Item; onClick: () => void }) {
  const expiryStatus = getExpiryStatus(item);
  const lowStock = isLowStock(item);

  return (
    <button type="button" className="card block w-full text-left" onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 truncate text-[15px] font-bold">{item.name}</div>
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-soft">
            {item.category && <span>{item.category}</span>}
            {item.unit && <span>{item.unit}</span>}
            {expiryStatus === "soon" && <span className="tag tag-soon">A expirar em breve</span>}
            {expiryStatus === "expired" && <span className="tag tag-expired">Validade passada</span>}
            {lowStock && <span className="tag tag-soon">Stock baixo</span>}
          </div>
        </div>
        <span className="amount-pill">{formatAmount(item.amount)}</span>
      </div>
    </button>
  );
}
