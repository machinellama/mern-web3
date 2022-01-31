import { Get, Query, Request, Route } from 'tsoa';

import { Character } from './character';
import { validateJWT } from '../../util/auth';
import CharactersService from './characters.service';

/**
 * Characters controller
 */
@Route('api/characters')
export class CharactersController {

  @Get('')
  public async getController(
    @Request() request,
    @Query() id?: number,
    @Query() limit?: number,
    @Query() offset?: number
  ): Promise<Character | Character[]> {
    const user = validateJWT(request);

    const service = new CharactersService();

    return await service.genericGet('characters', {id, limit, offset});
  }
}
