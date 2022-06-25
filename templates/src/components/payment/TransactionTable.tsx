/**
 * Characters table on the characters page
 * with first name, last name, email, joined date, and active status
 */
import React, { useContext, useState } from 'react';
import { DataGrid, GridSortDirection } from '@mui/x-data-grid';
import isEqual from 'lodash/isEqual';
import moment from 'moment-mini';

import { Transaction } from './Transaction';
import UserContext from '../../util/UserContext';
import TransactionDetails from './TransactionDetails';

interface ICharacterTable {
  data: Transaction[];
}

export default function (props: ICharacterTable) {
  const [sortModel, setSortModel] = useState([{ field: 'created', sort: 'desc' as GridSortDirection }]);
  const [openModal, setOpenModal] = useState(false);
  const [modalDetails, setModalDetails] = useState<Transaction>();

  const userContext = useContext(UserContext);
  const { settings, translations } = userContext;

  const columns = [
    {
      field: 'transactionId',
      headerName: translations.payment.transactionId,
      width: 250
    },
    {
      field: 'network',
      headerName: translations.payment.network,
      width: 100
    },
    {
      field: 'created',
      headerName: translations.payment.created,
      width: 180,
      valueGetter: (params) => {
        return moment(params.row.created).format('LLL');
      },
      sortComparator: (v1, v2, param1, param2) => {
        const firstDate = param1.api.getCellValue(param1.id, 'created');
        const secondDate = param2.api.getCellValue(param2.id, 'created');

        return moment(firstDate).diff(secondDate, 'seconds');
      }
    },
    {
      field: 'to',
      headerName: translations.payment.toAddress,
      width: 250
    },
    {
      field: 'amount',
      headerName: translations.payment.amount,
      width: 150
    }
  ];

  function onClickRow(transaction: Transaction) {
    console.log('onClickrow transaction', transaction);
    setOpenModal(true);
    setModalDetails(transaction);
  }

  return (
    <>
      <div className="md:w-[calc(100vw_-_20rem)] w-[calc(100vw_-_2rem)] h-[calc(100vh_-_5rem)]">
        <DataGrid
          sortModel={sortModel}
          rows={props.data}
          getRowClassName={(row) => 'cursor-pointer'}
          columns={columns}
          onRowClick={(params: any) => onClickRow(params.row)}
          onSortModelChange={(model) => {
            if (!isEqual(model, sortModel)) {
              setSortModel(model);
            }
          }}
        />
      </div>

      <TransactionDetails open={openModal} transaction={modalDetails} onClose={() => setOpenModal(false)} />
    </>
  );
}
