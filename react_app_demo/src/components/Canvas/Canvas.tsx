import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import demoImageUrl from "./daisies.jpg";
import "./Canvas.css";

type PhotonModule = typeof import("@silvia-odwyer/photon");
type PhotonImage = ReturnType<PhotonModule["open_image"]>;
type Channel = 0 | 1 | 2;
type Status = "loading" | "ready" | "error";

type WasmAssetModule = { default: string };

const loadPhoton = async (): Promise<PhotonModule> => {
	const [photonModule, wasmModule] = await Promise.all([
		import("@silvia-odwyer/photon"),
		import(
			"@silvia-odwyer/photon/photon_rs_bg.wasm?url"
		) as Promise<WasmAssetModule>,
	]);

	const init = photonModule.default as
		| ((moduleOrPath?: unknown) => Promise<unknown>)
		| undefined;

	if (typeof init === "function") {
		await init(wasmModule.default);
	}

	return photonModule;
};

const loadDemoImage = async (): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.src = demoImageUrl;
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error("Unable to load demo image asset."));
	});

const Canvas = (): JSX.Element => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const photonRef = useRef<PhotonModule | null>(null);
	const sourceImageRef = useRef<HTMLImageElement | null>(null);
	const [status, setStatus] = useState<Status>("loading");
	const [message, setMessage] = useState<string>("Loading Photon WebAssembly…");

	const handleError = useCallback((err: unknown) => {
		console.error(err);
		setStatus("error");
		setMessage(err instanceof Error ? err.message : "Unexpected error");
	}, []);

	const drawOriginal = useCallback((nextImage?: HTMLImageElement) => {
		const canvas = canvasRef.current;
		const image = nextImage ?? sourceImageRef.current;
		if (!canvas) {
			throw new Error("Canvas element is unavailable.");
		}
		if (!image) {
			throw new Error("Image asset has not loaded yet.");
		}
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Unable to acquire 2D rendering context.");
		}

		const width = image.naturalWidth || image.width;
		const height = image.naturalHeight || image.height;

		canvas.width = width;
		canvas.height = height;
		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(image, 0, 0, width, height);
	}, []);

	const ensureContext = useCallback(() => {
		const canvas = canvasRef.current;
		const photon = photonRef.current;
		const image = sourceImageRef.current;

		if (!canvas || !photon || !image) {
			throw new Error("Photon is still initialising. Please wait a moment.");
		}

		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Unable to acquire 2D rendering context.");
		}

		return { canvas, ctx, image, photon };
	}, []);

	const applyChannelAdjustment = useCallback(
		(channel: Channel, delta: number) => {
			try {
				const { canvas, ctx, image, photon } = ensureContext();
				ctx.drawImage(image, 0, 0);
				const photonImage: PhotonImage = photon.open_image(canvas, ctx);
				photon.alter_channel(photonImage, channel, delta);
				photon.putImageData(canvas, ctx, photonImage);
				setStatus("ready");
				setMessage(`Adjusted channel ${channel + 1}`);
			} catch (error) {
				handleError(error);
			}
		},
		[ensureContext, handleError],
	);

	const runEffectPipeline = useCallback(() => {
		try {
			const { canvas, ctx, image, photon } = ensureContext();
			ctx.drawImage(image, 0, 0);
			const photonImage: PhotonImage = photon.open_image(canvas, ctx);
			console.time("photon-effect-pipeline");
			photon.alter_channel(photonImage, 2, 70);
			photon.grayscale(photonImage);
			console.timeEnd("photon-effect-pipeline");
			photon.putImageData(canvas, ctx, photonImage);
			setStatus("ready");
			setMessage("Applied channel boost + grayscale");
		} catch (error) {
			handleError(error);
		}
	}, [ensureContext, handleError]);

	const resetImage = useCallback(() => {
		try {
			drawOriginal();
			setStatus("ready");
			setMessage("Original image restored");
		} catch (error) {
			handleError(error);
		}
	}, [drawOriginal, handleError]);

	useEffect(() => {
		let cancelled = false;

		const bootstrap = async () => {
			try {
				setStatus("loading");
				setMessage("Loading Photon WebAssembly…");
				const [photonModule, demoImage] = await Promise.all([
					loadPhoton(),
					loadDemoImage(),
				]);
				if (cancelled) {
					return;
				}
				photonRef.current = photonModule;
				sourceImageRef.current = demoImage;
				drawOriginal(demoImage);
				setStatus("ready");
				setMessage("Photon ready");
			} catch (error) {
				if (!cancelled) {
					handleError(error);
				}
			}
		};

		bootstrap();

		return () => {
			cancelled = true;
		};
	}, [drawOriginal, handleError]);

	return (
		<div className="canvas-shell">
			<aside className="canvas-sidebar">
				<div className="canvas-sidebar__header">
					<span className="canvas-sidebar__logo">Photon</span>
					<span className="canvas-sidebar__subtitle">React + WASM</span>
				</div>

				<section className="canvas-sidebar__section">
					<h4 className="canvas-sidebar__title">Channels</h4>
					<button
						type="button"
						onClick={() => applyChannelAdjustment(0, 60)}
						className="canvas-sidebar__button"
						disabled={status !== "ready"}
					>
						Increase Red Channel
					</button>
					<button
						type="button"
						onClick={() => applyChannelAdjustment(1, 60)}
						className="canvas-sidebar__button"
						disabled={status !== "ready"}
					>
						Increase Green Channel
					</button>
					<button
						type="button"
						onClick={() => applyChannelAdjustment(2, 60)}
						className="canvas-sidebar__button"
						disabled={status !== "ready"}
					>
						Increase Blue Channel
					</button>
				</section>

				<section className="canvas-sidebar__section">
					<h4 className="canvas-sidebar__title">Pipeline</h4>
					<button
						type="button"
						onClick={runEffectPipeline}
						className="canvas-sidebar__button"
						disabled={status !== "ready"}
					>
						Boost Blue + Grayscale
					</button>
				</section>

				<button
					type="button"
					onClick={resetImage}
					className="canvas-sidebar__button canvas-sidebar__button--secondary"
					disabled={status === "loading"}
				>
					Reset Image
				</button>
			</aside>

			<main className="canvas-stage">
				<header className="canvas-stage__header">
					<h2 className="canvas-stage__title">Image</h2>
					<span className={`canvas-status canvas-status--${status}`}>
						{message}
					</span>
				</header>
				<canvas ref={canvasRef} className="canvas-stage__element" />
			</main>
		</div>
	);
};

export default Canvas;
