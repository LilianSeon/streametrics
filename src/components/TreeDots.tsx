import { FC } from "react";


const TreeDots: FC = () => {
    return (
        <div className="flex mt-2 items-center justify-start space-x-1 h-6">
            <svg className="w-2 h-2 fill-current text-gray-400 animate-bounce [animation-delay:-0.3s]" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" />
            </svg>
            <svg className="w-2 h-2 fill-current text-gray-400 animate-bounce [animation-delay:-0.15s]" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" />
            </svg>
            <svg className="w-2 h-2 fill-current text-gray-400 animate-bounce" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" />
            </svg>
        </div>
    );
};

export { TreeDots }