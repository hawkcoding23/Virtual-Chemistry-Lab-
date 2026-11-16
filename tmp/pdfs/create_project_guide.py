from pathlib import Path
import os
import textwrap

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak,
    Table, TableStyle, LongTable, Preformatted, KeepTogether, HRFlowable,
)

ROOT = Path(r"C:\Users\Ansh Dhiman\Downloads\Chemistry-World")
OUT = ROOT / "output" / "pdf" / "Chemistry_World_Project_Technical_Guide.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

INK = colors.HexColor("#20332f")
TEAL = colors.HexColor("#147d6b")
MUTED = colors.HexColor("#586a66")
PALE = colors.HexColor("#edf4ef")
LINE = colors.HexColor("#cbd8d1")
CODE_BG = colors.HexColor("#f2f4f3")
GOLD = colors.HexColor("#9a6332")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle2", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=27, leading=33, textColor=INK, alignment=TA_LEFT, spaceAfter=10))
styles.add(ParagraphStyle(name="CoverSub2", parent=styles["Normal"], fontName="Helvetica", fontSize=13, leading=19, textColor=MUTED, spaceAfter=8))
styles.add(ParagraphStyle(name="H1x", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=18, leading=23, textColor=INK, spaceBefore=10, spaceAfter=9, keepWithNext=True))
styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=TEAL, spaceBefore=9, spaceAfter=5, keepWithNext=True))
styles.add(ParagraphStyle(name="H3x", parent=styles["Heading3"], fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=GOLD, spaceBefore=7, spaceAfter=4, keepWithNext=True))
styles.add(ParagraphStyle(name="Bodyx", parent=styles["BodyText"], fontName="Helvetica", fontSize=9, leading=13.1, textColor=INK, spaceAfter=6))
styles.add(ParagraphStyle(name="Smallx", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.4, leading=10, textColor=MUTED, spaceAfter=3))
styles.add(ParagraphStyle(name="Bulletx", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.7, leading=12.4, textColor=INK, leftIndent=13, firstLineIndent=-8, bulletIndent=1, spaceAfter=3))
styles.add(ParagraphStyle(name="Cellx", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.2, leading=9.4, textColor=INK, spaceAfter=0, wordWrap="CJK"))
styles.add(ParagraphStyle(name="CellHeadx", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=7.4, leading=9.3, textColor=colors.white, spaceAfter=0))
styles.add(ParagraphStyle(name="Codex", parent=styles["Code"], fontName="Courier", fontSize=7.3, leading=9.4, leftIndent=0, rightIndent=0, textColor=INK, backColor=CODE_BG, borderColor=LINE, borderWidth=.5, borderPadding=7, spaceBefore=3, spaceAfter=8))
styles.add(ParagraphStyle(name="Calloutx", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.4, leading=12, textColor=INK, backColor=PALE, borderColor=LINE, borderWidth=.6, borderPadding=8, spaceBefore=5, spaceAfter=8))


class GuideDoc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=A4, rightMargin=17*mm, leftMargin=17*mm, topMargin=18*mm, bottomMargin=17*mm, title="Chemistry World - Technical Project Guide", author="Chemistry World")
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="normal", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=self.decorate)])

    def decorate(self, canvas, doc):
        canvas.saveState()
        w, h = A4
        if doc.page > 1:
            canvas.setStrokeColor(LINE)
            canvas.setLineWidth(.5)
            canvas.line(17*mm, h-12*mm, w-17*mm, h-12*mm)
            canvas.setFont("Helvetica", 7)
            canvas.setFillColor(MUTED)
            canvas.drawString(17*mm, h-9.5*mm, "CHEMISTRY WORLD  |  PROJECT TECHNICAL GUIDE")
            canvas.line(17*mm, 12*mm, w-17*mm, 12*mm)
            canvas.drawString(17*mm, 8*mm, "Source-grounded explanation of this repository")
            canvas.drawRightString(w-17*mm, 8*mm, f"Page {doc.page}")
        canvas.restoreState()


story = []

def P(text, style="Bodyx"):
    story.append(Paragraph(text, styles[style]))

def H1(text): P(text, "H1x")
def H2(text): P(text, "H2x")
def H3(text): P(text, "H3x")

def bullet(text):
    story.append(Paragraph("- " + text, styles["Bulletx"]))

def code(text):
    lines = []
    for line in text.strip("\n").splitlines():
        lines.extend(textwrap.wrap(line, width=92, subsequent_indent="    ", replace_whitespace=False, drop_whitespace=False) or [""])
    story.append(Preformatted("\n".join(lines), styles["Codex"], maxLineLength=92))

def table(headers, rows, widths, repeatRows=1):
    data = [[Paragraph(str(x), styles["CellHeadx"]) for x in headers]]
    for row in rows:
        data.append([Paragraph(str(cell).replace("&", "&amp;"), styles["Cellx"]) for cell in row])
    t = LongTable(data, colWidths=widths, repeatRows=repeatRows, hAlign="LEFT", splitByRow=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), TEAL),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("GRID", (0,0), (-1,-1), .35, LINE),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f7f9f7")]),
        ("LEFTPADDING", (0,0), (-1,-1), 5), ("RIGHTPADDING", (0,0), (-1,-1), 5),
        ("TOPPADDING", (0,0), (-1,-1), 4), ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 6))

def section(title, intro=None):
    story.append(PageBreak())
    H1(title)
    story.append(HRFlowable(width="100%", thickness=.7, color=LINE, spaceAfter=8))
    if intro: P(intro)


# Cover page - intentionally text only.
story.append(Spacer(1, 30*mm))
P("CHEMISTRY WORLD", "H2x")
P("Project Technical Guide", "CoverTitle2")
P("A source-based explanation of the app, codebase, data, authentication, calculations, build, and deployment.", "CoverSub2")
story.append(Spacer(1, 7*mm))
story.append(HRFlowable(width="100%", thickness=2, color=TEAL, spaceAfter=10))
P("Prepared for a project demonstration, college-level review, or technical viva.", "Bodyx")
P("Repository examined: Chemistry-World. Documentation reflects the files present in the project folder on 16 November 2026. No code screenshots, diagrams, or decorative illustrations are used in this guide.", "Bodyx")
story.append(Spacer(1, 8*mm))
P("A reliable one-sentence summary", "H2x")
P("Chemistry World is a React web application that renders an interactive chemistry laboratory in the browser with Three.js through React Three Fiber. Its reaction and lesson data are bundled locally; Firebase Authentication and Cloud Firestore are optional cloud services for student sign-in and private notebook sync. A separate Express API prototype is included, but it is not the API used to render the Cloudflare-hosted lab.", "Calloutx")
story.append(Spacer(1, 8*mm))
P("How to use this guide", "H2x")
P("Read Sections 1-5 for the architecture and how to explain the app. Sections 6-12 follow the data, interaction, reaction, account, and build flows. Section 13 is a file-by-file directory guide. Sections 14-16 cover deployment, limits, and likely reviewer questions. The final section gives a short presentation script.", "Bodyx")
story.append(PageBreak())

H1("Contents")
for item in [
    "1. Project at a glance", "2. Languages and core concepts", "3. Software and services", "4. Architecture and how the parts connect",
    "5. What happens when a student uses the app", "6. 3D lab controls and interaction", "7. Reaction matching, chemistry math, and visual simulation",
    "8. Firebase sign-in and private notebook storage", "9. Quiz and chapter-note systems", "10. Audio, accessibility, and bilingual support",
    "11. Build and run commands", "12. Deployment pipeline and environment values", "13. File-by-file project directory guide",
    "14. Data file guide", "15. Security, scientific scope, and known limits", "16. Common technical review questions and answers",
    "17. Short project explanation for the presentation", "18. Glossary",
]: bullet(item)
P("Project facts and cautions", "H2x")
P("The active frontend supports Classes 9-12 and contains local chemistry, quiz, and study-note content. Some older README text describes only Classes 9-10 and says there is no Firebase or backend; that README does not describe every feature in the current source. The optional Express API is separate from Cloudflare's static browser build. This distinction is called out throughout the guide so an examiner is not given an inaccurate deployment claim.", "Calloutx")

section("1. Project at a glance", "The repository contains a browser application, bundled chemistry and learning data, an optional Node/Express API, Firebase setup instructions, a Firestore rules file, and static public assets.")
table(["Topic", "What this project does"], [
    ("Product", "A walk-through virtual chemistry lab and learning site for school-level chemistry."),
    ("Frontend", "React 19 application written primarily in JavaScript and JSX; Vite builds and serves it."),
    ("3D rendering", "Three.js scene managed through @react-three/fiber; @react-three/drei supplies helper components such as pointer-lock controls."),
    ("Learning features", "Chemical shelves, inventory, reaction workbench, reaction visualizations, result details, notes, quizzes, Hindi/English UI, and student progress."),
    ("Data", "JSON and JavaScript data modules bundled into the frontend build. Chemistry demonstrations are simulations, not a live chemical laboratory."),
    ("Accounts", "Firebase Authentication supports Google sign-in. Cloud Firestore stores each signed-in user's private profile and learning notebook."),
    ("Guest use", "A guest can enter without Google. Guest profile progress is stored in browser localStorage on that browser/device."),
    ("Hosting", "The project is intended for a Cloudflare Workers & Pages Git-connected static build. The actual Cloudflare dashboard controls build settings."),
    ("Optional service", "backend/ is a CommonJS Express prototype listening on port 5000. It is not automatically deployed by the frontend build."),
], [35*mm, 143*mm])
H2("Important project distinction")
P("There are two possible ways to fetch quiz questions: the browser first attempts the local address http://localhost:5000/api/quizzes/random, then falls back to question data already bundled in the frontend. On a public site, localhost means the visitor's own device, not the Cloudflare server. Therefore the local Express quiz service is normally unavailable to public users; the bundled fallback is what keeps quizzes usable. The app's main chemistry catalogue and reaction calculations are also local frontend logic, not calls to the Express reaction API.", "Calloutx")

section("2. Languages and core concepts")
table(["Language / format", "Where it appears", "Role in plain terms"], [
    ("JavaScript (ES modules)", "Most src/*.js and src/*.jsx", "Application behavior, state, data shaping, calculations, event handling, and component definitions."),
    ("JSX", "React components such as App.jsx, LabScene.jsx, and UI files", "A JavaScript syntax for describing the interface and 3D scene as nested elements."),
    ("CSS", "src/App.css and src/index.css", "Layout, color, responsive behavior, overlays, buttons, animation, and phone/touch styling."),
    ("JSON", "backend/data/** and src/data/*.json", "Structured chemistry, quizzes, and lookup content. JSON is data, not executable logic."),
    ("HTML", "index.html", "The browser document shell, metadata, favicon, title, viewport settings, and root element."),
    ("CommonJS JavaScript", "backend/**/*.js", "The optional Node/Express server uses require/module.exports instead of browser ES module syntax."),
    ("Firestore Rules language", "firestore.rules", "Server-enforced access rules for Firestore documents."),
    ("PowerShell / npm scripts", "Developer terminal commands", "Commands used to install, serve, build, and preview the project on Windows."),
], [38*mm, 53*mm, 87*mm])
H2("Concepts worth explaining to a reviewer")
for item in [
    "A component is a reusable UI or scene unit. For example, Bottle.jsx draws and interacts with a bottle; LabScene.jsx assembles many components into a room.",
    "Props are values passed from a parent component to a child. App passes the inventory, selected class, quiz callbacks, and movement reference down to the lab.",
    "State is changing UI data held by React, such as inventory, profile, current quiz, reaction result, and open dialogs.",
    "A ref stores a mutable value without forcing a React render. The mobile movement reference is read every 3D frame, so buttons can signal movement smoothly.",
    "A hook packages reusable React behavior. useReactionSimulation owns reaction time/progress and playback controls.",
    "A build bundles source files and assets into browser files. Vite resolves imports, applies environment values, and emits the dist directory.",
    "An API is a network interface. Firebase SDK calls are network requests to Firebase; the optional Express routes are a separate HTTP API.",
    "A database rule is checked by the database service. Hiding a button in React is not a security boundary; firestore.rules is the boundary for Firestore reads/writes.",
]: bullet(item)

section("3. Software and services")
table(["Tool / service", "Use in this project", "What is confirmed"], [
    ("Node.js", "Runs JavaScript build tools and can run the optional Express service.", "Required by the package scripts and backend."),
    ("npm", "Installs dependencies and runs the project scripts.", "package.json defines dev, build, preview, test, lint, and backend scripts."),
    ("Vite", "Local development server and production bundler.", "vite.config.js adds the React plugin; build output is dist/."),
    ("React / React DOM", "Component system and browser rendering.", "Declared in package.json."),
    ("Three.js", "WebGL-based 3D scene graph and camera/math primitives.", "Declared dependency; used directly in Player and simulation scenes."),
    ("React Three Fiber / Drei", "React renderer for Three.js and scene helpers.", "Declared dependencies; Canvas is the primary 3D viewport."),
    ("Firebase Authentication", "Google sign-in and persistent browser session.", "Configured in src/data/firebaseClient.js, when VITE config values exist."),
    ("Cloud Firestore", "Private user profile and notebook synchronization.", "Used by firebaseClient.js under users/{uid}/private/profile."),
    ("Cloudflare Workers & Pages", "Public hosting and Git-connected deployment pipeline.", "Cloudflare configuration is managed in its dashboard; no wrangler.toml is present in this source folder."),
    ("GitHub / GitHub Desktop", "Remote source repository, commits, and pushing updates.", "This was part of the user's deployment workflow; this particular workspace folder has no .git metadata."),
    ("Express and CORS", "Optional local HTTP endpoints in backend/.", "Declared in backend/package.json; server defaults to localhost:5000."),
    ("Browser Web APIs", "Local storage, Web Audio, speech synthesis, pointer/touch events, canvas export, and WebGL.", "Used directly by the frontend; support varies by browser/device."),
    ("Chrome / Edge", "Browser testing and use.", "The project interaction workflow included Edge screenshots and Android Chrome screenshots; the code itself is browser-based."),
], [38*mm, 74*mm, 66*mm])
P("An editor such as VS Code may be used to edit the source, but the repository does not encode which editor was used. The PDF therefore treats editors as optional rather than claiming a specific editor is required.", "Smallx")

section("4. Architecture and how the parts connect")
H2("Startup path")
code("index.html -> src/main.jsx -> LanguageProvider -> src/App.jsx -> WelcomeScreen\n\nAfter entry:\nApp -> React Three Fiber Canvas -> LabScene -> room, cabinets, lab fixtures, Player\nApp also renders HUD, inventory, controls, reaction table, notes, quizzes, profile, and dialogs")
P("index.html contains the root element with id=root and loads src/main.jsx as a module. main.jsx imports global styles, creates a React root, wraps App with StrictMode and LanguageProvider, and renders it. App.jsx is the traffic controller: it owns the user's profile, selected chemicals, scene readiness, reaction state, quiz state, and open panels.")
H2("Data and rendering path")
code("JSON/JS chemistry data -> ncertChemicals.js -> App class filtering -> shelves + reaction table\nSelected sample IDs -> reaction match -> calculateOutcome() -> reactionResult\nreactionResult -> useReactionSimulation() -> progress 0..1\nprogress + reaction -> ExperimentRenderer (3D) + ExperimentOverlay (text/results)")
P("The frontend imports the chemistry content at build time. It does not need a hosted database to list reactions. Data attributes such as ids, formulas, coefficients, class tags, observations, conditions, and gameEffect fields connect a reaction record to the chemical library and its visual setup.")
H2("Account path")
code("ProfileAccess -> Firebase Authentication (Google) -> verified Firebase user UID\nUID -> Firestore users/{uid}/private/profile\nApp local state -> localStorage immediately + Firestore sync for signed-in users")
H2("Backend path - separate from the browser build")
code("npm run backend -> backend/server.js -> Express routes -> JSON files in backend/data\nGET /api/reactions/catalogue\nPOST /api/reactions/react\nGET /api/quizzes/random")
P("The backend does not share a deployment definition with the Vite static build. It must be deployed separately to a Node-capable host to serve public users. The source currently hardcodes port 5000 and uses broad CORS; treat it as a development/prototype service unless its deployment and security are deliberately configured.", "Calloutx")

section("5. What happens when a student uses the app")
table(["Step", "Code path", "What happens"], [
    ("1. Open site", "index.html -> main.jsx -> App.jsx", "React starts; the welcome page is shown before entering the 3D lab."),
    ("2. Choose account", "WelcomeScreen -> ProfileAccess", "Student signs in with Google or selects guest mode."),
    ("3. Load identity", "firebaseClient.js", "Firebase auth state is watched; profile is read from Firestore when signed in."),
    ("4. Enter", "beginLabEntry in App.jsx", "Saved class, inventory and bench selections are restored; entry animation plays; 3D scene is entered."),
    ("5. Load catalogue", "ncertChemicals.js loadChemicals", "Chemical JSON is normalized and indexed by id; profile filters determine visible shelves and reactions."),
    ("6. Explore", "LabScene + Player + Bottle/Cabinet", "WASD and touch controls move the camera; clicking or interacting collects or opens things."),
    ("7. Prepare reaction", "Inventory + ReactionTable", "Samples are selected (up to four in the UI); mass can be 5, 10, or 20 g; recipes can prefill reactants."),
    ("8. Run reaction", "mixAtTable in App.jsx", "The chosen reactant IDs are compared to the supported reaction list. Unsupported combinations show guidance."),
    ("9. Simulate", "calculateOutcome + useReactionSimulation", "Estimated products/excess and a timed visual event are prepared."),
    ("10. Review", "ExperimentRenderer + ExperimentOverlay", "3D apparatus, observed changes, reaction equation, narration, products, masses, and conditions are shown."),
    ("11. Continue learning", "StudyRoomPanel + QuizPanel", "Class-based notes and a ten-question quiz can be opened from the lab."),
    ("12. Save progress", "profileStore + firebaseClient", "Local browser state is saved; signed-in profile data is also queued to Firestore."),
], [23*mm, 50*mm, 105*mm])

section("6. 3D lab controls and interaction")
H2("Desktop input")
for item in [
    "Player.jsx registers keydown/keyup listeners. W, A, S, and D are read as camera-relative movement. Shift increases the movement speed; Space requests a jump.",
    "E invokes the nearest discovered interaction, including door, poster/chart, quiz chair, or chemical-bench prompts. F stands up from a quiz seat. R recenters the camera pitch. C unlocks/releases the mouse pointer lock.",
    "Right-click toggles pointer lock for looking around. Left-click raycasts from the clicked screen position and invokes a nearby supported lab interaction.",
    "Player clamps the camera inside room boundaries, applies obstacle collision checks in substeps, and updates proximity prompts/stations as the player walks.",
]: bullet(item)
H2("Phone input")
P("MobileLabControls.jsx has a four-direction pad plus hand/interact, sprint, and jump buttons. The pad writes x/y values into App's shared mobileMoveRef. LabScene passes that same ref to Player, which reads it every animation frame and converts it to camera-relative movement. Pointer IDs are released individually so a second thumb tapping jump or interact does not cancel a held direction. The touch drag on the open canvas rotates the camera; it is separate from the buttons.")
code("MobileLabControls -> App.mobileMoveRef -> LabScene -> Player.useFrame()\nUp/down set y; left/right set x; sprinting is a separate ref flag.\nHand -> chemistry-lab-hand-interact event -> Player.interact()\nJump -> chemistry-lab-jump event -> Player jump request")
P("On phones the intended play orientation is landscape; the rotation prompt, touch controls and compact HUD use responsive CSS media queries. The displayed desktop keys are not the control surface on a touch phone.")
H2("First-entry guided tour")
P("On a student's first lab entry, App checks a browser localStorage flag and opens LabGuide. The tour starts with phone controls (hold an arrow to walk, drag the scene to look, hand to interact, jump arrow to jump) or desktop controls (WASD, Shift, Space, E). The chemical step offers curated starter pairs that are filtered to reactions available for the student's selected class, and explains that selecting them adds samples directly to inventory; the student does not carry bottles through the room. Later steps lead toward the central bench, explain selecting a supported recipe and running/replaying the simulation, then show the periodic table/posters, Doubt Corner, notes, quiz room, and setup catalogue. Next, Back, Skip, and progress controls remain available in the scrollable mobile tour.")
P("The starter pair is loaded by App's loadRecipe callback: valid chemical IDs are resolved from the class-filtered catalogue, missing samples are added to inventory, and the pair is selected at the bench. Students still walk to the bench using the controls. The guide completion flag is local to that browser profile.")
H2("3D scene organization")
P("LabScene.jsx composes the room shell, walls, floor, benches, cabinets, boards, lights, quiz room, doors, reaction station, and Player. Smaller components such as Bottle, Cabinet, LabBench, CeilingLight, Equipment, Skeleton, and Stool keep scene pieces reusable. InteractionSurface adds a raycastable area to wall displays and doors so a student can activate them by looking/clicking or pressing E.")

section("7. Reaction matching, chemistry math, and visual simulation")
H2("Reaction selection")
P("A reaction record has an id, reactants, products, balanced equation, classes, reaction type, conditions, observations, and optional gameEffect metadata. App normalizes reactant IDs and matches the set of selected samples against a supported record. The recorded chemical IDs select a known curriculum example; the app does not invent or balance an arbitrary new reaction at runtime.")
H2("Product-mass estimate")
P("src/data/simulation.js contains a small formula-mass parser and calculateOutcome(). It converts sample mass to moles using a limited table of atomic masses, divides by each balanced coefficient to find the limiting-reagent extent, then estimates product grams from product coefficients and formula masses. Any reagent left after consuming the limiting amount is reported as excess.")
code("for each reactant i:\n  moles_i = selected_mass_i / formula_mass_i\nreaction_extent = min(moles_i / coefficient_i)\nproduct_grams_j = reaction_extent * product_coefficient_j * product_formula_mass_j\nremaining_i = max(0, (moles_i - reaction_extent * coefficient_i) * formula_mass_i)")
P("These are stoichiometric estimates, not measured yields. The parser supports the formulas represented by the app's atomic-mass table and handles common subscripts and parentheses. It does not simulate concentration, pressure, kinetics, heat transfer, purity, or experimental losses. The catalogue coefficients/equations are treated as input and are not balanced by this function.", "Calloutx")
H2("Category and equipment selection")
P("simulationEngine.js classifies reactions using their IDs, reaction types, equations, conditions, and observations. It chooses an ignition, mixing, or electrolysis station; extracts gas and precipitate properties; determines colors/indicator behavior; and builds a config consumed by ExperimentRenderer. The renderer selects a corresponding setup component (for example, MagnesiumRibbonBurner, ElectrolysisApparatus, GasCollectionTrough, or DropperPrecipitation) and visual effect components.")
H2("Timeline and result UI")
P("useReactionSimulation.js advances progress from 0 to 1 over a nominal 17 seconds using requestAnimationFrame. Play/pause, reset, and speed-cycle state are returned to App and ExperimentOverlay. ExperimentRenderer turns progress into movement, liquid levels, gas bubbles, flame/glow, precipitate, temperature, and apparatus animation. ExperimentOverlay displays the equation, reaction type, reactants, products, remaining excess, observation summary, conditions/safety notes, theory tabs, export buttons, and narration status.")
H2("What the visual model means")
P("The 3D event is an educational illustration driven by a selected catalogue reaction. It represents visible cues described by the data. It is not computational chemistry, molecular dynamics, a scientific prediction engine, or an exact physical rendering of every lab condition. Some reaction IDs use dedicated setups; remaining records use category-level equipment. Precipitation reactions use a fixed reagent pipette, a clearly outlined beaker, and a drop animation; the whole reactant/product reagent bottles are not flown through the scene. Copper carbonate decomposition has a heated tube and delivery path to a limewater receiver, while magnesium combustion uses a moving ribbon, visible flame, and product dish. Review each record and its apparatus before making a claim about experimental realism.")

section("8. Firebase sign-in and private notebook storage")
H2("Google sign-in sequence")
for item in [
    "ProfileAccess listens to watchAuth() so it can detect a browser's saved Firebase session.",
    "signInWithGoogle() selects browserLocalPersistence and opens Google via Firebase Authentication popup. The client checks emailVerified and signs out if the user is not verified.",
    "The Firebase user UID is the account key. loadUserProfile(uid) reads users/{uid}/private/profile.",
    "When the student saves, saveUserProfile() writes a constrained profile object with name, class level, study track, histories, inventory, selected bench chemicals, active chemical, sample mass, and updatedAt.",
    "App saves local state for fast recovery. For a signed-in profile it waits 700 ms after changes before syncing to Firestore; this reduces rapid repeated writes while a student is changing the lab state.",
]: bullet(item)
H2("Firestore access rule")
code("rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /users/{userId}/private/{document=**} {\n      allow read, write: if request.auth != null\n        && request.auth.uid == userId;\n    }\n  }\n}")
P("The rule allows a signed-in Firebase user to access only the private path whose userId matches that signed-in user's UID. A different signed-in account cannot read or write this path through the client. Keep these rules published in Firebase; client-side checks alone are not sufficient.")
H2("Configuration values")
table(["Build variable", "Meaning", "Where used"], [
    ("VITE_FIREBASE_API_KEY", "Firebase web app key / project client identifier.", "firebaseClient.js config.apiKey"),
    ("VITE_FIREBASE_AUTH_DOMAIN", "Firebase Authentication domain for the project.", "config.authDomain"),
    ("VITE_FIREBASE_PROJECT_ID", "Firebase project ID that owns Auth/Firestore.", "config.projectId"),
    ("VITE_FIREBASE_APP_ID", "Identifier for the registered Firebase web app.", "config.appId"),
], [48*mm, 75*mm, 55*mm])
P(".env.example documents these names. A private local file named .env.local is ignored by the checked-in .gitignore pattern *.local. In Cloudflare's Git build workflow these values must be available at build time, because Vite replaces import.meta.env.VITE_* references while compiling the static JavaScript. If a value is missing, firebaseConfigured is false and Google sign-in reports that setup is incomplete.")
P("The Firebase web API key is shipped to the browser as part of a client application and is not an admin credential. It should be restricted to the intended web app/domain in Google/Firebase settings. Never place a Firebase service-account private key or other server credential in a VITE_ variable or frontend source. The actual key values are intentionally not printed in this guide.", "Calloutx")
H2("Guest storage versus account storage")
P("profileStore.js uses localStorage for profiles and progress. Google-authenticated profile keys use the Firebase UID; guests use name/class/study-track selectors. Local storage belongs to one browser profile on one device and can be cleared by the user. Only signed-in profiles are synced to Firestore and can follow the account across devices, subject to Firebase configuration and rules.")

section("9. Quiz and chapter-note systems")
H2("Quizzes")
P("QuizPanel.jsx loads a ten-question quiz by class. The frontend question bank imports seed questions from backend/data/quizzes/class9.json through class12.json, then expands them into differently worded entries and samples unique source questions without replacement. Answer options are shuffled. Correct and incorrect answers call soundManager feedback. QuizPanel records class, score, total, and date through App's recordQuizRound callback.")
P("loadRandomQuizQuestions() first attempts the optional local Express endpoint at http://localhost:5000/api/quizzes/random. If it fails for a reason other than user cancellation, the browser samples the bundled bank. Hindi questions come from quizHindi.js. This local-first fallback is important to explain when asked whether the public quiz depends on a hosted API: in the deployed app, bundled data is the dependable source unless a real public API URL is configured.")
H2("Chapter notes")
P("StudyRoomPanel is lazy-loaded by App so the notes bundle need not load until requested. studyNotes.js provides chapter text, studyNoteExtensions.js and studyNoteDeepDives.js add applied and advanced material, and studyNotesHindi.js provides Hindi content. The panel supports class selection, chapter/page navigation, quick notes, and illustrations made from native UI/code, rather than external image files.")

section("10. Audio, accessibility, and bilingual support")
H2("Audio")
P("soundManager.js combines supplied clips in public/audio with Web Audio synthesis. It plays movement loops, pickup/pour/reaction sounds, quiz feedback and interface cues, tracks active sources, and exposes stop/mute behavior. The browser audio context is unlocked after a user gesture because browsers generally block autoplay audio before interaction. ReactionNarration uses speechSynthesis for spoken progress messages when enabled.")
P("The audio assets in this repository are applause.wav, faahhhhh.mp3, glass-smash.mp3, running.mp3, walking.mp3, and wrong-answer.mp3. Not every synthesized sound needs a separate file; Web Audio creates oscillators/noise nodes in code.")
H2("Language and accessibility")
P("i18n.jsx provides LanguageProvider, useLanguage(), translation lookup, and scientific Hindi localization. The chosen language is stored under chemistry-world-language in localStorage. Interactive components use buttons, labels, dialog roles, accessible names, keyboard controls, and visible status where applicable. Touch layouts use safe-area insets and larger hit targets. Browser and assistive-technology support can still differ, so these patterns should be demonstrated on the target device.")

section("11. Build and run commands")
table(["Command", "What it does", "Where it is useful"], [
    ("npm install", "Installs frontend dependencies from package.json/package-lock.json.", "First local setup."),
    ("npm run dev", "Starts Vite's local development server with hot reload.", "Edit and preview the browser app locally."),
    ("npm run build", "Runs vite build and writes the optimized static site to dist/.", "Production build and Cloudflare build step."),
    ("npm run preview", "Serves the already-built dist output locally for a production-like preview.", "Check the production bundle locally."),
    ("npm run backend", "Runs npm --prefix backend start, which launches backend/server.js.", "Optional local API at port 5000."),
    ("npm test", "Runs node test/reactionSimulationTest.js.", "Available reaction simulation regression check. This guide does not claim the test was run."),
    ("npm run lint", "Runs oxlint.", "Static code checks; it does not replace runtime testing."),
], [39*mm, 82*mm, 57*mm])
H2("Build stages")
for item in [
    "Vite reads vite.config.js and enables @vitejs/plugin-react.",
    "The entry HTML loads src/main.jsx; Vite follows all static imports from there.",
    "JSX is transformed and React modules, Three.js code, JSON data, CSS, and static assets are bundled.",
    "VITE_* environment variables are embedded into client code during this build. They are not looked up dynamically by a static page after it has shipped.",
    "Vite writes index.html plus hashed assets to dist/. Cloudflare publishes the configured output/build as static content or Worker assets according to the dashboard configuration.",
]: bullet(item)
P("The source changes described in this guide were built successfully with Vite on 16 November 2026. The main JavaScript output is about 2.71 MB minified and triggers Vite's 500 kB size advisory; code splitting/lazy loading is a clear mobile load-time improvement opportunity, not a build failure.", "Calloutx")

section("12. Deployment pipeline and environment values")
H2("Typical Git-connected deployment")
code("edit source -> commit in GitHub Desktop -> push to GitHub main\nCloudflare detects the new commit -> installs dependencies -> runs build command\nCloudflare publishes the new build -> workers.dev URL serves the latest production version")
P("A code change in a local folder does not change the public site by itself. It must be committed and pushed to the repository connected in Cloudflare, and the Cloudflare deployment must finish successfully. The actual production branch, root directory, build command, deploy command, and output directory are Cloudflare dashboard settings. This repository has vite.config.js but no wrangler.toml, so the deploy behavior is not fully specified by source files alone.")
H2("Firebase configuration and Cloudflare")
P("For a Git build, configure all four VITE_FIREBASE_* values in the build environment that Cloudflare exposes to Vite. Build-time values belong to the build configuration; a static-assets-only Worker may not support runtime secrets or server bindings. After changing these values, a new build/deployment is required. For a Vite static site the output folder is normally dist, but follow the actual connected project's Cloudflare configuration rather than assuming a setting from another service.")
H2("Two separate releases")
P("Publishing the frontend and running the optional Express API are different deployments. Cloudflare's Vite static build does not turn backend/server.js into a running Express service. If the API is ever needed by the public site, it requires a Node-capable host, an HTTPS public API URL, CORS restrictions, deployment environment values, and frontend code that uses that public URL instead of localhost. Today the bundled quiz fallback avoids requiring that service for the quiz content.")
H2("Current workspace limitation")
P("The project folder inspected for this guide does not contain Git metadata, so a commit or push cannot be performed from this workspace copy. That does not stop local build or source review; it means publishing requires the actual GitHub Desktop clone connected to the Cloudflare production build.", "Calloutx")

section("13. File-by-file project directory guide", "The descriptions below explain the responsibility of each application, configuration, and source file in the inspected project. Data files are then expanded in Section 14.")
roles = {
    "index.html": "Browser entry document: metadata, root element, favicon, responsive viewport, SEO/social cards, and src/main.jsx module entry.",
    "package.json": "Frontend package metadata, dependency list, and npm scripts.",
    "package-lock.json": "Exact resolved npm dependency tree for repeatable installs.",
    "vite.config.js": "Vite configuration; installs the React plugin used for JSX/build transformation.",
    "README.md": "Introductory run/use notes. Some statements are older than active Class 9-12/Firebase features; treat source and FIREBASE_SETUP.md as current for those areas.",
    "FIREBASE_SETUP.md": "Firebase setup, Google Authentication, authorized domains, Firestore rules, environment variables, and redeployment steps.",
    "firestore.rules": "Database-side rule limiting reads/writes to the authenticated user's private document path.",
    ".env.example": "Names of the four Firebase web build variables; blank template, not credentials.",
    ".gitignore": "Excludes dependency/build outputs and local-only files, including *.local.",
    ".oxlintrc.json": "Oxlint static-analysis configuration.",
    "src/main.jsx": "Creates React root, imports base CSS, applies StrictMode and LanguageProvider, renders App.",
    "src/App.jsx": "Top-level application state and orchestration: identity, class filtering, inventory, chemical collection, reaction selection, outcome math, profile persistence, panels, 3D Canvas, and connections between UI and scene callbacks.",
    "src/App.css": "Application-wide component styles including welcome page, lab HUD, reactions, dialogs, breakpoints, landscape touch controls, and responsive phone styling.",
    "src/index.css": "Global/base styles such as document sizing, fonts, resets, and browser defaults.",
    "src/i18n.jsx": "English/Hindi context, translation lookup, persisted language selection, and Hindi scientific term localization.",
    "src/components/LabScene.jsx": "Assembles the interactive 3D room and class-specific shelves; places doors, quiz room, posters, benches, obstacles, and Player; routes interaction callbacks.",
    "src/components/Player.jsx": "First-person camera movement and interaction logic: WASD, sprint/jump, pointer lock, touch look, collisions, proximity prompts, quiz chair, and reaction camera focus.",
    "src/components/Bottle.jsx": "3D chemical bottle representation and pointer selection/collection behavior.",
    "src/components/Cabinet.jsx": "Shelf/cabinet geometry and organization for reagent display.",
    "src/components/CeilingLight.jsx": "Reusable ceiling light model and light appearance.",
    "src/components/Door.jsx": "Reusable door visual/animation primitive, where used by the scene.",
    "src/components/Equipment.jsx": "Laboratory equipment 3D models used around the room/workstations.",
    "src/components/InteractionSurface.jsx": "Invisible or visible raycast target surfaces that make posters, doors, and stations interactable.",
    "src/components/LabBench.jsx": "Bench/worktop geometry shared by lab areas.",
    "src/components/LabFixtures.jsx": "Fixed lab fixtures and room visual objects, including instructional surfaces/periodic table where configured.",
    "src/components/ReactionShowcase.jsx": "3D showcase/selection stage for curated reaction setups.",
    "src/components/Skeleton.jsx": "Skeleton display model in the lab environment.",
    "src/components/Stool.jsx": "Reusable stool/chair model for classroom and lab seating.",
    "src/components/simulation/ExperimentOverlay.jsx": "2D reaction information UI layered over the 3D view: equation, observations, result details, theory/products, playback, export, and narration status.",
    "src/components/simulation/ExperimentRenderer.jsx": "Chooses reaction apparatus/effects and maps reaction progress into 3D liquid, gas, glow, heat, precipitate, and apparatus animation; reactant and product bottles stay out of the moving result display.",
    "src/components/simulation/ReactionNarration.jsx": "Reaction progress explanation, play/pause/speed controls, and user-facing current narration status.",
    "src/components/simulation/simulationEngine.js": "Classifies a reaction, maps it to a station, resolves product/gas/precipitate/indicator data, and builds the config used by renderer and overlay.",
    "src/components/simulation/useReactionSimulation.js": "React hook for 17-second progress timer, requestAnimationFrame, pause/reset/playback speed, and theory drawer state.",
    "src/data/ncertChemicals.js": "Imports chemical and reaction JSON, normalizes formulas/categories, filters incomplete/unregistered records, creates NCERT_REACTIONS, and loads the chemical library.",
    "src/data/simulation.js": "Formula molar-mass parser and stoichiometric product/excess-mass estimator.",
    "src/data/chemicalVisuals.js": "Color lookup and display helpers mapping chemical/reaction identities to visual palette values.",
    "src/data/profileStore.js": "Guest/signed-in profile shaping and browser localStorage persistence, including previous progress restoration.",
    "src/data/firebaseClient.js": "Firebase config initialization; Google sign-in and email verification; auth listener; Firestore profile read/write; sign-out.",
    "src/data/quizQuestions.js": "Loads class quiz JSON, expands seed wording variants, shuffles unique source questions, attempts local API first, then falls back to bundled questions.",
    "src/data/quizHindi.js": "Hindi class question bank and sampling helpers.",
    "src/data/studyNotes.js": "English class/chapter quick notes and lesson outline content.",
    "src/data/studyNotesHindi.js": "Hindi chapter notes and page content.",
    "src/data/studyNoteExtensions.js": "Applied-learning follow-up content for chapters.",
    "src/data/studyNoteDeepDives.js": "Advanced/extension explanations following chapter notes.",
    "src/data/ncertSupplementaryReactions.js": "Supplementary curated NCERT reaction records appended to the main reaction library.",
    "src/data/class11_12_Reactions.js": "Curated Class 11-12 reaction definitions with coefficients, formulas, conditions, observations, and effects.",
    "src/data/entranceReactionAdditions.js": "Additional JEE/NEET reaction catalogue entries and exam-track tagging.",
    "src/data/ncertChemicalAdditions.json": "Extra curated chemical definitions that complement bundled chemical JSON.",
    "src/data/labStations.js": "Station identity and coordinate mapping for mixing, ignition, and electrolysis reaction apparatus.",
    "src/data/quizRoomLayout.js": "Quiz classroom seat positions and related spatial layout data.",
    "src/data/creatorProfile.js": "Creator profile text displayed by the welcome/about panel.",
    "src/ui/WelcomeScreen.jsx": "Public landing/welcome experience, product explanation, class links, FAQ/contact, profile entry, and responsive menus.",
    "src/ui/ProfileAccess.jsx": "Google or guest entry UI; loads saved profile, validates student name/class, saves cloud profile, and continues to lab.",
    "src/ui/Inventory.jsx": "Collected chemical list, active sample selection, mobile formula-symbol strip, and remove/clear actions.",
    "src/ui/ReactionTable.jsx": "Reaction workbench: sample slots, sample mass, chemical search/library, recipe cards, class filtering, and run button.",
    "src/ui/MobileLabControls.jsx": "Touch arrow pad, sprint toggle, hand/interact and jump actions; writes direction and sprint values to the shared Player ref.",
    "src/ui/LabGuide.jsx": "First-entry multi-step tutorial covering movement, sample choice, reaction bench, experiments, posters, Doubt Corner, notes, quizzes, and setup catalogue.",
    "src/ui/LabCompanion.jsx": "Optional animated helper character and context tips.",
    "src/ui/QuizPanel.jsx": "Ten-question quiz flow, answer feedback, score, retry, and class selection.",
    "src/ui/StudyRoomPanel.jsx": "Chapter selection and paged class notes, Hindi/English localization, and reading controls.",
    "src/ui/ReactionShowcaseModal.jsx": "Browse and select curated reaction setup demonstrations.",
    "src/utils/soundManager.js": "Audio manager using Web Audio and public clips for movement, reactions, quiz feedback, pours, gates, and UI events.",
    "src/utils/characterActions.js": "Dispatches simple character action/animation cues such as pickup, discard, and pour.",
    "src/utils/labInteractionTargets.js": "Registers/queries raycast interaction targets for scene objects.",
    "src/utils/resultCard.js": "Builds a shareable PNG result card using browser canvas, download, and share APIs.",
    "test/reactionSimulationTest.js": "Node-based regression checks for reaction data/calculation logic; invoked by npm test.",
    "backend/server.js": "Optional Express server, JSON body parsing, CORS, route registration, database validation, and port 5000 listener.",
    "backend/routes/reactions.js": "Optional HTTP endpoints for reaction stats/catalogue and a two-chemical POST prototype.",
    "backend/routes/quizzes.js": "Optional HTTP endpoints for quiz counts and randomly selected questions from class seed JSON.",
    "backend/services/reactionEngine.js": "Loads server-side chemical/reaction JSON and indexes reactant ID sets for lookup.",
    "backend/services/validateDatabase.js": "Scans server JSON and reports missing chemical references, duplicates, and malformed reaction records.",
    "backend/package.json": "Backend CommonJS package and Express/CORS dependencies; npm start runs server.js.",
    "public/favicon.svg": "Browser tab/site icon.",
    "public/audio/applause.wav": "Short applause/positive-feedback audio asset.",
    "public/audio/faahhhhh.mp3": "Sound effect asset used by the project audio manager.",
    "public/audio/glass-smash.mp3": "Glass/break-style sound asset for audio effects.",
    "public/audio/running.mp3": "Looped movement audio used for sprinting.",
    "public/audio/walking.mp3": "Looped movement audio used for walking.",
    "public/audio/wrong-answer.mp3": "Quiz incorrect-answer feedback sound.",
}

def default_role(path):
    p = path.replace("\\", "/")
    name = Path(p).name
    if p.startswith("backend/data/chemicals/"):
        return "Chemical JSON catalogue: names, IDs, formulae, state, category, color, and chemical properties consumed by the optional server or bundled frontend." 
    if p.startswith("backend/data/quizzes/"):
        return "Seed question array for the named class; the frontend expands and shuffles these records, and the optional API can serve random samples." 
    if p.startswith("backend/data/reactions/"):
        topic = Path(p).stem.replace("_", " ")
        return f"Reaction records for {topic}; entries describe reactant/product IDs, coefficients/equations, class metadata, observations, conditions, and optional visual effects." 
    if p == "backend/data/reactionCatalogue.json":
        return "Consolidated server reaction catalogue used by the optional backend reaction index." 
    if p == "backend/data/reactions.json":
        return "Legacy/top-level reaction collection retained as data; check current imports before treating it as the active runtime catalogue." 
    if p == "backend/data/archive/chemicals.json":
        return "Archived/legacy chemical catalogue; not the main current frontend chemical glob." 
    if p.endswith(".json") and p.startswith("src/data/"):
        return "Structured application data imported by the matching source module." 
    return "Project data file; see its directory and importing module to understand its runtime role." 


def inventory_rows():
    all_paths = []
    for folder in ["src", "backend", "public", "test"]:
        for p in (ROOT / folder).rglob("*"):
            if p.is_file() and "node_modules" not in p.parts and "dist" not in p.parts:
                all_paths.append(p.relative_to(ROOT).as_posix())
    for name in ["index.html", "package.json", "package-lock.json", "vite.config.js", "README.md", "FIREBASE_SETUP.md", "firestore.rules", ".env.example", ".gitignore", ".oxlintrc.json"]:
        if (ROOT / name).is_file(): all_paths.append(name)
    rows = []
    for path in sorted(set(all_paths), key=lambda v: (v.split("/")[0], v.lower())):
        description = roles.get(path)
        if not description:
            # package-lock is large but only dependency metadata; do not expand every package.
            description = default_role(path)
        rows.append((path, description))
    return rows


table(["File", "Responsibility"], inventory_rows(), [61*mm, 117*mm])

story.append(Spacer(1, 8))
H1("14. Data file guide")
story.append(HRFlowable(width="100%", thickness=.7, color=LINE, spaceAfter=8))
H2("How a reaction record is shaped")
code("{\n  \"id\": \"unique_reaction_key\",\n  \"classes\": [9, 10],\n  \"chapter\": \"Chapter / topic label\",\n  \"reactants\": [{\"chemicalId\": \"zinc\", \"coefficient\": 1}],\n  \"products\": [{\"chemicalId\": \"hydrogen\", \"coefficient\": 1}],\n  \"equation\": \"Zn + 2HCl -> ZnCl2 + H2\",\n  \"reactionType\": [\"displacement\", \"gas_evolution\"],\n  \"conditions\": {\"heatRequired\": false, \"catalyst\": null},\n  \"observations\": {\"gas\": \"hydrogen\", \"colorChange\": null},\n  \"gameEffect\": {\"bubbles\": true}\n}")
P("This is a shape illustration, not a claim that every record has exactly these fields. Optional fields are common. The frontend joins each chemicalId to the chemical library to show names, formulas, states, and colors.")
H2("Chemical records")
P("Chemical data is split into groups such as acids, bases, salts, oxides, gases, elements, indicators, organic compounds, and catalogue additions. A chemical ID is the stable key used by reaction data, cabinet entries, inventories, and products. Formula, state, color, category, and molar/formula data support UI and simulation presentation.")
H2("Quiz data")
P("Each class quiz JSON provides seed question objects. The frontend preserves a source question ID so alternate wordings of the same seed do not appear together. Answer labels are shuffled while the correct answer index is moved with its label.")
H2("Complete JSON inventory")
P("The following list is generated from the actual JSON files found under backend/data and src/data. The numbered class/topic subfolders support organization; the optional server recursively scans reaction JSON, while frontend code imports selected consolidated and curated files.")
json_rows = []
for p in sorted((ROOT / "backend" / "data").rglob("*.json")) + sorted((ROOT / "src" / "data").glob("*.json")):
    rel = p.relative_to(ROOT).as_posix()
    json_rows.append((rel, default_role(rel)))
table(["JSON data file", "Content / runtime role"], json_rows, [70*mm, 108*mm])
P("A practical code-reading order is: start with src/data/ncertChemicals.js to see the frontend catalogue imports; open the imported JSON or JS reaction modules for content; then follow App.jsx matching and data/simulation.js calculations; finally follow simulationEngine.js and ExperimentRenderer.jsx to understand how metadata becomes a visual setup.")

section("15. Security, scientific scope, and known limits")
H2("Security")
for item in [
    "Firebase web configuration is required for sign-in; a missing value disables configuration and shows a setup message.",
    "Firestore rules restrict each authenticated account to its own UID folder. Those rules must be deployed to Firebase separately from the frontend.",
    "The web API key is not a service-account private key. It is public client configuration. Protect data with Firestore rules and restrict API usage/domains in Google Cloud/Firebase.",
    "No admin/service account credential belongs in browser JavaScript, VITE_ variables, Git, or the Cloudflare static bundle.",
    "The optional Express backend currently uses broad CORS and no authentication middleware. Do not expose it as a production database/API without adding validation, rate limiting, auth where needed, and an HTTPS host.",
    "Guest data lives in localStorage, so anyone using the same browser profile may inspect/change it. It is not private cloud storage.",
]: bullet(item)
H2("Scientific boundaries")
for item in [
    "The result catalogue is curated educational data, not generated chemistry. Unsupported sample sets are rejected with a guidance message.",
    "The mass estimator uses stoichiometry and formula masses; its yield is theoretical and it does not model real lab variability.",
    "Apparatus and visible effects represent observations from metadata. They do not calculate particle motion or reaction kinetics.",
    "Safety text is informational. The app is not a substitute for teacher supervision or a physical lab risk assessment.",
]: bullet(item)
H2("Implementation limits an examiner may notice")
for item in [
    "The README is partly stale: it describes a smaller Class 9-10 offline prototype. Active code includes Classes 9-12, Firebase setup, a guest route, and additional modules.",
    "Quiz frontend code tries a localhost endpoint. It falls back to bundled question data, which is why local API availability is not required for public quiz content.",
    "Backend files exist but the frontend and Cloudflare static deployment do not launch them automatically. Their routes are optional prototype routes.",
    "The source folder inspected has no wrangler.toml and no .git directory. Cloudflare build/deploy configuration and the live Git remote must be checked in their dashboards/actual clone.",
    "The current Vite build succeeds but its main JavaScript bundle is about 2.7 MB minified and triggers the 500 kB advisory. More lazy loading and chunk splitting could improve first load and mobile performance.",
]: bullet(item)

section("16. Common technical review questions and answers")
qa = [
    ("What problem does the project solve?", "It gives students a walk-through 3D environment to inspect chemistry equipment, select known reactants, and see curriculum reaction outcomes and observations with class-linked notes and quizzes."),
    ("What language is the app written in?", "Primarily JavaScript with JSX for React components. Styling is CSS, learning/reaction content is JSON or JavaScript data, the HTML entry is index.html, and Firestore security is written in Firebase Rules syntax."),
    ("Why React?", "React divides the application into reusable UI and scene components and keeps interaction state such as inventory, account profile, quiz progress, and current reaction in one connected interface."),
    ("How is the 3D lab made?", "Three.js provides the 3D rendering primitives and WebGL scene; React Three Fiber exposes that scene through React components. LabScene assembles reusable geometry and Player controls the camera."),
    ("Where does reaction data come from?", "It is bundled in local JSON and curated JavaScript modules, then assembled and filtered by ncertChemicals.js. The public app does not need a remote chemistry API for its catalogue."),
    ("Does the system balance any equation automatically?", "No. It matches selected reactant IDs to a curated reaction record and trusts that record's equation and coefficients. It calculates theoretical product and excess masses from those coefficients."),
    ("How are product masses estimated?", "The app converts selected grams to moles, divides each reactant amount by its balanced coefficient, selects the minimum extent, then applies product coefficients and formula masses."),
    ("Why can it show an estimated mass rather than real yield?", "There is no physical experiment, concentration/temperature measurement, side-reaction model, or laboratory loss model. It is stoichiometric theory, so output is explicitly an estimate."),
    ("What does the Firebase API key protect?", "The Firebase web API key identifies the project for a client SDK; it is not a server/admin secret. Firestore Security Rules and user authentication protect user documents."),
    ("How is one student's data kept separate?", "Firebase Authentication supplies a UID. The profile path contains that UID, and firestore.rules only allows a request when request.auth.uid equals the path userId."),
    ("What happens when the student is a guest?", "The app continues without Firebase sign-in and uses localStorage on that browser. Guest data does not sync to another device and is not protected like a private authenticated account."),
    ("Where do Firebase values come from?", "Firebase Console -> Project settings -> General -> registered Web App configuration. The project expects API key, auth domain, project ID, and app ID as VITE_FIREBASE_* build variables."),
    ("Why do values need to be added to Cloudflare build settings?", "Vite inserts VITE_* values at build time. Cloudflare must pass them during the build that generates the static client files; a static Worker cannot magically read a local .env.local later."),
    ("Is the Express backend used on the live website?", "Not as currently wired. It is a separate optional local server on port 5000. The frontend has a local quiz request with a bundled fallback. The main reaction catalogue and calculations run in browser code."),
    ("What is the API key list?", "The app has four Firebase client environment values: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID. No private service-account key should be included."),
    ("How does a code change reach the live site?", "Edit the connected repository, commit and push the production branch, wait for Cloudflare's Git build/deploy to succeed, then reload the public workers.dev URL. A local edit alone is not published."),
    ("What is Vite's job?", "Vite runs the local development server and bundles the imported source/assets for production. The production build is written to dist/."),
    ("How does mobile movement work?", "The four touch buttons write direction values to the shared ref. App passes it through LabScene, and Player reads it every frame for camera-relative motion. Each pointer is released separately, so using another finger for jump/interact does not cancel walking. The hand and jump buttons dispatch custom events handled by Player."),
    ("How are quizzes randomized?", "Class seed questions are expanded into alternate wording, grouped by source question, sampled without replacement, and their answer labels are shuffled while preserving the correct answer."),
    ("What is localStorage used for?", "It remembers the chosen language, guest/profile progress, and selected UI preferences across reloads in one browser profile. It is not a remote database."),
    ("What happens if Firebase settings are missing?", "firebaseConfigured becomes false, Firebase app/auth/db are not initialized, and Google sign-in reports missing web configuration. Guest entry remains available."),
    ("How is safety handled?", "Reaction records and result details can show hazard warnings, required heating/catalyst conditions, and safe educational observations. The model is virtual and cannot replace supervision."),
    ("How do you test the project?", "The repo defines npm test for test/reactionSimulationTest.js, npm run lint for oxlint, and npm run build for the production bundle. A reviewer can run these commands; a successful build is not the same as testing every phone/browser interaction."),
]
for question, answer in qa:
    story.append(KeepTogether([Paragraph(question, styles["H3x"]), Paragraph(answer, styles["Bodyx"])]))

section("17. Short project explanation for the presentation")
P("Use this as a spoken summary, then answer follow-up questions using the sections above.", "Smallx")
P("Chemistry World is a browser-based learning application for Classes 9 to 12. Its interface is built with React and JavaScript, while the walk-through laboratory is a Three.js scene rendered through React Three Fiber. Students can move through the room, collect labelled chemical samples, choose a supported reaction, and inspect an animated apparatus with the balanced equation, observations, theoretical product masses, and excess reactant. The reaction catalogue and educational content are bundled locally, so the main lab does not require a custom chemistry server. For accounts, Firebase Authentication signs students in with Google, and Firestore stores each student's notebook under a UID-protected document path. Guest progress stays in that browser's local storage. Vite builds the frontend into static files, which Cloudflare can publish when the connected Git branch is pushed and its deployment succeeds. There is also an Express API prototype in the repository, but it is separate from the current static frontend deployment.", "Calloutx")
H2("A 60-second code tour")
for item in [
    "Start at index.html and src/main.jsx to explain bootstrapping.",
    "Open App.jsx to show the central state and callbacks.",
    "Open LabScene.jsx and Player.jsx for 3D layout and input.",
    "Open ncertChemicals.js and a reaction JSON record to show the source data.",
    "Open simulation.js and simulationEngine.js to explain stoichiometry and visual configuration.",
    "Open ExperimentRenderer.jsx and ExperimentOverlay.jsx to show the 3D and textual result layers.",
    "Open firebaseClient.js and firestore.rules for account identity and data access control.",
    "Open package.json and vite.config.js to explain local development and production build.",
]: bullet(item)

section("18. Glossary")
gloss = [
    ("API", "A defined way for one program to request data or actions from another over HTTP or an SDK."),
    ("Build", "The process of turning source code and imported assets into files optimized for the browser."),
    ("Coefficient", "The number in front of a chemical formula in a balanced equation; it expresses the stoichiometric ratio."),
    ("Firestore", "Firebase's cloud document database used here for per-account profile/notebook records."),
    ("Hook", "A React function for reusable component behavior or state, such as useReactionSimulation."),
    ("Limiting reagent", "The reactant that runs out first according to the balanced coefficient ratios."),
    ("localStorage", "Browser storage that persists simple data on one device/browser profile."),
    ("Mole", "A chemistry amount unit; calculations use mass divided by molar mass to estimate moles."),
    ("Reactant / product", "Starting substance / substance listed as formed by a reaction record."),
    ("React Three Fiber", "A React renderer that represents Three.js objects as React components."),
    ("UID", "A unique Firebase Authentication user identifier used to isolate user data."),
    ("Vite", "The JavaScript development server and production build tool used in this repository."),
    ("WebGL", "A browser graphics API used by Three.js to render the interactive 3D laboratory."),
    ("VITE_ environment variable", "A build-time variable Vite exposes to browser code. Values are visible in shipped client code, so they must not be treated as server secrets."),
]
table(["Term", "Meaning in this project"], gloss, [46*mm, 132*mm])
story.append(Spacer(1, 6))
P("End of guide. For a live code review, verify the current Firebase Console settings, Cloudflare build settings, connected Git branch, and the deployed version ID in their respective dashboards. Those account-side values are intentionally not embedded in a source-based project document.", "Smallx")

doc = GuideDoc(str(OUT))
doc.build(story)
print(OUT)

