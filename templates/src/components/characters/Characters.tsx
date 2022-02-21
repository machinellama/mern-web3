/**
 * Characters component with a list of characters, sorting,
 * active toggle, character search, and a details page on character click
 */
 import React, { useContext, useState, useEffect } from 'react';
 import { CircularProgress, TextField } from '@mui/material';
 import { RouteComponentProps } from 'react-router-dom';
 import { useSnackbar } from 'notistack';
 import moment from 'moment-mini';
 import orderBy from 'lodash/orderBy';
 import superagent from 'superagent';
 
 import { Character } from './Character';
 import CharacterDetails from './CharacterDetails';
 import CharacterTable from './CharacterTable';
 import config from '../../../config';
 import UserContext from '../../util/UserContext';
 
 interface ICharacters {
   history: RouteComponentProps;
   id?: number;
   logout: Function;
 }
 
 export default function (props: ICharacters) {
   const [characterId, setCharacterId] = useState<number>();
   const [characters, setCharacters] = useState<Character[]>([]);
   const [error, setError] = useState<string>();
   const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
   const [loading, setLoading] = useState<boolean>(false);
   const [search, setSearch] = useState<string>('');
   const [showInactive, setShowInactive] = useState<boolean>(true);
   const [sort, setSort] = useState<string>('name');
 
   const { enqueueSnackbar } = useSnackbar();
 
   const userContext = useContext(UserContext);
   const { settings, translations, token } = userContext;
   const { language, theme } = settings;
 
   const expressURL = config.express.url;
 
   useEffect(() => {
     if (!loading) {
       setLoading(true);
 
       superagent
         .get(`${expressURL}/api/characters`)
         .set('Authorization', `Bearer ${token}`)
         .then((response) => {
           setCharacters(response.body || []);
           setFilteredCharacters(response.body.sort((a, b) => moment(b.created).diff(a.created, 'seconds')));
         })
         .catch((e) => {
           // unauthorized
           if (e.status === 401) {
             setError(translations.auth?.unauthorizedPleaseLogin);
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
   }, []);
 
   useEffect(() => {
     const newCustomers = [...filteredCharacters];
 
     if (sort === 'created') {
       setFilteredCharacters(newCustomers.sort((a, b) => moment(b.created).diff(a.created, 'seconds')));
     } else {
       setFilteredCharacters(orderBy(newCustomers, [sort], ['asc']));
     }
   }, [sort]);
 
   useEffect(() => {
     setCharacterId(props.id);
   }, [props.id]);
 
   function isValidCharacter(character) {
     const searchText = search?.toLowerCase()?.trim();
     const name = character.name?.toLowerCase()?.trim();
     const location = character.location?.toLowerCase()?.trim();
     const id = character.id?.toString();
 
     return name?.includes(searchText) || location?.includes(searchText) || id === searchText;
   }
 
   function goToDetails(id: number) {
     props.history.push(`/characters/${id}`);
   }
 
   function goToAll() {
     setCharacterId(undefined);
     setSearch('');
     props.history.push('/characters');
   }
 
   return (
     <div className="h-screen w-[calc(100vw_-_20rem)] -ml-2 md:ml-2">
       {error ? (
         <div className="characters__error dark:text-gray-100">{error}</div>
       ) : characterId != null ? (
         <CharacterDetails id={characterId} goToAll={goToAll} logout={props.logout} />
       ) : loading ? (
         <CircularProgress />
       ) : (
         <>
           <div className="flex justify-between mb-4 w-full mt-2">
             <div className="search-row__search">
               <TextField
                 id="character-search"
                 label={translations.characters?.characterSearch || ''}
                 variant="standard"
                 onChange={(event) => setSearch(event.target.value)}
               />
             </div>
           </div>
 
           <CharacterTable
             data={filteredCharacters}
             isValidCharacter={isValidCharacter}
             showInactive={showInactive}
             goToDetails={goToDetails}
           />
         </>
       )}
     </div>
   );
 }
 