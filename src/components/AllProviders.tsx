import App from '@/App';
import { ThemeProvider } from '@/components/theme-provider';
import { store } from '@/lib/StatesController';
import React from 'react'
import { Provider } from 'react-redux';

const AllProviders: React.FC = () => {
    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Provider store={store}>
                <App />
            </Provider>
        </ThemeProvider>
    )
}

export default AllProviders;