import { memo, useMemo } from 'react';

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

  return (
    <div className="py-1">
        <div className="flex items-center space-x-2">
            <span className="text-sm font-normal text-gray-400 dark:text-gray-400">{ formattedTime }</span>
        </div>
        <p className="text-base font-normal text-gray-100">{ summary.text }</p>
        { !isLast && <hr className="h-px my-3 bg-gray-500 border-0" /> }
    </div>
  );
});

export { SummaryItem }