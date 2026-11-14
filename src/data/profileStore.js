const PROFILE_KEY = "chemistry-world-profiles-v2";
const LEGACY_PROFILE_KEY = "chemistry-world-profiles-v1";

function readProfiles() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function profileKey({ uid, name, classLevel, studyTrack }) {
  if (uid) return `google:${uid}`;
  const selector = studyTrack === "ncert" ? Number(classLevel) : studyTrack;
  return `${String(name ?? "").trim().toLocaleLowerCase()}|${selector}|${studyTrack ?? "ncert"}`;
}

function findLegacyProgress(details) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LEGACY_PROFILE_KEY) ?? "{}");
    const normalizedName = String(details.name ?? "").trim().toLocaleLowerCase();
    return Object.values(parsed ?? {}).find((profile) => String(profile?.name ?? "").trim().toLocaleLowerCase() === normalizedName
      && Number(profile?.classLevel) === Number(details.classLevel)) ?? null;
  } catch {
    return null;
  }
}

function findPreviousProgress(details) {
  const normalizedName = String(details.name ?? "").trim().toLocaleLowerCase();
  return Object.values(readProfiles()).find((profile) => String(profile?.name ?? "").trim().toLocaleLowerCase() === normalizedName
    && profile?.studyTrack === details.studyTrack
    && (details.studyTrack !== "ncert" || Number(profile?.classLevel) === Number(details.classLevel))) ?? null;
}

function storeProfile(key, profile) {
  try {
    const profiles = readProfiles();
    profiles[key] = profile;
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.warn("Could not save this profile in browser storage:", error);
  }
}

export function createProfile(details) {
  if (typeof window === "undefined") return details;
  const key = profileKey(details);
  const existing = details.existingProgress ?? readProfiles()[key] ?? findPreviousProgress(details) ?? findLegacyProgress(details);
  const profile = {
    profileKey: key,
    ...(details.uid ? { uid: details.uid, email: details.email ?? "" } : {}),
    name: String(details.name ?? "").trim(),
    classLevel: details.classLevel == null ? null : Number(details.classLevel),
    studyTrack: details.studyTrack ?? "ncert",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    reactionHistory: Array.isArray(existing?.reactionHistory) ? existing.reactionHistory : [],
    quizHistory: Array.isArray(existing?.quizHistory) ? existing.quizHistory : [],
    inventory: Array.isArray(existing?.inventory) ? existing.inventory : [],
    benchSelection: Array.isArray(existing?.benchSelection) ? existing.benchSelection : [],
    activeChemicalId: existing?.activeChemicalId ?? null,
    sampleMass: existing?.sampleMass ?? 5,
    hasPreviousProgress: Boolean(existing && (existing.reactionHistory?.length || existing.quizHistory?.length || existing.inventory?.length)),
  };
  storeProfile(key, profile);
  return profile;
}

export function saveProfile(profile) {
  if (!profile?.profileKey || typeof window === "undefined") return profile;
  const savedProfile = { ...profile };
  delete savedProfile.hasPreviousProgress;
  storeProfile(profile.profileKey, savedProfile);
  return profile;
}
