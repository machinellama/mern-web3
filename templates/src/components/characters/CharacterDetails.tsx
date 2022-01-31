/**
 * Character details component which lists character information
 */
import React, { useContext, useState, useEffect } from 'react';
import { Card, CardContent, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import superagent from 'superagent';

import { Character } from './Character';
import config from '../../../config';
import UserContext from '../../util/UserContext';

interface ICharacterDetails {
  goToAll: Function;
  id?: number;
  logout: Function;
}

export default function (props: ICharacterDetails) {
  const [character, setCharacter] = useState<Character>();
  const [loading, setLoading] = useState<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();

  const userContext = useContext(UserContext);
  const { settings, translations, token } = userContext;

  const expressURL = config.express.url;

  useEffect(() => {
    if (!loading) {
      setLoading(true);

      superagent
        .get(`${expressURL}/api/characters`)
        .set('Authorization', `Bearer ${token}`)
        .query({ id: props.id })
        .then((response) => {
          setCharacter(response.body || []);
        })
        .catch((e) => {
          // unauthorized
          if (e.status === 401) {
            enqueueSnackbar(translations.auth?.unauthorizedPleaseLogin, { variant: 'warning' });
            if (token) {
              props.logout();
            }
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [props.id]);

  function getPair(label, value) {
    if (!value) return null;

    return (
      <div className="pair">
        <div className="label">{label}</div>
        <div className="value">{value}</div>
      </div>
    );
  }

  return (
    <div className="characters__details">
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <div className="details__back" onClick={() => props.goToAll()}>
            <KeyboardBackspaceIcon />
            <div className="details__back-text">{translations.characters?.backToAll}</div>
          </div>

          <div className="details__container">
            <h2 className="details__name">{character?.name}</h2>

            <div className="details__info">
              <Card className="details__info-card">
                <CardContent>
                  {getPair(translations.characters?.location, character?.location)}
                  {getPair(translations.characters?.description, character?.description)}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
