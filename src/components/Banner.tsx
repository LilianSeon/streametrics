import { FC, useEffect, useState } from "react";

type BannerProps = {
    title: string,
    message: string,
};

const BANNER_DISMISSED_KEY = 'bannerDismissed';
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

const Banner: FC<BannerProps> = ({ title, message }) => {
    const [ isVisible, setIsVisible ] = useState(false);
    const [ isFadingOut, setIsFadingOut ] = useState(false);

    useEffect(() => {
        // Check if banner was dismissed.
        chrome.storage.local.get([BANNER_DISMISSED_KEY], (result) => {
            const dismissedTime = result[BANNER_DISMISSED_KEY];
            const now = Date.now();

            // Show banner if never dismissed or if two days have passed.
            if (!dismissedTime || (now - dismissedTime) > TWO_DAYS_MS) {
                setIsVisible(true);
            }
        });

        const timer = setTimeout(() => {
            // Save dismissal time when auto-hiding after 30 seconds.
            chrome.storage.local.set({ [BANNER_DISMISSED_KEY]: Date.now() });

            setIsFadingOut(true);
            setTimeout(() => setIsVisible(false), 300);
        }, 30000); // Fade out after 30 seconds.

        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        // Save dismissal time to storage.
        chrome.storage.local.set({ [BANNER_DISMISSED_KEY]: Date.now() });

        setIsFadingOut(true);
        setTimeout(() => setIsVisible(false), 300);
    };

    if (!isVisible) return null;

    return (
        <div
            onClick={ handleClick }
            className={`w-auto inline-flex items-center p-1 pe-2 text-sm text-[#51a2ff] rounded-full bg-[#162456] border border-[#1c398e] cursor-pointer hover:bg-[#1c2d6b] transition-all duration-300 ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}
            role="alert"
        >
            <span className="bg-[#1c398e] text-[#51a2ff] py-0.5 px-2 rounded-full">{ title }</span>
            <div className="ms-2 text-sm">{ message }</div>
            <svg className="w-4 h-4 ms-1 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7"/></svg>
        </div>
    );
};

export { Banner };