# HydroVent AI Dashboard

Build a fully functional, interactive web application called Hydrovent AI for a college hackathon. The project aims to improve oxygen transfer in polluted or low-oxygen water using a Venturi aeration system.

1. Design and user interface

Create a modern, professional environmental-tech dashboard using deep blue, teal, white, and green. Make it visually impressive, clean, responsive, and suitable for presenting to hackathon judges on a laptop.

2. Main dashboard

Display:

Hydrovent AI logo/name and project tagline: “Cleaner Water, Sustainable Future.”

A brief explanation of the water aeration problem and proposed solution.

A live system-status indicator.

Water-flow, air-intake, and illustrative dissolved-oxygen panels.
3. Interactive system controls

Add working controls for:

Water flow: adjustable slider from 0% to 100%.

Air intake: adjustable slider from 0% to 100%.

Operating mode: Natural Water Flow and Pump-Assisted Recirculation.

Start Simulation, Pause Simulation, and Reset buttons.

All controls must respond immediately. Display the selected slider values and update the dashboard dynamically.

4. Animated Venturi aeration diagram

Create a clear, animated technical diagram showing:

Water Tank → Pump (in pump-assisted mode) → Narrow Venturi Throat → Air Inlet → Air-Water Mixing → Aerated Water Outlet → Return to Tank.
Show moving water through the pipe and air bubbles entering through the air inlet and mixing with water when the simulation is running. The animation must pause and reset correctly.

Explain that faster water flow through the narrow throat can reduce local static pressure, allowing atmospheric air to enter when the pressure conditions are sufficient.

5. Engineering problem and solution

Include a low-flow scenario. When water flow is insufficient, show a warning that Venturi air suction may be inadequate.

In Natural Water Flow mode, explain that the system depends on sufficient existing water flow and pressure.

In Pump-Assisted Recirculation mode, show how a pump can provide the driving flow required for the Venturi injector. Make it clear that a pump requires a power source.

Do not assume that increasing the air-intake setting alone will solve insufficient water flow.
6. Water-quality simulation

Display a dissolved-oxygen (DO) value in mg/L with a visual progress bar. Use a simple, clearly labelled illustrative simulation to show how operating conditions may affect the display.

Update the simulated value while the system is running. Stop changes when paused and restore the starting state when Reset is clicked.

All values must be explicitly labelled SIMULATED — NOT REAL SENSOR DATA. Do not claim the values accurately predict real oxygen transfer.
7. Functional requirements

Every slider, button, dropdown, status indicator, and animation must work.

Changing water flow or air intake must update the relevant readings and system status.

Starting the simulation must animate the water and bubbles.

Low-flow conditions must produce an appropriate warning.

Pause must freeze the simulation.

Reset must restore all controls and readings to their initial values.

Prevent errors when sliders are set to zero.

Make the interface usable on mobile and desktop.
8. Technical requirements

Use Lovable's supported frontend stack, such as React, TypeScript, and Tailwind CSS. Use local frontend state for the simulation.

Do not require paid APIs, API keys, external hardware, a database, authentication, or a backend. The prototype must run directly in the Lovable preview without extra setup.

9. Presentation section

Add a concise “How It Works” section and a “Problem → Solution → Expected Benefit” section that I can explain during a hackathon presentation.

Include a disclaimer that actual dissolved-oxygen improvement must be verified through physical testing with a dissolved-oxygen meter. Aeration alone does not establish that polluted water is safe or remove all industrial contaminants.
Final instruction: Build the complete working application, not just a static design or mockup. Implement and test all interactions in the preview. Prioritize a reliable demonstration over unnecessary features. If a feature cannot be implemented, clearly state the limitation rather than presenting it as functional.
@connector:github:"GitHub API"  also connect my github account

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d27abc89-7164-4e7c-b993-bc207c8097b4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
