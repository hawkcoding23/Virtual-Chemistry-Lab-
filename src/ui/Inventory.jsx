import { useLanguage } from "../i18n";

function returnFocusToLab() {
  document.querySelector("canvas")?.focus({ preventScroll: true });
}

export default function Inventory({ chemicals, activeId, onSelect, onRemove, onClear, tableOpen }) {
  const { t } = useLanguage();
  return <aside className={`inventory ${tableOpen ? "table-open" : ""}`} aria-live="polite">
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
    <p className="inventory-hint">{t("Remove unwanted samples with ×.")}</p>
  </aside>;
}
