/**
 * Characters table on the characters page
 * with first name, last name, email, joined date, and active status
 */
 import React, { useContext, useState } from 'react';
 import { DataGrid } from '@mui/x-data-grid';
 import isEqual from 'lodash/isEqual';
 import moment from 'moment-mini';
 
 import { Character } from './Character';
 import UserContext from '../../util/UserContext';
 
 interface ICharacterTable {
   data: Character[];
   goToDetails: Function;
   isValidCharacter: Function;
   showInactive: boolean;
 }
 
 export default function (props: ICharacterTable) {
   const [sortModel, setSortModel] = useState([]);
 
   const userContext = useContext(UserContext);
   const { settings, translations } = userContext;
 
   const columns = [
     {
       field: 'name',
       headerName: translations.characters?.name,
       width: 200
     },
     {
       field: 'location',
       headerName: translations.characters?.location,
       width: 175
     },
     {
       field: 'created',
       headerName: translations.characters?.created,
       width: 180,
       valueGetter: (params) => {
         return moment(params.row.created).format('LL');
       },
       sortComparator: (v1, v2, param1, param2) => {
         const firstDate = param1.api.getCellValue(param1.id, 'created');
         const secondDate = param2.api.getCellValue(param2.id, 'created');
 
         return moment(firstDate).diff(secondDate, 'seconds');
       }
     }
   ];
 
   function filterRows(rows) {
     return rows?.filter(props.isValidCharacter);
   }
 
   return (
     <div className="md:w-[calc(100vw_-_20rem)] w-[calc(100vw_-_2rem)] h-[calc(100vh_-_5rem)]">
       <DataGrid
         sortModel={sortModel}
         rows={filterRows(props.data)}
         getRowClassName={(row) => "cursor-pointer"}
         columns={columns}
         onRowClick={(params) => props.goToDetails(params.row.id)}
         onSortModelChange={(model) => {
           if (!isEqual(model, sortModel)) {
             setSortModel(model);
           }
         }}
       />
     </div>
   );
 }
 