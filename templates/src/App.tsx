import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { MetamaskStateProvider } from 'use-metamask';
import { SnackbarProvider } from 'notistack';
import cn from 'classnames';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { getStorage, setStorage } from './util/storage';
import Characters from './components/characters/Characters';
import getTranslations from './translations/getTranslations';
import Navigation from './components/navigation/Navigation';
import UserContext, { getDefaultUserContext, IContext } from './util/UserContext';
import './App.scss';

function App() {
  const [context, setContext] = useState<IContext>(getDefaultUserContext());
  const [page, setPage] = useState<string>(window.location.pathname);

  useEffect(() => {
    setStorage('language', context.settings.language);
    setStorage('theme', context.settings.theme);
    setStorage('token', context.token);
    setStorage('address', context.address);
  }, [context]);

  function logout() {
    setContext({
      ...context,
      address: '',
      token: ''
    });
  }

  const contextValue = {
    ...context,
    translations: getTranslations(context.settings.language)
  };

  const theme = createTheme({
    typography: {
      fontFamily: [
        'Inter'
      ].join(',')
    },
    palette: {
      mode: context.settings.theme === 'dark' ? 'dark' : 'light'
    }
  });

  return (
    <MetamaskStateProvider>
      <UserContext.Provider value={contextValue}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={3}>
              <div className={cn('app', context.settings.theme)}>
                <div className="main flex dark:bg-gray-700">
                  <Navigation logout={logout} page={page} setContext={setContext} setPage={setPage} />

                  <Switch>
                    <Route exact path="/" component={(params) => <Characters {...params} logout={logout} />} />
                    <Route
                      exact
                      path={['/characters', '/characters/:id']}
                      component={(params) => {
                        return <Characters id={params?.match?.params?.id} {...params} logout={logout} />;
                      }}
                    />
                  </Switch>
                </div>
              </div>
            </SnackbarProvider>
          </ThemeProvider>
        </BrowserRouter>
      </UserContext.Provider>
    </MetamaskStateProvider>
  );
}

export default App;
