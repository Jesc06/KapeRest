import React, { useMemo } from "react";

type BlobPreset = {
	variant: string;
	opacity: number;
	scaleBase: number;
	scalePeak: number;
	scaleDip: number;
};

type BlobConfig = {
	id: string;
	variant: string;
	style: React.CSSProperties;
};

const BLOB_PRESETS: BlobPreset[] = [
	{ variant: "is-sky", opacity: 0.55, scaleBase: 1, scalePeak: 1.08, scaleDip: 0.95 },
	{ variant: "is-violet", opacity: 0.5, scaleBase: 1, scalePeak: 1.06, scaleDip: 0.94 },
	{ variant: "is-amber", opacity: 0.48, scaleBase: 1, scalePeak: 1.05, scaleDip: 0.93 },
];

const BLOB_COUNT = 18;

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

const createBlob = (index: number): BlobConfig => {
	const preset = BLOB_PRESETS[index % BLOB_PRESETS.length];
	const size = randomInRange(240, 540);
	const blur = size * randomInRange(0.28, 0.42);
	const top = randomInRange(-8, 108);
	const left = randomInRange(-10, 110);
	const duration = randomInRange(32, 58);
	const delay = randomInRange(-22, 18);
	const shiftX = randomInRange(-160, 180);
	const shiftY = randomInRange(-140, 170);
	const shiftXAlt = shiftX * randomInRange(-0.65, -0.45);
	const shiftYAlt = shiftY * randomInRange(-0.6, -0.4);

	return {
		id: `blob-${index}`,
		variant: preset.variant,
		style: {
			"--blob-size": `${size}px`,
			"--blob-top": `${top}%`,
			"--blob-left": `${left}%`,
			"--blob-blur": `${blur}px`,
			"--blob-duration": `${duration}s`,
			"--blob-delay": `${delay}s`,
			"--blob-shift-x": `${shiftX}px`,
			"--blob-shift-y": `${shiftY}px`,
			"--blob-shift-x-alt": `${shiftXAlt}px`,
			"--blob-shift-y-alt": `${shiftYAlt}px`,
			"--blob-scale-base": `${preset.scaleBase}`,
			"--blob-scale-peak": `${preset.scalePeak}`,
			"--blob-scale-dip": `${preset.scaleDip}`,
			"--blob-opacity": `${preset.opacity}`,
		} as React.CSSProperties,
	};
};

const AnimatedBackground: React.FC = () => {
	const blobs = useMemo(() => Array.from({ length: BLOB_COUNT }, (_, index) => createBlob(index)), []);

	return (
		<div aria-hidden data-force-motion="true" className="animated-bg-layer">
			<div className="bg-radial-base" />
			<div className="ambient-blob-layer">
				{blobs.map(({ id, variant, style }) => (
					<div key={id} className={`ambient-blob ${variant}`} style={style} />
				))}
			</div>
		</div>
	);
};

export default AnimatedBackground;

