### Photon w/ React

#### Instructions for Running

1. Clone this repo.
```sh
git clone https://github.com/silvia-odwyer/photon
```

2. Install the demo dependencies.
```sh
cd react_app_demo
npm install
```

3. Start a development server at localhost:5173.
```sh
npm run dev
```
Vite will open the app in your browser and hot-reload when you edit sources.

4. Build an optimised production bundle.
```sh
npm run build
```
Use `npm run preview` to verify the build locally, or `npm run lint` to run TypeScript in no-emit mode.

> Want to test against a locally compiled Photon crate? Run `wasm-pack build` inside `crate/` and point the demo at the generated `crate/pkg` output (e.g. via `npm link`).

### Vite + React Notes

This project is bootstrapped with [Vite](https://vitejs.dev/) and React 19 with TypeScript. The Photon WebAssembly package is loaded directly from npm and initialised before the UI becomes interactive.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode at [http://localhost:5173](http://localhost:5173) with hot module replacement.

### `npm run build`

Generates a production-ready bundle in `dist/` and runs the TypeScript compiler as part of the build pipeline.

### `npm run preview`

Serves the production bundle locally so you can sanity-check the optimised output.

### `npm run lint`

Type-checks the project (`tsc --noEmit`) without writing any build artifacts.

## Learn More

- [Photon documentation](https://silvia-odwyer.github.io/photon/docs/photon/index.html)
- [Vite documentation](https://vitejs.dev/guide/)
- [React documentation](https://react.dev/)
