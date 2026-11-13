# Virtual Chemistry Lab

An offline, interactive 3D chemistry lab for exploring Class 9–10 NCERT reaction examples.

## Run locally

1. Install Node.js if it is not already installed.
2. From this folder, run `npm install` once.
3. Run `npm run dev` and open the local URL printed in the terminal (normally `http://localhost:5173/`).

The lab bundles its chemistry data with the frontend. It does not need a hosted server or a running backend.

## Using the lab

- Walk with **WASD** and look around with the mouse.
- Click a labelled bottle in the cabinets to collect a sample.
- Choose a sample size of **5 g**, **10 g**, or **20 g** before collecting it.
- Walk up to the central bench to open the reaction table.
- Add one to four collected samples, or choose a recipe from the NCERT reaction catalogue.
- Run the selected samples to see the balanced equation, products, estimated product mass, excess reactants, observations, and any heating, light, or catalyst condition.
- Find the 118-element periodic table on the right wall. The back wall has no chart.
- View the human-sized skeleton model upright on its display stand beside the main bench.

The bundled catalogue currently contains 81 curated reaction simulations across the two school levels. Calculated masses are estimates from the balanced equation and selected sample sizes; the app does not model real lab yield, temperature, pressure, or reaction kinetics. Heating, light, and catalyst requirements are shown as notes rather than animated lab steps.
