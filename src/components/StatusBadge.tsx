import { FC, ReactNode, useMemo } from 'react';
import { CurrentStep } from '../typings/StatusType';
import { useAppSelector } from '../store/hooks';
import { RootState } from '../store/store';
import { ThreeDots } from './ThreeDots';

type StatusBadgeProps = {
    currentStep: CurrentStep;
};

const BadgeWrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <span className="inline-flex items-center py-1 px-2 bg-gray-800 border border-gray-600 text-heading text-xs font-medium rounded-lg gap-1 w-fit shadow-lg">
        {children}
    </span>
);

// Animated text component
const AnimatedText: FC<{ text: string }> = ({ text }) => (
    <span className="text-white capitalize -translate-y-px transition-all duration-300 ease-in-out animate-fade-in">
        { text }
    </span>
);

// Icon components
const SpinnerSVG: FC = () => (
    <div className="animate-fade-in">
        <svg aria-hidden="true" role="status" className="w-3 h-3 me-1 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#8b93a2"/>
        </svg>
    </div>
);

const CheckSVG: FC = () => (
    <svg className="w-4 h-4 text-white transition-transform duration-300 ease-in-out animate-fade-in" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5"/>
    </svg>
);

const ErrorSVG: FC = () => (
    <div className="text-white transition-transform duration-300 ease-in-out animate-fade-in">
        <svg className="w-[14px] h-[14px]" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
        </svg>
    </div>
);

const AnimatedThreeDots: FC = () => (
    <div className="animate-fade-in">
        <ThreeDots />
    </div>
);

const StatusBadge: FC<StatusBadgeProps> = ({ currentStep }) => {
    const translatedText = useAppSelector((state: RootState) => state.translatedText.value);

    const currentStepText = useMemo(() => {
        return translatedText['current_step_' + currentStep]?.message || currentStep;
    }, [currentStep, translatedText]);

    const iconComponent = useMemo(() => {
        switch (currentStep) {
            case 'listening':
            case 'pending':
                return <AnimatedThreeDots />;

            case 'processing':
            case 'summarizing':
            case 'transcribing':
            case 'unknown':
                return <SpinnerSVG />;

            case 'done':
                return <CheckSVG />;

            case 'error':
                return <ErrorSVG />;

            default:
                return <SpinnerSVG />;
        }
    }, [currentStep]);

    return (
        <BadgeWrapper>
            { iconComponent }
            <AnimatedText text={currentStepText} />
        </BadgeWrapper>
    );
};

export { StatusBadge };
