import { FC, ChangeEventHandler } from "react";

type ToggleProps = {
    isChecked: boolean,
    onChangeCheckbox: ChangeEventHandler<HTMLInputElement>
}

const Toggle: FC<ToggleProps> = ({ isChecked, onChangeCheckbox }: ToggleProps) => {
    return(
        <label className="flex pr-1 items-center cursor-pointer" title="Disable extension">
            <input onChange={ onChangeCheckbox } type="checkbox" className="sr-only peer" checked={ isChecked } />
            <div className="relative w-9 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    );
};

export { Toggle }