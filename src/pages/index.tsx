import Image from "next/image";
import {AiFillAlert} from "react-icons/ai";
import {AiFillAliwangwang} from "react-icons/ai";
import {IoTerminal} from "react-icons/io5";
import {BiBook} from "react-icons/bi";
import {RiTerminalBoxFill} from "react-icons/ri";
import {LuArrowDownUp} from "react-icons/lu";
import {IoSearchOutline} from "react-icons/io5";
import {CiViewTable} from "react-icons/ci";
import {CiMenuKebab} from "react-icons/ci";
import {VscKebabVertical} from "react-icons/vsc";
import TableMenuListItem from "@/api/TableMenuListItem";
import TableMenu from "@/components/table/TableMenu";

export default function Home() {
    return (
        <div className="flex flex-col flex-1 min-h-screen">

            {/*헤더*/}
            <div className="flex flex-row border-b border-zinc-800 p-3 !py-2 text-sm">
                {/*왼쪽*/}
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
                {/*오른쪽*/}
                <div className="flex flex-1 justify-end items-center pr-3 space-x-3">
                    <div
                        className="hidden md:block border text-sm border-zinc-700 hover:border-white transition-all duration-200 cursor-pointer px-3 py-1 rounded-full">
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
                {/*사이드바*/}
                <div
                    className="px-0 hover:px-2 py-1 absolute top-0 bottom-0 w-10 hover:w-40 transition-all duration-150 ease-linear z-[99] border group border-t-0 border-zinc-800 !bg-[#171717] flex flex-col flex-1 overflow-hidden">
                    <div
                        className="p-2 hover:bg-zinc-600 group cursor-pointer flex items-center relative text-sm text-zinc-50 space-x-1">
                        <div>
                            <BiBook className="h-5 w-5 text-[rgb(137,137,137)] cursor-pointer group-hover:text-white"/>
                        </div>
                        <div className="hidden group-hover:flex whitespace-nowrap">
                            SQL Editor
                        </div>
                    </div>
                    <div
                        className="p-2 hover:bg-zinc-600 group cursor-pointer flex items-center relative text-sm text-zinc-200 space-x-1">
                        <div>
                            <RiTerminalBoxFill
                                className="h-5 w-5 text-[rgb(137,137,137)] cursor-pointer group-hover:text-zinc-200"/>
                        </div>
                        <div className="hidden group-hover:flex whitespace-nowrap">
                            Table Editor
                        </div>
                    </div>
                </div>


                <div className="flex flex-grow">
                    {/*메뉴*/}
                    <div style={{flex: '29.5 1 0px'}}
                         className="flex-col ml-10  min-w-64 max-w-[32rem] border-r hidden md:flex border-zinc-800 z-10 box-content">
                        <div className="border-b border-zinc-800 min-h-12 px-6 flex items-center">
                            <h4 className="text-lg">Table Editor</h4>
                        </div>
                        {/*스키마 검색*/}
                        <div className="p-5 pb-3">
                            <button type="button"
                                    className="flex  relative bg-muted items-center cursor-pointer border hover:bg-selection border-zinc-800 rounded-md w-full h-[26px] text-xs px-2.5 py-1 transition-all duration-200 ease-out outline-none outline-0 focus-visible:outline-4 focus-visible:outline-offset-1">
                                    <span className="truncate w-full">
                                        <div className="w-full flex gap-1">
                                            <p className="text-zinc-500">schema</p>
                                            <p className="text-foreground">user</p>
                                        </div>
                                    </span>
                                <div className="">
                                    <LuArrowDownUp
                                        className="h-3 w-3 fill-transparent stroke-zinc-500 cursor-pointer"/>
                                </div>
                            </button>
                        </div>
                        {/*테이블 검색*/}
                        <div className="p-5 pt-0 pb-3">
                            <div className="relative">
                                <IoSearchOutline
                                    className="h-3 w-3 fill-transparentstroke-zinc-500 cursor-pointer absolute top-2 left-2"/>
                                <input placeholder="테이블을 검색해 주세요." type="text"
                                       className="h-[26px] cursor-pointer text-xs px-2.5 pl-7 py-1 border outline-none border-zinc-800 rounded-md w-full focus:border-zinc-700"/>
                            </div>
                        </div>
                        {/*테이블 리스트*/}
                        <div className="pt-1 flex flex-col max-h-[78vh] overflow-auto text-sm">
                            {TableMenuListItem().map((data, index) => (
                                <TableMenu name={data.name} key={index} />
                            ))}
                        </div>
                    </div>
                    {/*내용*/}
                    <div style={{flex: '70.5 1 0px'}} className="p-2 ">
                        test
                    </div>
                </div>
            </div>
        </div>

    );
}
