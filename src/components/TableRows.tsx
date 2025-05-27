import { FC } from "react";

// Typings
import { StorageStreamerListType } from "../typings/StorageType";
import { Languages } from "./Chart/src/js/Texts";
/*import { AppDispatch } from "../store/store";
import { addSummary } from "../store/slices/summarizeSlice";
import { useAppDispatch } from "../store/hooks";*/

export interface TableRowsTextValueI18n {
    focus: string,
    disable: string,
    enable: string
};

export type TableRowsProps = {
    actionsLabels: TableRowsTextValueI18n
    searchTextValue?: string,
    streamersList: StorageStreamerListType[],
    currentPage?: number,
    language?: Languages
}

const itemsPerPage = 3;

/*const encodeWAV = (samples: Float32Array, sampleRate = 44100) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: any, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    // RIFF/WAV header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true);  // PCM format
    view.setUint16(22, 1, true);  // Mono channel
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true);  // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // PCM data
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([view], { type: 'audio/wav' });
}*/

const highlightMatch = (text: string, search: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, 'gi'); // g: Finds all matches in the text + i: Makes the search case-insensitive.
    const parts = text.split(regex);
    return parts.map((part, index) =>
        regex.test(part) ? <span key={index} className="bg-yellow-300 text-gray-900">{part}</span> : part
    );
};

const scrollToAnchor = () => {
    let anchor = document.querySelector("#accordionExtension");
    if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
};

const TableRows: FC<TableRowsProps> = ({ actionsLabels, streamersList, currentPage = 1, searchTextValue = '', language = 'en' }: TableRowsProps) => {

    //const dispatch = useAppDispatch<AppDispatch>();

    const currentItems = streamersList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const onClickSummarizeHandler = async (event: React.MouseEvent<Element, MouseEvent>, streamer: StorageStreamerListType['streamerName'], game: StorageStreamerListType['streamerGame'], windowId: StorageStreamerListType['windowId'], language: Languages) => {
        event.preventDefault();
        console.log('streamer', streamer, game)

        await chrome.runtime.sendMessage({ action: 'openSidePanel', payload: { streamer, game, language, windowId } });

        /*chrome.tabCapture.capture({ audio: true, video: false }, async (stream) => {

            if (!stream) {
                console.error("Échec de capture audio");
                return;
            }

            const audioCtx = new AudioContext();
            await audioCtx.audioWorklet.addModule('./js/audioProcessor.js');

            const source = audioCtx.createMediaStreamSource(stream);

            const workletNode = new AudioWorkletNode(audioCtx, 'custom-audio-processor');

            let audioBuffer: number[] = [];
            let sampleRate = 44100; // sera défini dynamiquement
            let bufferDurationSec = 30;
            let maxSamples = bufferDurationSec * sampleRate;

            workletNode.port.onmessage = async (event) => {
                const chunk = event.data;

                if (!sampleRate) {
                sampleRate = audioCtx.sampleRate;
                maxSamples = bufferDurationSec * sampleRate;
                }

                audioBuffer.push(...chunk); // accumulate samples

                if (audioBuffer.length >= maxSamples) {
                    // 1. Extraire 30s de données
                    const chunkToSend = audioBuffer.slice(0, maxSamples);
                    audioBuffer = audioBuffer.slice(maxSamples); // garde le reste si trop

                    // 2. Convertir en WAV
                    const wavBlob = encodeWAV(Float32Array.from(chunkToSend), sampleRate);

                    // 3. Envoi à Flask
                    const formData = new FormData();
                    formData.append("audio", wavBlob, "chunk.wav");
                    formData.append('streamer', streamer);
                    formData.append('game', game);
                    formData.append('language', language);
                    formData.append('time', new Date().getTime().toString());

                    try {
                        const res = await fetch("http://127.0.0.1:5000/summarize/", {
                            method: "POST",
                            body: formData
                        });

                        const json = await res.json();
                        dispatch(addSummary({ text: json.summary, time: parseInt(json.time) }));
                        console.log("Transcription :", json);
                        
                    } catch (err) {
                        console.log(err);
                    }
                }
            };

            source.connect(workletNode);
            workletNode.connect(audioCtx.destination);
            source.connect(audioCtx.destination);
        });*/
    };

    const onClickDisableHanlder = (tabId: StorageStreamerListType['tabId'], isEnable: StorageStreamerListType['isEnable']) => {
        chrome.tabs.sendMessage(tabId, { event: isEnable ? "disableChart" : "enableChart" });
    };

    const onClickFocusHandler = async (tabId: StorageStreamerListType['tabId'], windowId: StorageStreamerListType['windowId']) => {
        if (tabId) {
            // Active window
            await chrome.windows.update(windowId, { focused: true });

            // Active target tab
            await chrome.tabs.update(tabId, { active: true });

            chrome.scripting.executeScript({
                target: { tabId },
                func: scrollToAnchor
            });
        }
    };

    const getPillColor = (status: StorageStreamerListType['status']): string => {
        switch (status) {
            case 'Active': return 'bg-gradient-to-r from-green-400 via-green-500 to-green-600';
            case 'Actif': return 'bg-gradient-to-r from-green-400 via-green-500 to-green-600';
            case 'Inactive': return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600';
            case 'Inactif': return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600';
            case 'Idle': return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600';
            case 'Pause': return 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600';
            default: return 'bg-gradient-to-r from-green-400 via-green-500 to-green-600';
        }
    };

    return(
        <>
            { 
                currentItems?.map(({ streamerName, streamerGame, streamerImage, status, occurrences, tabId, isEnable, windowId }: StorageStreamerListType, index) => {

                    // Handle suffix streamer name : (x)
                    const displayedName = occurrences > 0 ? `${streamerName} (${occurrences})` : `${streamerName}`;

                    const isLastItem = index === currentItems.length - 1;
                    const shouldApplyRoundedClass = index % 3 === 2 || isLastItem;

                    return(
                        <tr key={ index }className={`${index !== streamersList.length-1 ? 'border-b' : ''} border-gray-700 group rounded-br-lg`}>
                            <th scope="row" className={`${shouldApplyRoundedClass ? 'rounded-bl-lg' : ''} bg-gray-900 flex flex-row pl-2 pr-1 py-4 font-medium text-white/90 group-hover:text-white whitespace-nowrap`}>
                                <img className="mr-2 rounded-full" src={ streamerImage } alt="Streamer avatar" width={ 20 } height={ 20 }/>
                                <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[120px] cursor-default" title={ streamerName }>
                                 { highlightMatch(displayedName, searchTextValue) }
                                </div>
                            </th>
                            <td className="bg-gray-900 pl-1 pr-1 py-3">
                                <div className={`${ getPillColor(status) } w-2 h-2 rounded-full inline-block mr-1`}></div>
                                <div className="group-hover:text-white inline-block cursor-default">{ status }</div>
                            </td>
                            <td className="bg-gray-900 pl-4 py-3">
                                <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[125px] group-hover:text-white cursor-default" title={ streamerGame }>
                                 { highlightMatch(streamerGame, searchTextValue) }
                                </div>
                            </td>
                            <td className={`${shouldApplyRoundedClass ? 'rounded-br-lg' : '' } bg-gray-900 px-2 py-3 items-center justify-center group/dropdown relative`}>
                                    <button className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100 group-hover:text-white" type="button">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                        </svg>
                                    </button>
                                    <div className="hidden absolute z-10 w-20 top-[-3px] right-[37px] opacity-90 bg-gray-500 border-gray-900 rounded divide-y divide-gray-100 shadow-sm group-hover/dropdown:block">
                                        <ul className=" text-sm text-white">
                                            <li onClick={ (e) => onClickSummarizeHandler(e, streamerName, streamerGame, windowId, language) } className="hover:bg-gray-400 hover:rounded">
                                                <a href="" className="block py-1 px-2">Summarize</a>
                                            </li>
                                            <li onClick={ () => onClickFocusHandler(tabId, windowId) } className="hover:bg-gray-400 hover:rounded">
                                                <a href="" className="block py-1 px-2">{ actionsLabels.focus }</a>
                                            </li>
                                            <li onClick={ () => onClickDisableHanlder(tabId, isEnable) } className="hover:bg-gray-400 hover:rounded">
                                                <a href="#" className="block py-1 px-2">{ isEnable ? actionsLabels.disable : actionsLabels.enable }</a>
                                            </li>
                                        </ul>
                                    </div>
                            </td>
                        </tr>
                    )
                })
            }
        </>
    );
};

export { TableRows }