import Image from "next/image";
import {AiFillAlert} from "react-icons/ai";
import {AiFillAliwangwang} from "react-icons/ai";
import {IoTerminal} from "react-icons/io5";
import { BiBook } from "react-icons/bi";
import { RiTerminalBoxFill } from "react-icons/ri";

export default function Home() {
    return (
        <div className="flex flex-col flex-1 min-h-screen">
            <div className="flex flex-row border-b border-zinc-800 p-3 !py-2 text-sm">
                <div className="flex items-center space-x-3">
                    <Image
                        className="dark:invert"
                        src="/vercel.svg"
                        alt="Vercel logomark"
                        width={16}
                        height={16}
                    />
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" className="text-zinc-500"
                         strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"
                         shapeRendering="geometricPrecision" data-sentry-element="svg"
                         data-sentry-source-file="LayoutHeader.tsx">
                        <path d="M16 3.549L7.12 20.600" data-sentry-element="path"
                              data-sentry-source-file="LayoutHeader.tsx"></path>
                    </svg>
                    <div>these990703@gmail.com</div>
                </div>
                <div className="flex flex-1 justify-end items-center pr-3 space-x-3">
                    <div className="border text-sm border-zinc-700 hover:border-white transition-all duration-200 cursor-pointer px-3 py-1 rounded-full">
                        Feedback
                    </div>
                    <div className="flex overflow-hidden rounded-full border border-zinc-700">
                        <button
                            className="group px-3 pr-2 items-center justify-center py-1 transition-colors cursor-pointer hover:bg-zinc-700">
                            <AiFillAlert className="h-5 w-5 text-zinc-300 transition-colors group-hover:text-white"/>
                        </button>
                        <button
                            className="group px-3 items-center justify-center pl-2 border-zinc-700 py-1 transition-colors cursor-pointer hover:bg-zinc-700">
                            <AiFillAliwangwang
                                className="h-5 w-5 text-zinc-300 transition-colors group-hover:text-white"/>
                        </button>
                        <button
                            className="group px-3 items-center justify-center pl-2 border-zinc-700 py-1 transition-colors cursor-pointer hover:bg-zinc-700">
                            <IoTerminal className="h-5 w-5 text-zinc-300 transition-colors group-hover:text-white"/>
                        </button>
                    </div>
                    <button type="button"
                            className="w-5 h-5 bg-zinc-300 rounded-full border-zinc-500 text-black cursor-pointer">A
                    </button>
                </div>
            </div>
            <div className="relative flex flex-1">
                <div
                    className="absolute top-0 bottom-0 w-10 hover:w-40 transition-all duration-150 ease-linear z-[99] border group border-t-0 border-zinc-800 !bg-[#171717] flex flex-col flex-1 overflow-hidden">
                    <div className="p-2 hover:bg-zinc-600 group cursor-pointer flex items-center relative text-sm text-zinc-50 space-x-1">
                       <div>
                           <BiBook className="h-5 w-5 text-[rgb(137,137,137)] cursor-pointer group-hover:text-white"/>
                       </div>
                        <div className="hidden group-hover:flex whitespace-nowrap">
                            SQL Editor
                        </div>
                    </div>
                    <div className="p-2 hover:bg-zinc-600 group cursor-pointer flex items-center relative text-sm text-zinc-200 space-x-1">
                        <div>
                            <RiTerminalBoxFill  className="h-5 w-5 text-[rgb(137,137,137)] cursor-pointer group-hover:text-zinc-200"/>
                        </div>
                        <div className="hidden group-hover:flex whitespace-nowrap">
                            Table Editor
                        </div>
                    </div>
                </div>
                <div className="flex flex-1 ml-10 p-2 z-10 relative min-w-64 max-w-[32rem] border-r border-zinc-800">
                    <div>ab</div>
                </div>
            </div>
        </div>

    );
}
