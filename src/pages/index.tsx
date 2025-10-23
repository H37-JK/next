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
import {TbLayoutSidebarLeftCollapse} from "react-icons/tb";
import {MdCancel} from "react-icons/md";
import {HiX} from "react-icons/hi";
import {GoPlus} from "react-icons/go";
import {FaFilter} from "react-icons/fa";
import {CiFilter} from "react-icons/ci";
import {LuFilter} from "react-icons/lu";
import {MdFormatListBulleted} from "react-icons/md";
import {BsSend} from "react-icons/bs";
import {TbRefresh} from "react-icons/tb";
import {LuRefreshCw} from "react-icons/lu";
import {ImSpinner2} from "react-icons/im";
import {useState} from "react";
import CustomCheckBox from "@/components/checkbox/CustomCheckBox";
import {IoMdKey} from "react-icons/io";
import {MdKeyboardArrowDown} from "react-icons/md";

export default function Home() {

    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = () => {
        setIsRefreshing(true)

        setTimeout(() => {
            setIsRefreshing(false)
        }, 1500)
    }

    return (
        <div className="flex flex-col flex-1 h-screen overflow-hidden">

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


                <div className="flex flex-1 pl-10">
                    {/*메뉴*/}
                    <div style={{flex: '29.5 1 0px'}}
                         className="flex-col min-w-64 max-w-[32rem] border-r hidden md:flex border-zinc-800 z-10 box-content">
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
                                <TableMenu name={data.name} key={index}/>
                            ))}
                        </div>
                    </div>

                    {/*내용*/}
                    <div style={{flex: '70.5 1 0px'}} className="flex flex-col overflow-hidden">
                        {/*테이블 선택 리스트*/}
                        <div className="border-b border-zinc-800 min-h-10 flex">
                            {/*메뉴 접기*/}
                            <div className="border-r border-zinc-800 flex items-center px-2 hover:bg-zinc-800">
                                <TbLayoutSidebarLeftCollapse
                                    className="h-6 w-6 fill-transparent stroke-zinc-600 cursor-pointer"/>
                            </div>

                            <div className="border-r border-zinc-800 group cursor-pointer">
                                <div
                                    className="text-xs text-zinc-500 gap-2 flex items-center justify-center flex-1 h-full px-2">
                                    <div className="gap-1 cursor-pointer flex">
                                        <div><CiViewTable className="h-4 w-4 fill-gray-400 group-hover:fill-white"/>
                                        </div>
                                        <div className="group-hover:text-white">storage<span
                                            className="text-zinc-400 group-hover:text-white">.bucket</span></div>
                                    </div>
                                    <div className="invisible group-hover:visible"><HiX
                                        className="h-3 w-3 fill-zinc-300  group-hover:fill-white"/></div>
                                </div>
                            </div>

                            <div className="border-r border-zinc-800 group cursor-pointer">
                                <div
                                    className="text-xs text-zinc-500 gap-2 flex items-center justify-center flex-1 h-full px-2">
                                    <div className="gap-1 cursor-pointer flex">
                                        <div><CiViewTable className="h-4 w-4 fill-gray-400 group-hover:fill-white"/>
                                        </div>
                                        <div className="group-hover:text-white">storage<span
                                            className="text-zinc-400 group-hover:text-white">.bucket</span></div>
                                    </div>
                                    <div className="invisible group-hover:visible"><HiX
                                        className="h-3 w-3 fill-zinc-300  group-hover:fill-white"/></div>
                                </div>
                            </div>


                            <div className="border-r border-zinc-800 group cursor-pointer">
                                <div
                                    className="text-xs text-zinc-500 gap-2 flex items-center justify-center flex-1 h-full px-2">
                                    <div className="gap-1 cursor-pointer flex">
                                        <div><CiViewTable className="h-4 w-4 fill-gray-400 group-hover:fill-white"/>
                                        </div>
                                        <div className="group-hover:text-white">storage<span
                                            className="text-zinc-400 group-hover:text-white">.bucket</span></div>
                                    </div>
                                    <div className="invisible group-hover:visible"><HiX
                                        className="h-3 w-3 fill-zinc-300  group-hover:fill-white"/></div>
                                </div>
                            </div>

                            <div className="cursor-pointer flex items-center px-3 hover:bg-zinc-700">
                                <div><GoPlus className="h-4 w-4 fill-gray-400 group-hover:fill-white"/></div>
                            </div>
                        </div>
                        {/*필터*/}
                        <div
                            className="bg-[#1f1f1f] border-b border-zinc-800 min-h-8 text-sm text-zinc-500 flex items-center p-2">
                            <div className="flex gap-1">
                                <div className="flex items-center gap-1 px-2 text-gray-300 text-xs cursor-pointer">
                                    <div><CiFilter className="h-3.5 w-3.5 fill-gray-300  group-hover:fill-white"/></div>
                                    <div>필터</div>
                                </div>
                                <div className="flex items-center gap-1 px-2 text-gray-300 text-xs cursor-pointer">
                                    <div><MdFormatListBulleted
                                        className="h-3.5 w-3.5 fill-gray-300  group-hover:fill-white"/></div>
                                    <div>정렬</div>
                                </div>
                            </div>

                            {/*실시간, 새로 고침*/}
                            <div className="flex flex-1 justify-end gap-2">
                                <div
                                    className="border border-zinc-800 rounded-md text-zinc-200 flex items-center px-3 py-1 text-xs gap-1.5 cursor-pointer">
                                    <div className="text-zinc-500">
                                        <BsSend className="h-3 w-3 fill-zinc-500  group-hover:fill-white"/>
                                    </div>
                                    <div>실시간 기능</div>
                                </div>
                                <div onClick={handleRefresh}
                                     className="border border-zinc-800 flex items-center justify-center rounded px-2 py-2 cursor-pointer">
                                    {!isRefreshing ?
                                        <LuRefreshCw className="h-3.5 w-3.5"/> :
                                        <ImSpinner2 className="h-3.5 w-3.5 animate-spin"/>}
                                </div>
                            </div>
                        </div>

                        {/*컬럼, 컬럼 값*/}
                        <div className="flex flex-1 min-h-0 overflow-auto min-w-0">
                            <div className="flex flex-col">
                                <div
                                    className="bg-[#1f1f1f] border-b border-zinc-800 min-h-10 flex text-white">
                                    <div className="p-2 px-3 border-r border-zinc-800 flex items-center min-h-full">
                                                                                 <CustomCheckBox id="c"/>
                                                                             </div>
                                                                         </div>
                                                                         <div className="border-b border-zinc-800 min-h-9 text-white flex">                                    <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                        <CustomCheckBox id="cv-1"/>
                                    </div>
                                </div>
                <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                    <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                        <CustomCheckBox id="cv-1"/>
                                    </div>
                                </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>      <div className="border-b border-zinc-800 min-h-9 text-white flex">
                                <div className="p-2 px-3 border-r border-zinc-800 flex items-center">
                                    <CustomCheckBox id="cv-1"/>
                                </div>
                            </div>
                            </div>
                            <div className="flex flex-col">
                                <div
                                    className="flex items-center min-h-10 bg-[#1f1f1f] p-2 px-3 border-r text-xs gap-2 border-zinc-800 border-b min-w-64">
                                    <IoMdKey className="h-3.5 w-3.5 fill-green-500"/>
                                    <div>email</div>
                                    <div className="text-zinc-500">varchar</div>
                                    <div className="flex flex-1 justify-end">
                                        <div className="cursor-pointer">
                                            <MdKeyboardArrowDown className="h-3.5 w-3.5 fill-zinc-700"/>
                                        </div>
                                    </div>
                                </div>
                                <div tabIndex={0} className="border-b border-zinc-800 min-h-9 text-white flex p-2 border-r items-center text-xs min-w-64 focus:ring-1 focus:ring-sky-400 cursor-pointer">
                                        these990703@gmail.com
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div
                                    className="flex items-center min-h-10 bg-[#1f1f1f] p-2 px-3 border-r text-xs gap-2 border-zinc-800 border-b min-w-64">
                                    <IoMdKey className="h-3.5 w-3.5 fill-green-500"/>
                                    <div>email</div>
                                    <div className="text-zinc-500">varchar</div>
                                    <div className="flex flex-1 justify-end">
                                        <div className="cursor-pointer">
                                            <MdKeyboardArrowDown className="h-3.5 w-3.5 fill-zinc-700"/>
                                        </div>
                                    </div>
                                </div>
                                <div tabIndex={0} className="border-b border-zinc-800 min-h-9 text-white flex p-2 border-r items-center text-xs min-w-64 focus:ring-1 focus:ring-sky-400 cursor-pointer">
                                    these990703@gmail.com
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div
                                    className="flex items-center min-h-10 bg-[#1f1f1f] p-2 px-3 border-r text-xs gap-2 border-zinc-800 border-b min-w-64">
                                    <IoMdKey className="h-3.5 w-3.5 fill-green-500"/>
                                    <div>email</div>
                                    <div className="text-zinc-500">varchar</div>
                                    <div className="flex flex-1 justify-end">
                                        <div className="cursor-pointer">
                                            <MdKeyboardArrowDown className="h-3.5 w-3.5 fill-zinc-700"/>
                                        </div>
                                    </div>
                                </div>
                                <div tabIndex={0} className="border-b border-zinc-800 min-h-9 text-white flex p-2 border-r items-center text-xs min-w-64 focus:ring-1 focus:ring-sky-400 cursor-pointer">
                                    these990703@gmail.com
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div
                                    className="flex items-center min-h-10 bg-[#1f1f1f] p-2 px-3 border-r text-xs gap-2 border-zinc-800 border-b min-w-64">
                                    <IoMdKey className="h-3.5 w-3.5 fill-green-500"/>
                                    <div>email</div>
                                    <div className="text-zinc-500">varchar</div>
                                    <div className="flex flex-1 justify-end">
                                        <div className="cursor-pointer">
                                            <MdKeyboardArrowDown className="h-3.5 w-3.5 fill-zinc-700"/>
                                        </div>
                                    </div>
                                </div>
                                <div tabIndex={0} className="border-b border-zinc-800 min-h-9 text-white flex p-2 border-r items-center text-xs min-w-64 focus:ring-1 focus:ring-sky-400 cursor-pointer">
                                    these990703@gmail.com
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div
                                    className="flex items-center min-h-10 bg-[#1f1f1f] p-2 px-3 border-r text-xs gap-2 border-zinc-800 border-b min-w-64">
                                    <IoMdKey className="h-3.5 w-3.5 fill-green-500"/>
                                    <div>email</div>
                                    <div className="text-zinc-500">varchar</div>
                                    <div className="flex flex-1 justify-end">
                                        <div className="cursor-pointer">
                                            <MdKeyboardArrowDown className="h-3.5 w-3.5 fill-zinc-700"/>
                                        </div>
                                    </div>
                                </div>
                                <div tabIndex={0} className="border-b border-zinc-800 min-h-9 text-white flex p-2 border-r items-center text-xs min-w-64 focus:ring-1 focus:ring-sky-400 cursor-pointer">
                                    these990703@gmail.com
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div
                                    className="flex items-center min-h-10 bg-[#1f1f1f] p-2 px-3 border-r text-xs gap-2 border-zinc-800 border-b min-w-64">
                                    <IoMdKey className="h-3.5 w-3.5 fill-green-500"/>
                                    <div>email</div>
                                    <div className="text-zinc-500">varchar</div>
                                    <div className="flex flex-1 justify-end">
                                        <div className="cursor-pointer">
                                            <MdKeyboardArrowDown className="h-3.5 w-3.5 fill-zinc-700"/>
                                        </div>
                                    </div>
                                </div>
                                <div tabIndex={0} className="border-b border-zinc-800 min-h-9 text-white flex p-2 border-r items-center text-xs min-w-64 focus:ring-1 focus:ring-sky-400 cursor-pointer">
                                    these990703@gmail.com
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div
                                    className="flex items-center min-h-10 bg-[#1f1f1f] p-2 px-3 border-r text-xs gap-2 border-zinc-800 border-b min-w-64">
                                    <div>name</div>
                                    <div className="text-zinc-500">varchar</div>
                                    <div className="flex flex-1 justify-end">
                                        <div className="cursor-pointer">
                                            <MdKeyboardArrowDown className="h-3.5 w-3.5 fill-zinc-700"/>
                                        </div>
                                    </div>
                                </div>
                                <div tabIndex={0} className="border-b border-zinc-800 min-h-9 text-white flex p-2 border-r items-center text-xs min-w-64 focus:ring-1 focus:ring-sky-400 cursor-pointer">
                                    호종규
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div
                                    className="flex items-center min-h-10 justify-center bg-[#1f1f1f] p-2 px-3 border-r text-xs gap-2 border-zinc-800 border-b min-w-48 cursor-pointer hover:bg-zinc-700">
                                    <GoPlus className="h-4 w-4 fill-gray-400 group-hover:fill-white"/>
                                </div>
                                <div tabIndex={0} className="border-b border-zinc-800 min-h-9 text-white flex p-2 border-r items-center text-xs min-w-48 focus:ring-1 focus:ring-sky-400 cursor-pointer">
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

    );
}
