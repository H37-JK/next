import Image from "next/image";
import {Geist, Geist_Mono} from "next/font/google";
import { AiFillAliwangwang } from "react-icons/ai";



export default function Home() {
    return (
        <div className="flex flex-row border-b border-zinc-800 p-3 text-sm">
            <div className="flex items-center space-x-3">
                <Image
                    className="dark:invert"
                    src="/vercel.svg"
                    alt="Vercel logomark"
                    width={16}
                    height={16}
                />
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" className="text-zinc-500" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" shapeRendering="geometricPrecision" data-sentry-element="svg" data-sentry-source-file="LayoutHeader.tsx"><path d="M16 3.549L7.12 20.600" data-sentry-element="path" data-sentry-source-file="LayoutHeader.tsx"></path></svg>
                <div>these990703@gmail.com</div>
            </div>
            <div className="flex flex-1 justify-end pr-3">
                <button type="button" className="w-8 h-8 bg-white rounded-full border-zinc-500 text-black cursor-pointer">A</button>
            </div>
        </div>
    );
}
