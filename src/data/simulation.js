const ATOMIC_MASS = {
  H: 1.008, He: 4.003, Li: 6.94, Be: 9.012, B: 10.81, C: 12.011, N: 14.007,
  O: 15.999, F: 18.998, Ne: 20.18, Na: 22.99, Mg: 24.305, Al: 26.982,
  Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098,
  Ca: 40.078, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546,
  Au: 196.967,
  Zn: 65.38, Br: 79.904, Ag: 107.868, Sn: 118.71, I: 126.904, Ba: 137.327, Hg: 200.592, Pb: 207.2,
};
const SUBSCRIPTS = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };

function formulaMass(formula) {
  if (!formula) return null;
  const normalized = formula
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻]$/, "")
    .replace(/[₀-₉]/g, (digit) => SUBSCRIPTS[digit]);
  const parseSegment = (segment) => {
    const leading = segment.match(/^(\d+(?:\.\d+)?|½)(?=[A-Z])/)?.[0] ?? "1";
    const multiplier = leading === "½" ? 0.5 : Number(leading);
    let index = leading === "1" ? 0 : leading.length;
    const parseGroup = () => {
      let total = 0;
      while (index < segment.length) {
        if (segment[index] === "(") {
          index += 1;
          const sub = parseGroup();
          const digits = segment.slice(index).match(/^\d+/)?.[0];
          index += digits?.length ?? 0;
          total += sub * Number(digits ?? 1);
        } else if (segment[index] === ")") {
          index += 1;
          return total;
        } else {
          const symbol = segment.slice(index).match(/^[A-Z][a-z]?/)?.[0];
          if (!symbol || ATOMIC_MASS[symbol] === undefined) return null;
          index += symbol.length;
          const digits = segment.slice(index).match(/^\d+/)?.[0];
          index += digits?.length ?? 0;
          total += ATOMIC_MASS[symbol] * Number(digits ?? 1);
        }
      }
      return total;
    };
    const mass = parseGroup();
    return index === segment.length && mass > 0 ? multiplier * mass : null;
  };
  const segments = normalized.split(/[·.]/);
  const masses = segments.map(parseSegment);
  return masses.some((mass) => mass === null) ? null : masses.reduce((sum, mass) => sum + mass, 0);
}

function molecularFormula(chemical) {
  const id = chemical?.id;
  if (["hydrogen", "nitrogen", "oxygen", "fluorine", "chlorine", "bromine", "iodine"].includes(id)
    && !/[2₂]$/.test(chemical.formula ?? "")) {
    return `${chemical.formula}2`;
  }
  return chemical?.formula;
}

export function calculateOutcome(reaction, samples, chemicalsById) {
  const reactants = reaction.reactants ?? [];
  if (!reactants.length || samples.length !== reactants.length) return null;
  const sampleById = new Map(samples.map((sample) => [sample.id, sample]));
  const amounts = reactants.map((entry) => {
    const id = entry.chemicalId.toLowerCase();
    const sample = sampleById.get(id);
    const chemical = chemicalsById[id];
    const mass = formulaMass(molecularFormula(chemical));
    if (!sample || !mass) return null;
    return { id, sample, molarMass: mass, moles: sample.mass / mass, coefficient: entry.coefficient ?? 1 };
  });
  if (amounts.some((amount) => !amount)) return null;
  const extent = Math.min(...amounts.map((amount) => amount.moles / amount.coefficient));
  const products = (reaction.products ?? []).map((entry) => {
    const id = entry.chemicalId.toLowerCase();
    const chemical = chemicalsById[id];
    const molarMass = formulaMass(molecularFormula(chemical));
    if (!molarMass) return { id, chemical, grams: null };
    return { id, chemical, grams: extent * (entry.coefficient ?? 1) * molarMass };
  });
  const remaining = amounts.map((amount) => ({
    id: amount.id,
    chemical: chemicalsById[amount.id],
    grams: Math.max(0, (amount.moles - extent * amount.coefficient) * amount.molarMass),
  })).filter((amount) => amount.grams > 0.005);
  return { extentMoles: extent, products, remaining };
}
