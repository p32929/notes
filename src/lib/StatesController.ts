import { state, action, createStore } from 'usm-redux';
import { compose } from 'redux';

const composeEnhancers =
    // @ts-ignore
    typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? // @ts-ignore
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Specify extension’s options like name, actionsDenylist, actionsCreators, serialize...
        })
        : compose;

export interface IStates {
    selectedTab: number
    tabs: string[]
}

export class Controller {
    @state
    states: IStates = {
        selectedTab: 0,
        tabs: [
            ""
        ]
    }

    @action
    setStates(newStates: Partial<IStates>) {
        this.states = {
            ...this.states,
            ...newStates,
        }
    }

    @action
    setText(text: string) {
        this.states.tabs[this.states.selectedTab] = text
    }

    @action
    deleteTab() {
        this.states.tabs = this.states.tabs.filter((_, index) => {
            return index !== this.states.selectedTab
        })
        if (this.states.selectedTab > 0) {
            this.states.selectedTab -= 1
        }
    }

    @action
    addTab() {
        this.states.tabs.splice(this.states.selectedTab + 1, 0, "");
        this.states.selectedTab += 1
    }
}

export const controller = new Controller();

export const store = createStore(
    {
        modules: [controller],
    },
    undefined,
    {
        reduxEnhancer: composeEnhancers(),
    }
);