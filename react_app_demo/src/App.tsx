import type { JSX } from "react";
import Canvas from "./components/Canvas/Canvas";
import "./App.css";

const App = (): JSX.Element => {
	return (
		<div className="app">
			<header className="app__header">
				<nav className="app__nav">
					<a
						className="app__link"
						href="https://silvia-odwyer.github.io/photon/docs/photon/index.html"
						target="_blank"
						rel="noreferrer"
					>
						Docs
					</a>
					<a
						className="app__link"
						href="https://github.com/silvia-odwyer/photon"
						target="_blank"
						rel="noreferrer"
					>
						GitHub
					</a>
				</nav>
				<Canvas />
			</header>
		</div>
	);
};

export default App;
