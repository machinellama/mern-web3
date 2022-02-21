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
       <div className="flex mb-2">
         <div className="text-blue-500 font-bold w-min-200 dark:text-blue-200">{label}</div>
         <div className="ml-2">{value}</div>
       </div>
     );
   }
 
   return (
     <div className="mt-2">
       {loading ? (
         <CircularProgress />
       ) : (
         <>
           <div className="flex cursor-pointer hover:underline hover:text-blue-500 dark:text-gray-100 dark:hover:text-blue-200" onClick={() => props.goToAll()}>
             <KeyboardBackspaceIcon />
             <div className="ml-2 -pt-1">{translations.characters?.backToAll}</div>
           </div>
 
           <div className="mt-4">
             <h2 className="mb-4 text-xl dark:text-gray-100">{character?.name}</h2>
 
             <div>
               <Card className="max-w-lg w-max">
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
 