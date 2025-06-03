import { memo, useMemo } from "react";

// Store
import { useAppSelector } from "../store/hooks";

// Typings
import { SummarizeValue } from "../store/slices/summarizeSlice";
import { RootState } from "../store/store";

type SummaryNewStreamerProps = {
  summary: Pick<SummarizeValue, "streamerName" | "streamerImage">,
  activePulseAnimation: boolean
};

const SummaryNewStreamer = memo(({ summary, activePulseAnimation }: SummaryNewStreamerProps) => {

    const pulse = useAppSelector((state: RootState) => state.pulse.value);

    const scale = useMemo(() => {
        const min = 1;
        const max = 1.3;
        const normalized = Math.min(Math.max(pulse / 255, 0), 1); // [0,1]
        return min + normalized * (max - min); // [1,1.2]
    }, [pulse]);

    const style = useMemo(() => {
        if (activePulseAnimation) {
            return {
                transform: `scale(${scale})`,
                boxShadow: `0 0 ${6 + (scale - 1) * 40}px rgba(255, 255, 255, 0.6)`,
            };
        } else {
            return {};
        }
    }, [scale, activePulseAnimation]);

    return (
        <div className="mx-auto mb-3 p-4 rounded-lg shadow-lg min-w-[135px] bg-gray-900 border-gray-800">
            <img className="mx-auto mb-2 rounded-full transition-[transform,box-shadow] duration-100 ease-out" style={ style } src={ summary.streamerImage } width={ 40 } height={ 40 }/>
            <h3 className="mx-auto text-base font-bold text-center text-white">{ summary.streamerName }</h3>
        </div>
    )
});

export { SummaryNewStreamer }