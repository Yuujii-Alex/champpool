"use client";

import type { ChangeEvent, FormEvent } from "react";

type SearchValues = {
	region: string;
	gameName: string;
	tagLine: string;
};

type NavbarProps = {
	pending: boolean;
	regionOptions: string[];
	values: SearchValues;
	onChange: (field: keyof SearchValues, value: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function SearchIcon() {
	return (
		<svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
			<path
				d="M21 21L16.65 16.65M18 10.5A7.5 7.5 0 1 1 3 10.5a7.5 7.5 0 0 1 15 0Z"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function BrandMark() {
	return (
		<div className="flex size-10 items-center justify-center rounded-md bg-[linear-gradient(180deg,#d9b15c_0%,#b6882f_100%)] text-[#06111f] shadow-[0_10px_30px_rgba(214,170,76,0.2)]">
			<svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
				<path d="M7 4L4 7l4 4-1.5 1.5L2.5 8.5 1 10l4.5 4.5L4 16l-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M17 4l3 3-4 4 1.5 1.5 4-4L23 10l-4.5 4.5L20 16l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		</div>
	);
}

export default function Navbar({ pending, regionOptions, values, onChange, onSubmit }: NavbarProps) {
	function handleFieldChange(field: keyof SearchValues) {
		return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			onChange(field, event.target.value);
		};
	}

	return (
		<header className="sticky top-0 z-30 w-full border-b border-white/6 bg-[#0c0d10f2] px-4 backdrop-blur md:px-8 xl:px-10">
			<div className="flex w-full flex-col gap-4 py-4 lg:flex-row lg:items-center lg:gap-6">
				<div className="flex items-center gap-3">
					<BrandMark />
					<div>
						<p className="text-xl font-semibold tracking-tight text-white">ChampPool.gg</p>
						<p className="text-sm text-slate-500">Sharper pools from your recent ranked play.</p>
					</div>
				</div>

				<form className="grid gap-3 lg:flex-1 lg:grid-cols-[110px_minmax(0,1fr)_140px]" onSubmit={onSubmit}>
					<label className="sr-only" htmlFor="region">Region</label>
					<select
						id="region"
						className="h-11 rounded-md border border-white/8 bg-[#171a1f] px-3 text-sm font-medium text-slate-100 outline-none transition focus:border-[#d6aa4c]"
						disabled={pending}
						onChange={handleFieldChange("region")}
						value={values.region}
					>
						{regionOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>

					<div className="grid gap-3 sm:grid-cols-2">
						<label className="sr-only" htmlFor="gameName">Game name</label>
						<input
							id="gameName"
							className="h-11 rounded-md border border-white/8 bg-[#171a1f] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-[#d6aa4c]"
							disabled={pending}
							onChange={handleFieldChange("gameName")}
							placeholder="Game name"
							value={values.gameName}
						/>

						<label className="sr-only" htmlFor="tagLine">Tag line</label>
						<input
							id="tagLine"
							className="h-11 rounded-md border border-white/8 bg-[#171a1f] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-[#d6aa4c]"
							disabled={pending}
							onChange={handleFieldChange("tagLine")}
							placeholder="Tag line"
							value={values.tagLine}
						/>
					</div>

					<button
						className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[linear-gradient(180deg,#d9b15c_0%,#b6882f_100%)] px-4 text-sm font-semibold text-[#071220] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
						disabled={pending || !values.gameName.trim() || !values.tagLine.trim()}
						type="submit"
					>
						<SearchIcon />
						{pending ? "Analyzing..." : "Analyze"}
					</button>
				</form>
			</div>
		</header>
	);
}
