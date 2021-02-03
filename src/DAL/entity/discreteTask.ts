import { Entity, Column, PrimaryColumn, Index, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Status } from '../../common/constants';
import { StatusMetadata } from '@map-colonies/mc-model-types';
import { PartialTaskEntity } from './partialTask';

@Entity('discreteTask')
@Index('discreteIndex', ['id', 'version'], { unique: true })
export class DiscreteTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  public generated: string;

  @Column('varchar', { length: 300 })
  public id: string;

  @Column('varchar', { length: 30 })
  public version: string;

  @OneToMany((type) => PartialTaskEntity, (task) => task.discrete)
  public tasks: PartialTaskEntity[];

  @Column('simple-json')
  public metadata: StatusMetadata;

  @UpdateDateColumn()
  public updateDate: Date;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  public status: Status;

  @Column('varchar', { length: 300, default: '' })
  public reason: string;

  public constructor();
  public constructor(init: Partial<DiscreteTaskEntity>);
  public constructor(discreteId: string, version: string, metadata: StatusMetadata);
  public constructor(...args: [] | [Partial<DiscreteTaskEntity>] | [string, string, StatusMetadata]) {
    const initializerObjectLength = 1;
    const initializerParametersLength = 3;
    console.log(`Create: ${JSON.stringify(args)}`);
    switch (args.length) {
      case initializerObjectLength:
        Object.assign(this, args[0]);
        break;
      case initializerParametersLength:
        this.id = args[0];
        this.version = args[1];
        this.metadata = args[2];
        break;
      default:
        break;
    }
  }
}
