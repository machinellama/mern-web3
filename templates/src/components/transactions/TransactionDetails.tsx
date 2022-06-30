import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import moment from 'moment-mini';
import Typography from '@mui/material/Typography';

import { Transaction } from './Transaction';
import UserContext from '../../util/UserContext';

export interface ITransactionDetails {
  transaction: Transaction;
  open: boolean;
  onClose: () => void;
}

export default function TransactionDetails(props: ITransactionDetails) {
  const userContext = useContext(UserContext);
  const { settings, translations } = userContext;

  if (!props.transaction) {
    return null;
  }

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className="absolute top-1/4 translate-x-1/2 w-max p-6 bg-gray-300">
        <Typography variant="h6" component="h2">
          {`${translations.paymentModal.total}: ${(props.transaction.amount + props.transaction.gasFee).toFixed(18)} ETH`}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          {`${translations.paymentModal.amount}: ${props.transaction.amount.toFixed(18)} ETH`}
        </Typography>
        <Typography sx={{ mt: 2 }}>{`${translations.paymentModal.gasFee}: ${props.transaction.gasFee.toFixed(18)} ETH`}</Typography>
        <Typography sx={{ mt: 2 }}>{`${translations.paymentModal.network}: ${props.transaction.network}`}</Typography>
        <Typography sx={{ mt: 2 }}>{`${translations.paymentModal.created}: ${moment(props.transaction.created).format('LLL Z')}`}</Typography>
        <Typography sx={{ mt: 2 }}>{`${translations.paymentModal.from}: ${props.transaction.from}`}</Typography>
        <Typography sx={{ mt: 2 }}>{`${translations.paymentModal.to}: ${props.transaction.to}`}</Typography>
      </Box>
    </Modal>
  );
}
