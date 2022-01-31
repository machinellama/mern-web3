import { Request as ExRequest } from 'express';
import { bufferToHex, ecrecover, fromRpcSig, hashPersonalMessage, publicToAddress, toBuffer } from 'ethereumjs-util';

import { connect } from '../../util/mongo';
import { User } from './user';
import { CustomError } from '../../util/errors';
import { createJWT, validateJWT } from '../../util/auth';

/**
 * Users Service
 */
export default class UsersService {
  public async signup(req: ExRequest, address: string): Promise<User> {
    const database = await connect('test');
    const collection = await database.collection<User>('users');

    let user = await collection.findOne({ address });
    const nonce = Math.floor(Math.random() * 1000000);

    if (!user) {
      await collection.insertOne({
        joined: new Date().toISOString(),
        address,
        settings: {
          theme: 'light',
          language: 'english'
        },
        role: 'regular',
        nonce
      });

      user = await collection.findOne({ address });
    }

    return user;
  }

  public async login(req: ExRequest, address: string, signature: string): Promise<User> {
    const database = await connect('test');
    const userCollection = await database.collection<User>('users');
    const user = await userCollection.findOne({ address });

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
        const addresBuffer = publicToAddress(publicKey);
        const ethAddress = bufferToHex(addresBuffer);

        // Check if address matches
        if (ethAddress.toLowerCase() === user.address.toLowerCase()) {
          // Change user nonce
          const newNonce = Math.floor(Math.random() * 1000000);
          userCollection.updateOne(
            { address: ethAddress },
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
