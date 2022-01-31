/**
 * Navigation: A side navigation component with metamask login
 * Includes items for page navigation, theme selection, and language selection
 */
 import React, { useContext, useState } from 'react';

 import { Link } from 'react-router-dom';
 import { useMetamask } from 'use-metamask';
 import { useSnackbar } from 'notistack';
 import { Menu, Palette, People, Translate } from '@mui/icons-material';
 import {
   Box,
   Button,
   Divider,
   Drawer,
   Hidden,
   IconButton,
   List,
   ListItem,
   ListItemIcon,
   ListItemText,
   MenuItem,
   Select,
   Tooltip
 } from '@mui/material';
 import cn from 'classnames';
 import superagent from 'superagent';
 import Web3 from 'web3';
 
 import config from '../../../config';
 import UserContext from '../../util/UserContext';
 import './Navigation.scss';
 
 interface INavigation {
   logout: Function;
   page: string;
   setContext: Function;
   setPage: Function;
 }
 
 export default function (props: INavigation) {
   const [mobileOpen, setMobileOpen] = useState<boolean>(false);
 
   const { connect, getAccounts, getChain, metaState } = useMetamask();
   const { enqueueSnackbar } = useSnackbar();
 
   const userContext = useContext(UserContext);
   const { address, settings, translations } = userContext;
   const { language, theme } = settings;
 
   function handleDrawerToggle() {
     setMobileOpen(!mobileOpen);
   }
 
   async function handleSignMessage(publicAddress, nonce): Promise<{ publicAddress: string; signature: string }> {
     // Define instance of web3
     var web3 = new Web3((window as any).ethereum);
     return new Promise((resolve, reject) =>
       web3.eth.personal.sign(web3.utils.fromUtf8(`Nonce: ${nonce}`), publicAddress, '', (err, signature) => {
         if (err) return reject(err);
         return resolve({ publicAddress, signature });
       })
     );
   }
 
   // if metamask is installed in browser, create a new user with the current mainnet address
   // and verify the user with a signature through the metamask wallet
   async function login() {
     if (!metaState?.isAvailable) {
       window.open('https://metamask.io/download/', '_blank');
     } else {
       await connect(Web3);
       const accounts = await getAccounts();
       const chain = await getChain();
       if (accounts.length === 0) {
         enqueueSnackbar(translations.auth?.loginMetamask, { variant: 'warning' });
       } else if (chain.name !== 'mainnet') {
         enqueueSnackbar(translations.auth?.connectMainnet, { variant: 'warning' });
       } else {
         const ethAddress = accounts[0];
         const expressURL = config.express.url;
 
         await superagent
           .post(`${expressURL}/api/users/signup`)
           .send({ address: ethAddress })
           .then(async (dbUser) => {
             if (dbUser) {
               const nonce = dbUser.body.nonce;
               const signedMessage = await handleSignMessage(ethAddress, nonce);
 
               if (signedMessage) {
                 await superagent
                   .post(`${expressURL}/api/users/login`)
                   .send({ address: signedMessage.publicAddress, signature: signedMessage.signature })
                   .then(async (newUser) => {
                     const token = newUser?.body?.token;
 
                     props.setContext({
                       ...userContext,
                       address: signedMessage.publicAddress,
                       token
                     });
                   });
               }
             }
           });
       }
     }
   }
 
   const drawer = (
     <div className="navigation__drawer">
       <div className="login-row">
         {address ? (
           <div className="logout-row">
             <Button variant="outlined" disableElevation onClick={() => props.logout()}>
               {translations.auth?.logout}
             </Button>
             <p>{address}</p>
           </div>
         ) : (
           <Button variant="outlined" disableElevation onClick={() => login()}>
             {translations.auth?.login}
           </Button>
         )}
       </div>
 
       <List className="navigation__main-items">
         <Link to="/characters" onClick={() => props.setPage('/characters')}>
           <ListItem button key="dashboard-icon" selected={props.page.includes('/characters') || props.page === '/'}>
             <ListItemIcon>
               <Tooltip title={translations?.nav?.characters} placement="right">
                 <People aria-label={translations?.nav?.characters} />
               </Tooltip>
             </ListItemIcon>
             <ListItemText primary={translations?.nav?.characters} />
           </ListItem>
         </Link>
       </List>
 
       <Divider />
 
       <List className="navigation__secondary-items">
         <ListItem button key="navigation__theme" aria-label={translations?.nav?.theme}>
           <ListItemIcon>
             <Palette />
           </ListItemIcon>
           <Select
             aria-label={translations?.nav?.theme}
             className="navigation__theme-select"
             onChange={(e) =>
               props.setContext({
                 ...userContext,
                 settings: {
                   ...userContext.settings,
                   theme: e.target.value
                 }
               })
             }
             value={theme}
           >
             <MenuItem value={'light'}>{translations?.nav?.light}</MenuItem>
             <MenuItem value={'dark'}>{translations?.nav?.dark}</MenuItem>
           </Select>
         </ListItem>
 
         <ListItem button key="navigation__language" aria-label={translations?.nav?.language}>
           <ListItemIcon>
             <Translate />
           </ListItemIcon>
           <Select
             aria-label={translations?.nav?.language}
             className="navigation__language-select"
             onChange={(e) =>
               props.setContext({
                 ...userContext,
                 settings: {
                   ...userContext.settings,
                   language: e.target.value
                 }
               })
             }
             value={language}
           >
             <MenuItem value={'english'}>{translations?.languages?.english}</MenuItem>
             <MenuItem value={'japanese'}>{translations?.languages?.japanese}</MenuItem>
           </Select>
         </ListItem>
       </List>
     </div>
   );
 
   function TabPanel(props) {
     const { children, value, index, ...other } = props;
 
     return (
       <div role="tabpanel" hidden={value !== index} {...other}>
         {value === index && <Box p={3}>{children}</Box>}
       </div>
     );
   }
 
   return (
     <>
       <div className={cn('navigation', theme)}>
         <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} className="navigation__mobile-icon">
           <Menu />
         </IconButton>
         <Hidden mdUp implementation="js">
           <Drawer
             anchor="left"
             className="navigation__drawer-container"
             onClose={handleDrawerToggle}
             open={mobileOpen}
             variant="temporary"
             ModalProps={{
               keepMounted: true
             }}
           >
             {drawer}
           </Drawer>
         </Hidden>
         <Hidden smDown implementation="js">
           <Drawer variant="permanent" open className="navigation__drawer-container">
             {drawer}
           </Drawer>
         </Hidden>
       </div>
     </>
   );
 }
 