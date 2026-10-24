"use client";

import dynamic from "next/dynamic";

/** WebGL only runs in the browser, so the scene is loaded client-side after first paint. */
const HeartSceneLazy = dynamic(() => import("./HeartScene"), { ssr: false, loading: () => null });

export default HeartSceneLazy;
