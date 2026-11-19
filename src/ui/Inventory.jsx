import { useLanguage } from "../i18n";

function returnFocusToLab() {
  document.querySelector("canvas")?.focus({ preventScroll: true });
}

export default function Inventory({ chemicals, activeId, onSelect, onRemove, onClear, tableOpen }) {
  const { t } = useLanguage();
  return <aside className={`inventory ${chemicals.length ? "has-items" : "empty-inventory"} ${tableOpen ? "table-open" : ""}`} aria-live="polite">
    <div className="inventory-heading"><div><span>{t("INVENTORY")}</span><small>{chemicals.length}{t(" collected · select at reaction table")}</small></div>
      {chemicals.length > 0 && <button type="button" className="clear-button" onClick={() => {
        onClear();
        requestAnimationFrame(returnFocusToLab);
      }}>{t("Clear")}</button>}
    </div>
    {chemicals.length === 0 ? <p className="inventory-empty">{t("Click a labelled bottle to collect it.")}</p> : <div className="inventory-list">
      {chemicals.map((chemical, index) => <div key={chemical.id} className={`inventory-item ${activeId === chemical.id ? "active" : ""}`}>
        <button type="button" className="inventory-select" onClick={() => {
          onSelect(chemical.id);
          requestAnimationFrame(returnFocusToLab);
        }}>
          <i style={{ backgroundColor: chemical.color }} /><span><strong>{index + 1}. {chemical.name}</strong><small>{chemical.formula} · {chemical.mass} g</small></span>
        </button>
        <button type="button" className="remove" aria-label={`${t("Remove ")}${chemical.name}`} onClick={() => {
          onRemove(chemical.id);
          requestAnimationFrame(returnFocusToLab);
        }}>×</button>
      </div>)}
    </div>}
    <div className="inventory-mobile-symbols" aria-label={t("Collected chemicals")}>{chemicals.map((chemical) => <span className="inventory-mobile-item" key={chemical.id}>
      <button type="button" className={`inventory-mobile-select ${activeId === chemical.id ? "active" : ""}`}
        title={`${chemical.name} · ${chemical.mass} g`} aria-label={`${chemical.name}, ${chemical.formula}`}
        onClick={() => onSelect(chemical.id)}>{chemical.symbol || chemical.formula || chemical.name.slice(0, 2)}</button>
      <button type="button" className="inventory-mobile-remove" aria-label={`${t("Remove ")}${chemical.name}`}
        title={`${t("Remove ")}${chemical.name}`} onClick={(event) => {
          event.stopPropagation();
          onRemove(chemical.id);
          requestAnimationFrame(returnFocusToLab);
        }}>×</button>
    </span>)}</div>
    <p className="inventory-hint">{t("Remove unwanted samples with ×.")}</p>
  </aside>;
}
