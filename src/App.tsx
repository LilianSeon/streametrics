import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './background';

// Store
import { useDispatch } from 'react-redux';
import { RootState } from './store/store'
import { useAppSelector } from './store/hooks';
import { addSummary, clearSummariesError } from './store/slices/summarizeSlice';
import { updateIsSummarizing } from './store/slices/isSummarizingSlice';
import { setStreamerList } from './store/slices/streamerListSlice';
import { updateCurrentStep } from './store/slices/currentStepSlice';

// Components
import { Navbar } from './components/Navbar';
import { Table } from './components/Table';
import { Footer } from './components/Footer';
import { Summarize } from './components/Summarize';

// Typing
import { StorageStreamerListType } from './typings/StorageType';
import { Languages } from './components/Chart/src/js/Texts';
import { AudioBarsValue, updateAudioBars } from './store/slices/audioBarsSlice';
import { updateSidePanelOpenedFrom } from './store/slices/sidePanelOpenedFromSlice';
import { updatePulse } from './store/slices/pulseSlice';
import { loadTranslatedText } from './loader/fileLoader';
import { addTranslatedText, TranslatedText } from './store/slices/translatedTextSlice';
import { updateCaptureAllowed } from './store/slices/captureAllowedSlice';
import { CurrentStep } from './typings/StatusType';

// Rigth after sidePanel loaded
chrome.runtime.sendMessage({ action: "isSidePanelOpened", payload: true });

// before closing
window.addEventListener("beforeunload", () => {
  chrome.runtime.sendMessage({ action: "isSidePanelOpened", payload: false });
});

const App: FC = () => {

  const dispatch = useDispatch();
  const summaries = useAppSelector((state: RootState) => state.summarize.value);
  const sidePanelOpenedFrom = useAppSelector((state: RootState) => state.sidePanelOpenedFrom.value) as chrome.tabs.Tab;
  const streamerList = useAppSelector((state: RootState) => state.streamerList.value);
  const captureAllowed = useAppSelector((state: RootState) => state.captureAllowed.value);
  
  const sidePanelOpenedFromTabId = useMemo(() => sidePanelOpenedFrom?.id, [sidePanelOpenedFrom]);
  const sidePanelOpenedFromWindowId = useMemo(() => sidePanelOpenedFrom?.windowId, [sidePanelOpenedFrom]);

  const [ isDisplayListLang, setIsDisplayListLang ] = useState(false);
  const [ language, setLanguage ] = useState<Languages | undefined>();

  const currentStreamerNameRef = useRef<string | undefined>();

  const currentStreamerName = useMemo(() => streamerList.find(({ tabId }) => tabId === sidePanelOpenedFromTabId)?.streamerName, [streamerList, sidePanelOpenedFromTabId]);
  const currentStreamerImage = useMemo(() => streamerList.find(({ tabId }) => tabId === sidePanelOpenedFromTabId)?.streamerImage, [streamerList, sidePanelOpenedFromTabId]);


  useEffect(() => {
    if (captureAllowed === false) {
      dispatch(addSummary({ text: "", type: "error", time: new Date().getTime(), streamerName: '', streamerImage: '' }));
    } else if (captureAllowed) {
      dispatch(clearSummariesError());
    }
  }, [captureAllowed]);

  useEffect(() => {
    currentStreamerNameRef.current = currentStreamerName;
  }, [currentStreamerName]);

  useEffect(() => {
    if (currentStreamerName && currentStreamerImage && sidePanelOpenedFromTabId) {
      const summarizeValue = { text: '', time: new Date().getTime(), streamerName: currentStreamerName, streamerImage: currentStreamerImage }
      dispatch(addSummary(summarizeValue));
    }
  }, [currentStreamerName, currentStreamerImage]);

  const onClickBody: React.MouseEventHandler<HTMLDivElement> = () => {
    if (isDisplayListLang) setIsDisplayListLang(!isDisplayListLang)
  };

  const summarizeReady = useCallback(({ summary, time, streamerName, tabId }: { summary: string, time: string, streamerName: string, tabId: number }, currentStreamerName: string) => {
    if (streamerName === currentStreamerName) dispatch(addSummary({ text: summary, time: parseInt(time), streamerName, tabId: tabId }));
  }, []);

  const drawAudioBars = useCallback(({ bars, pulse }: { bars: AudioBarsValue[], pulse: number }) => {
    if (bars) dispatch(updateAudioBars(bars));
    if (pulse) dispatch(updatePulse(pulse));
  }, []);

  const setCurrentStep = useCallback((step: CurrentStep) => {
    if (step) {
      dispatch(updateCurrentStep(step));
      if (step === 'done') {
        setTimeout(() => {
          dispatch(updateCurrentStep('listening'));
        }, 2000);
      }
    };
  }, [])

  useEffect(() => {

    const port = chrome.runtime.connect({ name: "sidepanel" });

    chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {

      if (message.action === "summarizeReady" && currentStreamerNameRef.current) {
        summarizeReady(message.payload, currentStreamerNameRef.current);
      }

      if (message.action === "drawAudioBars") {
        drawAudioBars(message.payload);
      }

      if (
        (message.action === 'processingProgress' ||
        message.action === "summarizeReady" ||
        message.action === "summarizeError") &&
        message.payload?.currentStep as CurrentStep
      ) {
        setCurrentStep(message.payload.currentStep);
      }
    });

    chrome.storage.onChanged.addListener(({ streamersList, language, sidePanelOpenedFrom, isSummarizing, captureAllowed }) => {
      if (streamersList?.newValue) {
        dispatch(setStreamerList(streamersList.newValue as StorageStreamerListType[]));
      }

      if (language?.newValue) {
        setLanguage(language.newValue);
        loadTranslatedText(language.newValue).then((translatedText) => {
          dispatch(addTranslatedText(translatedText));
        });
        chrome.runtime.sendMessage({
            action: 'updateMetadata',
            payload: {
                language: language.newValue
            }
        });
      }

      if (sidePanelOpenedFrom?.newValue) {
        dispatch(updateSidePanelOpenedFrom(sidePanelOpenedFrom.newValue));
      }

      if (typeof isSummarizing?.newValue != 'undefined') {
        dispatch(updateIsSummarizing(isSummarizing.newValue));
      }

      if (captureAllowed?.newValue === true || captureAllowed?.newValue === false) {
        dispatch(updateCaptureAllowed(captureAllowed.newValue as boolean));
      }
    });

    const getStorage = async (keys: string | string[]) => {
      try {
        const { streamersList } = await chrome.storage.local.get(keys);
        const { language } = await chrome.storage.local.get('language');
        const { isSummarizing } = await chrome.storage.local.get('isSummarizing');
        const { captureAllowed } = await chrome.storage.local.get('captureAllowed');
        const translatedText: TranslatedText = await loadTranslatedText(language);
        dispatch(updateCaptureAllowed(captureAllowed as boolean));
        dispatch(updateIsSummarizing(isSummarizing));
        dispatch(addTranslatedText(translatedText));
        dispatch(setStreamerList(streamersList ?? []));
        setLanguage(language);

        return streamersList ?? [];
      } catch (error) {
        console.error("Error fetching local storage:", error);
        return [];
      }
    };

    const setStorage = async (value: StorageStreamerListType[]) => {
      try {
       await chrome.storage.local.set({ streamersList: value });
      } catch (error) {
        console.error("Error setting local storage:", error);
      }
    };

    const allStreamerTabId: number[] = [];
    let checkStatusNoResponse: number = 0;

    getStorage('streamersList').then(async (streamersList: StorageStreamerListType[]) => {
      
      let nbTab: number = 0;

      return new Promise<StorageStreamerListType[]>((resolve) => {
        streamersList?.forEach((streamer: StorageStreamerListType) => {
          chrome.tabs.sendMessage(streamer.tabId, { event: "checkStatus" }).then((response) => {
            nbTab++;
            if (typeof response === 'undefined' || chrome.runtime?.lastError) { // Script didn't load on this tab.
                checkStatusNoResponse++;
            } else if(response) {
              allStreamerTabId.push(response);
            }

            if (nbTab + checkStatusNoResponse === streamersList.length) resolve(streamersList);
          }).catch((_error: string) => {
            checkStatusNoResponse++;
            if (checkStatusNoResponse + allStreamerTabId.length === streamersList.length) resolve(streamersList);
          });
        });
      })
      
    }).then(async (streamersList: StorageStreamerListType[]) => {
        const filteredStreamerList = streamersList.filter(({ tabId }: StorageStreamerListType) => allStreamerTabId.includes(tabId));
        setStorage(filteredStreamerList);

        const { sidePanelOpenedFrom } = await chrome.storage.local.get('sidePanelOpenedFrom');
        dispatch(updateSidePanelOpenedFrom(sidePanelOpenedFrom));

        if (checkStatusNoResponse === streamersList.length) setStorage([]); // If only get error response clear streamerlist
    });

    return () => {
      chrome.runtime.sendMessage({ action: "isSidePanelOpened", payload: false });
      port.disconnect();
    }

  }, []);

  return (
    <div onClick={ onClickBody } style={{ height: '100%'}} className='flex flex-col bg-gray-900'>
      <Navbar isDisplayListLang={ isDisplayListLang } setIsDisplayListLang={ setIsDisplayListLang } />
      <Table streamersList={ streamerList } language={ language } />
      <Summarize summaries={ summaries } streamerName={ currentStreamerName } tabId={ sidePanelOpenedFromTabId } windowId={ sidePanelOpenedFromWindowId }/>
      <Footer />
    </div>
  )
};

export default App
