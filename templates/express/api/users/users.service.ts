import { Request as ExRequest } from 'express';
import { bufferToHex, ecrecover, fromRpcSig, hashPersonalMessage, publicToAddress, toBuffer } from 'ethereumjs-util';

import { connect } from '../../util/mongo';
import { User } from './user';
import { CustomError } from '../../util/errors';
import { createJWT } from '../../util/auth';
import checksum from 'eth-checksum';

/**
 * Users Service with MetaMask/Etherum authentication
 */
export default class UsersService {
  /**
   * Signup function will create a new user in the db with the primary key being
   * the Ethereum address passed in (if a user with that address doesn't already exist).
   * Will also create a new nonce (random number) to be saved with the user, which will be used
   * as the wallet signature message on the UI.
   * It's important to create the User in the db with a random nonce *before* they sign a message
   * in their wallet, so we can verify the signature is valid in the login function below.
   *
   * Note: will convert the address to its checksum version before creating a new user.
   * https://coincodex.com/article/2078/ethereum-address-checksum-explained/
   * @param req
   * @param address Ethereum address from frontend
   * @returns The newly created User
   */
  public async signup(req: ExRequest, address: string): Promise<User> {
    const checksumAddress = checksum.encode(address);
    const database = await connect('test');
    const collection = await database.collection<User>('users');

    let user = await collection.findOne({ address: checksumAddress });
    const nonce = Math.floor(Math.random() * 1000000);

    if (!user) {
      await collection.insertOne({
        joined: new Date().toISOString(),
        address: checksumAddress,
        settings: {
          theme: 'light',
          language: 'english'
        },
        role: 'regular',
        nonce
      });

      user = await collection.findOne({ address: checksumAddress });
    }

    return user;
  }

  /**
   * Login will get the User (created in the signup function above) from the db associated with an address,
   * create a message with the random nonce saved with that User object, verify the given signature to see
   * if the signature's message contains the correct nonce, and verify the signature's
   * Ethereum address matches the user's saved address.
   * If the signature and address are valid, a new JWT token is created and passed to the frontend.
   *
   * More about JTWs here: https://jwt.io/introduction/.
   * Important: don't forget to change the secret in the config file (and gitignore it!). That secret
   * will be used to create and validate JWT token for future requests.
   * @param req
   * @param address
   * @param signature
   * @returns User object with a newly created JWT token
   */
  public async login(req: ExRequest, address: string, signature: string): Promise<User> {
    const checksumAddress = checksum.encode(address);
    const database = await connect('test');
    const userCollection = await database.collection<User>('users');
    const user = await userCollection.findOne({ address: checksumAddress });
    
    if (user) {
      try {
        const msg = `Nonce: ${user.nonce}`;
        // Convert msg to hex string
        const msgHex = bufferToHex(Buffer.from(msg));

        // Check if signature is valid
        const msgBuffer = toBuffer(msgHex);
        const msgHash = hashPersonalMessage(msgBuffer);
        const signatureParams = fromRpcSig(signature);
        const publicKey = ecrecover(msgHash, signatureParams.v, signatureParams.r, signatureParams.s);
        const addressBuffer = publicToAddress(publicKey);
        const ethAddress = bufferToHex(addressBuffer);

        // Check if address matches
        if (ethAddress.toLowerCase() === user.address.toLowerCase()) {
          // Change user nonce
          const newNonce = Math.floor(Math.random() * 1000000);
          userCollection.updateOne(
            { address: checksumAddress },
            {
              $set: {
                nonce: newNonce
              }
            }
          );

          // Set jwt token
          const token = createJWT(req, user);

          const data = {
            ...user,
            token
          };

          return data;
        }
      } catch (e) {
        console.error('e', e);
      }
    }

    throw new CustomError({
      detail: 'Invalid login',
      instance: req.url,
      status: 401,
      title: 'invalidLogin', // maps to translations
      type: 'Unauthorized'
    });
  }
}
