import { Body, Post, Request, Route } from 'tsoa';
import UsersService from './users.service';
import { User } from './user';

/**
 * Users controller
 */
@Route('api/users')
export class UsersController {
  @Post('signup')
  public async signup(@Request() req, @Body() params: { address: string; }): Promise<User> {
    const service = new UsersService();

    const user = await service.signup(req, params.address);

    return user;
  }

  @Post('login')
  public async login(@Request() req, @Body() params: { address: string, signature: string }): Promise<User> {
    const service = new UsersService();

    const user = await service.login(req, params.address, params.signature);

    return user;
  }
}
