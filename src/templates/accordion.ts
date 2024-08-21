// CSS
import '../assets/css/accordion.css';

/**
 * 
 * @param { string } label 
 * @returns { string } HTML string
 */
const accordionTemplate = (label: string): string => {
    return  `
        <section class="accordionExtension">
            <div class="tabExtension">
                <input type="checkbox" name="accordion-1" id="cb1" checked>
                <label for="cb1" class="tab__label">${ label }</label>
                <div class="tab__content">
                    <p id="accordionTemplate"></p>
                </div>
            </div>
        </section>
    `;
};



export default accordionTemplate;