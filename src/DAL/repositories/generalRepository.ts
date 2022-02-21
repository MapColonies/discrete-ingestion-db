import { container } from 'tsyringe';
import { Repository } from 'typeorm';
import { Services } from '../../common/constants';
import { IConfig, IDbConfig } from '../../common/interfaces';

export class GeneralRepository<T> extends Repository<T> {
  private readonly config: IConfig;
  public constructor() {
    super();
    this.config = container.resolve(Services.CONFIG);
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public async queryEnhanced(query: string, parameters?: any[] | undefined): Promise<any> {
    const { schema } = this.config.get<IDbConfig>('typeOrm');
    await this.query(`SET search_path TO "${schema as string}", public`);
    return this.query(query, parameters);
  }
}
