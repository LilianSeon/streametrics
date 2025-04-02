import { FC, useEffect, useState } from 'react';
import './background';

// Components
import { Navbar } from './components/Navbar';
import { Table } from './components/Table';

// Typing
import { StorageStreamerListType } from './typings/StorageType';


const App: FC = () => {

  const [ isDisplayListLang, setIsDisplayListLang ] = useState(false);
  const [ streamerList, setStreamerList ] = useState<StorageStreamerListType[]>([]);

  const onClickBody: React.MouseEventHandler<HTMLDivElement> = () => {
    if (isDisplayListLang) setIsDisplayListLang(!isDisplayListLang)
  };

  useEffect(() => {

    chrome.storage.onChanged.addListener(({ streamersList }) => {
      if (streamersList.newValue) {
        setStreamerList(streamersList.newValue as StorageStreamerListType[]);
      }
      console.log('onChanged.addListener :', streamersList.newValue)
    });

    const getStorage = async (keys: string | string[]) => {
      try {
        const { streamersList } = await chrome.storage.local.get(keys);
        setStreamerList(streamersList ?? []);

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

    getStorage('streamersList').then(async () => {
      const { streamersList } = await chrome.storage.local.get('streamersList');
      const allStreamerTabId: number[] = [];
      let checkStatusNoResponse: number = 0;

      streamersList.forEach((streamer: StorageStreamerListType) => {
        chrome.tabs.sendMessage(streamer.tabId, { event: "check_status" }, function (response?: number) {
          if (typeof response === 'undefined' || chrome.runtime?.lastError) {
              console.log("Le script de contenu n'est pas chargé sur cet onglet.");
          } else if(response) {
            checkStatusNoResponse++;
            allStreamerTabId.push(response);
            const filteredStreamerList = streamersList.filter(({ tabId }: StorageStreamerListType) => allStreamerTabId.includes(tabId));
            console.log(streamersList, filteredStreamerList, allStreamerTabId)
            setStorage(filteredStreamerList);
          }

          if (checkStatusNoResponse === 0) setStorage([]); // If only get error response clear streamerlist
        });
      });
    });

  }, []);

  return (
    <div onClick={ onClickBody } style={{ width: '440px', height: '380px'}} className='bg-gray-900'>
      <Navbar isDisplayListLang={ isDisplayListLang } setIsDisplayListLang={ setIsDisplayListLang } />
      <Table streamersList={ streamerList } />
    </div>
  )
};

export default App
