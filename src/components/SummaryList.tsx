import { memo } from "react";

// Typings
import { Languages } from "./Chart/src/js/Texts";
import { SummarizeValue } from "../store/slices/summarizeSlice";
import { SummaryItem } from "./SummaryItem";
import { SummaryNewStreamer } from "./SummaryNewStreamer";
import { SummaryError } from "./SummaryError";

type SummaryListProps = {
  summaries: SummarizeValue[];
  language: Languages,
  currentStreamer: string
};

const SummaryList = memo(({ summaries, language, currentStreamer }: SummaryListProps) => {

    return (
        <>
            {
                summaries[0] && summaries.map((summary, index) => {
                        if (summary?.streamerImage) {
                            return (
                                <SummaryNewStreamer key={ summary.time } summary={ summary } activePulseAnimation={ summary.streamerName === currentStreamer } />
                            )
                        } else if(summary?.type === "error") {
                            return (
                                <SummaryError key={ summary.time } isLast={ index === summaries.length - 1 } />
                            )
                        } else {
                            return (
                                <SummaryItem
                                    key={ summary.time }
                                    summary={ summary }
                                    isLast={ index === summaries.length - 1 }
                                    language={ language }
                                />
                            )
                        }
                        
                    }
                )
            }
        </>
    )
});

export { SummaryList }