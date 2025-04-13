import { FC, MouseEventHandler } from "react";

export interface NotFoundTextValueI18n {
    not_found_message: string,
    not_found_button: string
}

type NotFoundProps = {
    notFoundTexts: NotFoundTextValueI18n
}

const NotFound: FC<NotFoundProps> = ({ notFoundTexts }: NotFoundProps) => {

    const onClickLink: MouseEventHandler<HTMLAnchorElement> = () => {
        chrome.tabs.create({ active: true, url: "https://www.twitch.tv/" });
    };

    return(
        <p>
            <div className='flex flex-row justify-center items-center pt-10 pb-2 text-base text-gray-200'>
                <p className="flex justify-center items-center">{ notFoundTexts.not_found_message }</p>
            </div>
            <div className="flex flex-row justify-center items-center">
                <a href="#" onClick={ onClickLink } className="group inline-flex items-center justify-center shadow-lg hover:shadow px-3 py-2 text-base font-medium rounded-lg text-gray-100 bg-gray-600 hover:bg-gray-700 :hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" fill="#a970ff" viewBox="0 0 16 16">
                        <rect y="0.5" x="4" width="10" height="10" fill="#ffffff" rx="3"></rect>
                        <path d="M3.857 0 1 2.857v10.286h3.429V16l2.857-2.857H9.57L14.714 8V0zm9.714 7.429-2.285 2.285H9l-2 2v-2H4.429V1.143h9.142z"/>
                        <path d="M11.857 3.143h-1.143V6.57h1.143zm-3.143 0H7.571V6.57h1.143z"/>
                    </svg>
                    <span className="ms-2 w-full">{ notFoundTexts.not_found_button } <span className="font-medium group-hover:text-blue-500 hover:underline">Twitch.tv</span></span>
                    <svg className="w-4 h-4 ms-1 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                </a>
            </div>
        </p>
    );
};

export { NotFound }