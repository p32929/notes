import App from '@/App';
import { ThemeProvider } from '@/components/theme-provider';
import { store } from '@/lib/StatesController';
import React from 'react'
import { Provider } from 'react-redux';


interface Props {

}

const AllProviders: React.FC<Props> = (props) => {

    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Provider store={store}>
                <App />
            </Provider>
        </ThemeProvider>
    )

}

export default AllProviders;