import { useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import './background';

function App() {

  /*const urlDetector = async () => {

    alert('Hello from extension 1')

    chrome.windows.getAll({populate:true},function(windows){
      windows.forEach(function(window){
        window.tabs!.forEach(function(tab){
    
          //for each url check if the url is "https://www.youtube.com/*"
          if(tab.url && tab.url.startsWith("https://www.youtube.com/")) {
           alert("youtube detected!");
          }
    
        });
      });
    });
  };*/

  

  useEffect(() => {

    //urlDetector();

  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="Layout-sc-1xcs6mc-0 bKPhAm">
        <div className="Layout-sc-1xcs6mc-0 kbdfeJ">
          <div className="Layout-sc-1xcs6mc-0 xxjeD">
            <div role="presentation" className="Layout-sc-1xcs6mc-0 herfUY">
              <figure className="ScFigure-sc-1hrsqw6-0 btGeNA tw-svg">
                <svg width="20px" height="20px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" className="ScSvg-sc-1hrsqw6-1 fHPQCq">
                  <g><path fill-rule="evenodd" d="M5 7a5 5 0 116.192 4.857A2 2 0 0013 13h1a3 3 0 013 3v2h-2v-2a1 1 0 00-1-1h-1a3.99 3.99 0 01-3-1.354A3.99 3.99 0 017 15H6a1 1 0 00-1 1v2H3v-2a3 3 0 013-3h1a2 2 0 001.808-1.143A5.002 5.002 0 015 7zm5 3a3 3 0 110-6 3 3 0 010 6z" clip-rule="evenodd"></path></g>
                </svg>
              </figure>
            </div>
            <p data-a-target="animated-channel-viewers-count" aria-label="Nombre de spectateurs" className="CoreText-sc-1txzju1-0 fiDbWi">
              <span className="ScAnimatedNumber-sc-1iib0w9-0 hERoTc">1919</span>
            </p>
          </div>
        </div>
        <div className="Layout-sc-1xcs6mc-0 kbdfeJ">
          <span className="live-time" aria-label="Temps passé en stream">09:04:29</span>
        </div>
      </div>
    </>
  )
}

export default App
