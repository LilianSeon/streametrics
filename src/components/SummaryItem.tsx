import { memo, MouseEventHandler, useMemo } from 'react';

// Typings
import { SummarizeValue } from '../store/slices/summarizeSlice';
import { Languages } from './Chart/src/js/Texts';

type SummaryItemProps = {
  summary: SummarizeValue;
  isLast: boolean;
  language: Languages;
};

const SummaryItem = memo(({ summary, isLast, language }: SummaryItemProps) => {

  const formattedTime = useMemo(() => new Date(summary.time).toLocaleTimeString(language, {
    hour12: language === 'en',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }), [summary.time, language]);

  const onMouseEnterHandler: MouseEventHandler<HTMLDivElement> = (event: any) => {
    event.preventDefault();
    if (summary?.tabId) chrome.tabs.sendMessage(summary.tabId, { event: "showLine", payload: { tabId: summary.tabId, time: summary.time, streamerName: summary.streamerName } });
  };

  const onMouseLeaveHandler: MouseEventHandler<HTMLDivElement> = (event: any) => {
    event.preventDefault();
    if (summary?.tabId) chrome.tabs.sendMessage(summary.tabId, { event: "hideLine", payload: { tabId: summary.tabId, time: summary.time } });
  };

  return (
    <div className="py-1" onMouseEnter={ (event) => onMouseEnterHandler(event) } onMouseLeave={ (event) => onMouseLeaveHandler(event) }>
        <div className="flex items-center space-x-2">
            <span className="text-sm font-normal text-gray-400 dark:text-gray-400">{ formattedTime }</span>
        </div>
        <p className="text-base font-normal text-gray-100">{ summary.text }</p>
        { !isLast && <hr className="h-px my-3 bg-gray-500 border-0" /> }
    </div>
  );
});

export { SummaryItem }