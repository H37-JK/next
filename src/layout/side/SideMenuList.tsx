import {BiBook} from "react-icons/bi";
import {RiTerminalBoxFill} from "react-icons/ri";
import Link from "next/link";

const SideMenuList = () => {
    return (
        <div
            className="px-0 absolute top-0 bottom-0 hover:px-2 py-1 w-10 hover:w-60 transition-all duration-150 ease-linear z-[99] border group border-t-0 border-zinc-800 !bg-[#171717] flex flex-col">
            <Link href="/">
                <div
                    className="p-2 hover:bg-zinc-600 group cursor-pointer flex items-center text-sm text-zinc-50 space-x-1">
                    <div>
                        <BiBook className="h-5 w-5 text-[rgb(137,137,137)] cursor-pointer group-hover:text-white"/>
                    </div>
                    <div className="hidden group-hover:flex whitespace-nowrap">
                        테이블 에디터
                    </div>
                </div>
            </Link>
            <Link href="/sql">
                <div
                    className="p-2 hover:bg-zinc-600 group cursor-pointer flex items-center text-sm text-zinc-200 space-x-1">
                    <div>
                        <RiTerminalBoxFill
                            className="h-5 w-5 text-[rgb(137,137,137)] cursor-pointer group-hover:text-zinc-200"/>
                    </div>
                    <div className="hidden group-hover:flex whitespace-nowrap">
                        쿼리 에디터
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default SideMenuList