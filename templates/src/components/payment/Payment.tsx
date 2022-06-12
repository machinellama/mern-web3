import React, { useContext, useEffect, useState } from 'react';
import { useMetamask } from 'use-metamask';
import { useSnackbar } from 'notistack';
import { RouteComponentProps } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { ethers } from 'ethers';

import config from '../../../config';
import UserContext from '../../util/UserContext';

export interface IPayment {
  history: RouteComponentProps;
  logout: () => void;
}

export default function Payment(props: IPayment) {
  const [balance, setBalance] = useState<number>();
  const [chain, setChain] = useState<string>();
  const [sendAddress, setSendAddress] = useState<string | undefined>();
  const [amount, setAmount] = useState<number | undefined>();

  const { enqueueSnackbar } = useSnackbar();
  const { getChain, metaState } = useMetamask();

  const userContext = useContext(UserContext);
  const { address, translations } = userContext;

  if (!address) {
    props.history.push('/');
  }

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

        console.log({ amount, sendAddress });
        console.log('tx', tx);

        enqueueSnackbar(`${translations.payment.paymentSent}`, { variant: 'success' });
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
      </div>
    </div>
  );
}