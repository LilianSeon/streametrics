import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState, ChangeEventHandler } from "react";

// Components
import { Toggle } from "./Toggle";

// Typings
import { Languages } from './Chart/src/js/Texts';

// I18n
import { loadMessage } from "../loader/fileLoader";
import { useAppDispatch } from "../store/hooks";
import { AppDispatch } from "../store/store";
import { updateLanguage } from "../store/slices/languageSlice";


const setIsEnableExtension = async (value: boolean) => {
    await chrome.storage.local.set({ isEnableExtension: value });
};

const deleteAllStreamers = async () => {
    
    return new Promise(async (resolve) => {
        const { streamersList } = await chrome.storage.local.get(['streamersList']);
        if (streamersList) {
            chrome.runtime.sendMessage({ action: 'deleteAllStreamers' }, (isDone) => {
                resolve(isDone);
            });
        }
    });
}

type LangList = {
    language: string,
    languageShort: Languages,
    flag: string,
    isSelected: boolean | null
}

export type NavbarProps = {
    isDisplayListLang: boolean,
    setIsDisplayListLang: Dispatch<SetStateAction<boolean>>,
    language?: Languages
}

const Navbar: FC<NavbarProps> = ({ isDisplayListLang, setIsDisplayListLang, language }: NavbarProps) => {

    const dispatch = useAppDispatch<AppDispatch>();

    const [ checkboxValue, setCheckboxValue ] = useState<boolean | undefined>();
    const imgSrc = useMemo(() => chrome.runtime.getURL('images/logo-transparent.png'), []);
    const UKFlagSVG = useMemo(() => chrome.runtime.getURL('images/uk-flag.svg'), []);
    const FRFlagSVG = useMemo(() => chrome.runtime.getURL('images/fr-flag.svg'), []);
    const [ toggleTitle, setToggleTitle ] = useState('');

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

    useEffect(() => {

        chrome.storage.onChanged.addListener(({ isEnableExtension }) => {
            if (isEnableExtension?.newValue || isEnableExtension?.newValue === false) {
                setCheckboxValue(isEnableExtension.newValue as boolean);
            }
        });

        const initStorage = async () => {
          const { language } = await chrome.storage.local.get(["language"]);
          const { isEnableExtension } = await chrome.storage.local.get(["isEnableExtension"]);
          setLanguage(language);
          setCheckboxValue(isEnableExtension);
        };
    
        initStorage();
        
    }, []);

    
    const setLanguage = async (lang: Languages) => {
        setLangList(langList.map((language) => { return {...language, isSelected: language.languageShort === lang } }));
        dispatch(updateLanguage(lang));
        await chrome.storage.local.set({ "language": lang });
    };

    const onChangeCheckbox: ChangeEventHandler<HTMLInputElement> = (event) => {
        setIsEnableExtension(event.target.checked);
        if (event.target.checked) {
            chrome.tabs.query({}).then(async (tabs) => {
                for (const tab of tabs) {
                    chrome.tabs.sendMessage(tab.id!, { event: "enableChart" }).catch((error) => {
                        console.log(error)
                    });
                }
            })
        } else if(!event.target.checked) {
            deleteAllStreamers();
        }
    };

    useEffect(() => {
        if (language) {
            loadMessage("toggle", language)
            .then((message) => {
                setToggleTitle(message);
            });
        }
    }, [language]);

    return(
        <nav className="bg-gray-900">
            <div className="max-w-screen-xl flex flex-wrap items-center mx-auto p-4">
                <div className="flex items-center">
                    <img className="my-auto h-9 inline-block" src={ imgSrc } alt="logo" />
                    <span className="ml-2 self-center text-xl font-semibold whitespace-nowrap text-white tracking-wide">StreaMetrics</span>
                </div>
                <div className="grow"></div>
                { typeof checkboxValue !== 'undefined' ? <Toggle isChecked={ checkboxValue! } onChangeCheckbox={ onChangeCheckbox } labelTitle={ toggleTitle }/> : <></>}
                <div className="flex flex-col items-center space-x-1">
                    <button type="button" onClick={() => setIsDisplayListLang(!isDisplayListLang) } className="inline-flex items-center font-medium justify-center px-2 py-2 text-sm text-white rounded-lg cursor-pointer hover:bg-gray-100 hover:text-black">
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
    );
};

export { Navbar }