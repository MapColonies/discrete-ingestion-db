import { Entity, Column, PrimaryGeneratedColumn, Index, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Status } from '../../common/constants';
import { DiscreteTaskEntity } from './discreteTask';

@Entity('partialTask')
// @Index()
export class PartialTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne((type) => DiscreteTaskEntity)
  @JoinColumn([
    { name: 'discrete_id', referencedColumnName: 'id' },
    { name: 'discrete_version', referencedColumnName: 'version' },
  ])
  public discrete: DiscreteTaskEntity;

  @Column({ name: 'min_zoom' })
  public minZoom: number;

  @Column({ name: 'max_zoom' })
  public maxZoom: number;

  @UpdateDateColumn({ name: 'update_date' })
  public updateDate: Date;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  public status: Status;

  @Column('varchar', { length: 300, default: '' })
  public reason: string;

  @Column({ default: 0 })
  public retries: number;

  public constructor();
  public constructor(init: Partial<PartialTaskEntity>);
  public constructor(discrete: DiscreteTaskEntity, minZoom: number, maxZoom: number);
  public constructor(...args: [] | [Partial<PartialTaskEntity>] | [DiscreteTaskEntity, number, number]) {
    const initializerObjectLength = 1;
    const initializerParametersLength = 3;
    switch (args.length) {
      case initializerObjectLength:
        Object.assign(this, args[0]);
        break;
      case initializerParametersLength:
        this.discrete = args[0];
        this.minZoom = args[1];
        this.maxZoom = args[2];
        break;
      default:
        break;
    }
  }
}
