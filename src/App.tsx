import { FC, useEffect, useState } from 'react';
import './background';

// Components
import { Navbar } from './components/Navbar';
import { Table } from './components/Table';

// Typing
import { StorageStreamerListType } from './typings/StorageType';
import { Languages } from './components/Chart/src/js/Texts';


const App: FC = () => {

  const [ isDisplayListLang, setIsDisplayListLang ] = useState(false);
  const [ streamerList, setStreamerList ] = useState<StorageStreamerListType[]>([]);
  const [ language, setLanguage ] = useState<Languages | undefined>();

  const onClickBody: React.MouseEventHandler<HTMLDivElement> = () => {
    if (isDisplayListLang) setIsDisplayListLang(!isDisplayListLang)
  };

  useEffect(() => {

    chrome.storage.onChanged.addListener(({ streamersList, language }) => {
      if (streamersList?.newValue) {
        setStreamerList(streamersList.newValue as StorageStreamerListType[]);
      }

      if (language?.newValue) {
        setLanguage(language.newValue);
      }
    });

    const getStorage = async (keys: string | string[]) => {
      try {
        const { streamersList } = await chrome.storage.local.get(keys);
        const { language } = await chrome.storage.local.get('language');
        setStreamerList(streamersList ?? []);
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
      
    }).then((streamersList: StorageStreamerListType[]) => {
        const filteredStreamerList = streamersList.filter(({ tabId }: StorageStreamerListType) => allStreamerTabId.includes(tabId));
        setStorage(filteredStreamerList);

        if (checkStatusNoResponse === streamersList.length) setStorage([]); // If only get error response clear streamerlist
    });

  }, []);

  return (
    <div onClick={ onClickBody } style={{ width: '440px', height: '380px'}} className='bg-gray-900'>
      <Navbar isDisplayListLang={ isDisplayListLang } setIsDisplayListLang={ setIsDisplayListLang } language={ language } />
      <Table streamersList={ streamerList } language={ language }/>
    </div>
  )
};

export default App
