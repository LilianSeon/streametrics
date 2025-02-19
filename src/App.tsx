import { useEffect, useMemo, useState } from 'react';
import './background';

//import ChartExtension from './js/chartExtension';

//import "./Chart/src/assets/css/output.css"

type LangList = {
  language: string,
  languageShort: string,
  flag: string,
  isSelected: boolean | null
}

const App = () => {

  const [ isDisplayListLang, setIsDisplayListLang ] = useState(false);

  const imgSrc = useMemo(() => chrome.runtime.getURL('images/logo-transparent.png'), []);
  const UKFlagSVG = useMemo(() => chrome.runtime.getURL('images/uk-flag.svg'), []);
  const FRFlagSVG = useMemo(() => chrome.runtime.getURL('images/fr-flag.svg'), []);
  const [ langList, setLangList ] = useState<LangList[]>([{
    language: 'English',
    languageShort: 'en',
    flag: chrome.runtime.getURL('images/uk-flag.svg'),
    isSelected: null
  },
  {
    language: 'Français',
    languageShort: 'fr',
    flag: chrome.runtime.getURL('images/fr-flag.svg'),
    isSelected: null
  }]);
  //const [ currentLanguage, setCurrentLanguage ] = useState(navigator.language.includes('fr') ? 'fr' : 'en');

  useEffect(() => {
    //const getStorageFn = async (keys: string | string[]) => await getStorage(keys);
    //const setStorageFn = async (items: {[key: string]: any}) => await setStorage(items);

    const initStorage = async () => {
      const { language } = await chrome.storage.local.get(["language"]);

      console.log("language :", language)

      setLangList(langList.map((lang) => { return {...lang, isSelected: lang.languageShort === language } }))
    };

    initStorage();

    
    
  }, []);

  const onClickBody: React.MouseEventHandler<HTMLDivElement> = () => {
    if (isDisplayListLang) setIsDisplayListLang(!isDisplayListLang)
  };

  const setLanguage = async (lang: string) => {
    setLangList(langList.map((language) => { return {...language, isSelected: language.languageShort === lang } }));
    await chrome.storage.local.set({ "language": lang });
  };


  return (
    <div onClick={ onClickBody } style={{ width: '350px', height: '380px'}} className='bg-gray-900'>
      <nav className="bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <div className="flex items-center">
          <img className="my-auto h-8 rounded-full inline-block" src={ imgSrc } alt="logo" />
              <span className="ml-2 self-center text-xl font-semibold whitespace-nowrap text-white tracking-wide">StreaMetrics</span>
          </div>
          <div className="flex flex-col items-center md:order-2 space-x-1 md:space-x-0">
              <button type="button" onClick={() => setIsDisplayListLang(!isDisplayListLang) } className="inline-flex items-center font-medium justify-center px-4 py-2 text-sm text-white rounded-lg cursor-pointer hover:bg-gray-100 hover:text-black">
                <img className="mr-2" height={ 20 } width={ 20 } src={ langList.find(({ isSelected }) => isSelected)?.flag }/> ({ langList.find(({ isSelected }) => isSelected)?.languageShort.toUpperCase() })
              </button>
              <div className={`mt-10 z-50 ${ isDisplayListLang ? 'block' : 'hidden'} absolute my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700`} id="language-dropdown-menu">
                <ul className="py-2 font-medium" role="none">
                  <li>
                    <button type="button" onClick={ () => { setLanguage('en') }} className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                      <div className="inline-flex items-center">
                        <img className="h-3.5 w-3.5 rounded-full me-2" src={ UKFlagSVG } alt="UK Flag"/>              
                        English
                      </div>
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={ () => { setLanguage('fr') }} className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                      <div className="inline-flex items-center">
                      <img className="h-3.5 w-3.5 rounded-full me-2" src={ FRFlagSVG } alt="FR Flag"/> Français
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
          </div>
        </div>
      </nav>
    </div>
  )
};

export default App
