import React, { useContext, useEffect, useState } from 'react';
import { useMetamask } from 'use-metamask';
import { useSnackbar } from 'notistack';
import { RouteComponentProps } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { ethers } from 'ethers';
import superagent from 'superagent';

import config from '../../../config';
import UserContext from '../../util/UserContext';
import { Transaction } from './Transaction';
import TransactionTable from './TransactionTable';

export interface ITransactions {
  history: RouteComponentProps;
  logout: () => void;
}

export default function Transactions(props: ITransactions) {
  const [balance, setBalance] = useState<number>();
  const [chain, setChain] = useState<string>();
  const [sendAddress, setSendAddress] = useState<string | undefined>();
  const [amount, setAmount] = useState<number | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string>();

  const { enqueueSnackbar } = useSnackbar();
  const { getChain, metaState, connect } = useMetamask();

  const userContext = useContext(UserContext);
  const { address, translations, token, settings } = userContext;
  const { language, theme } = settings;
  const expressURL = config.express.url;

  if (!address) {
    props.history.push('/');
  }

  useEffect(() => {
    if (!loading) {
      getTransactions();
    }
  }, []);

  useEffect(() => {
    const { account, isConnected, web3 } = metaState;

    if (account.length && isConnected && web3) {
      getCurrentBalance(web3);
      getCurrentChain();
    }
  }, [metaState?.isAvailable, metaState?.web3]);

  async function getCurrentBalance(web3) {
    if (!metaState.web3 || !metaState.account[0]) return;

    let walletBalance;
    if (web3?.eth) {
      walletBalance = await metaState.web3.eth.getBalance(metaState.account[0]);
    } else {
      walletBalance = await metaState.web3.getBalance(metaState.account[0]);
    }
    setBalance(parseFloat((walletBalance / 10 ** 18).toFixed(18)));
  }

  async function getCurrentChain() {
    const network = config.network;

    if (!metaState?.isAvailable) {
      window.open('https://metamask.io/download/', '_blank');
    } else {
      const chain = await getChain();

      if (chain.name !== network) {
        enqueueSnackbar(`${translations.auth?.connectNetwork}: ${network}`, { variant: 'error' });
        props.logout();
        props.history.push('/');
      } else {
        setChain(chain.name);
      }
    }
  }

  async function getTransactions() {
    return superagent
        .get(`${expressURL}/api/transactions`)
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          setTransactions(response.body || []);
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

  async function makePayment() {
    if (!sendAddress || !amount) {
      enqueueSnackbar(`${translations.payment.addressAndAmountRequired}`, { variant: 'error' });
    } else {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        ethers.utils.getAddress(sendAddress);
        const tx = await signer.sendTransaction({
          to: sendAddress,
          value: ethers.utils.parseEther(amount?.toString())
        });

        enqueueSnackbar(`${translations.payment.paymentSent}`, { variant: 'success' });

        const newTransaction = {
          amount: ethers.utils.formatEther(tx.value),
          created: new Date().toISOString(),
          from: tx.from,
          gasFee: ethers.utils.formatEther(tx.gasPrice),
          network: chain,
          raw: tx,
          to: tx.to,
          transactionId: tx.hash
        };

        superagent
          .post(`${expressURL}/api/transactions`)
          .set('Authorization', `Bearer ${token}`)
          .send(newTransaction)
          .then((response) => {
            getTransactions();
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
      } catch (error) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  }

  return (
    <div className="h-screen lg:w-[calc(100vw_-_20rem)] w-full md:ml-2">
      <div className="m-2 w-full">
        <h1 className="dark:text-gray-100 my-2 text-xl font-semibold">{translations.payment?.makePayment || ''}</h1>

        <p className="dark:text-gray-100 my-2 text-md">{`${translations.payment.network}: ${chain || '-'}`}</p>

        <p className="dark:text-gray-100 my-2 text-md">{`${translations.payment.currentBalance}: ${balance || '-'}`}</p>

        <div className="grid w-full">
          <div className="my-4">
            <TextField
              id="send-address-id"
              label={translations.payment.sendToAddress}
              variant="standard"
              className="w-full max-w-md min-w-100"
              onChange={(event) => setSendAddress(event.target.value)}
            />
          </div>

          <div className="my-4">
            <TextField
              id="amount-id"
              label={translations.payment.sendAmount}
              variant="standard"
              type="number"
              className="my-4 w-full max-w-md min-w-100"
              onChange={(event) => setAmount(parseFloat(event.target.value))}
            />
          </div>

          <div className="my-4">
            <Button variant="outlined" className="dark:text-gray-100 w-fit" disableElevation onClick={makePayment}>
              {translations.payment?.send || ''}
            </Button>
          </div>
        </div>

        <div>
          <TransactionTable data={transactions} />
        </div>
      </div>
    </div>
  );
}
