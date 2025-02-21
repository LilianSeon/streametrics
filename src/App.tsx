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
        setStreamerList(streamersList);
      } catch (error) {
        console.error("Error fetching local storage:", error);
      }
    };

    getStorage('streamersList');

  }, []);

  return (
    <div onClick={ onClickBody } style={{ width: '440px', height: '380px'}} className='bg-gray-900'>
      <Navbar isDisplayListLang={ isDisplayListLang } setIsDisplayListLang={ setIsDisplayListLang } />
      <Table streamerList={ streamerList } />
    </div>
  )
};

export default App
