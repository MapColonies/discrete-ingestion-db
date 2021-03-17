import { Entity, Column, PrimaryColumn, Index, UpdateDateColumn, OneToMany, Generated, CreateDateColumn, ManyToOne } from 'typeorm';
import { OperationStatus } from '../../common/enums';
import { JobEntity } from './job';

@Entity('Job')
@Index('discreteIndex', ['id', 'version'], { unique: true })
export class TaskEntity {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  public id: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne(() => JobEntity, (job) => job.tasks)
  public jobId: string;

  @Column('varchar', { length: 255 })
  public type: string;

  @Column('jsonb')
  public parameters: Record<string, unknown>;

  @CreateDateColumn()
  public creationTime: Date;

  @UpdateDateColumn()
  public updateTime: Date;

  @Column({ type: 'enum', enum: OperationStatus })
  public status: OperationStatus;

  @Column('real')
  public percentage: number;

  @Column('varchar', { length: 255 })
  public reason: string;

  @Column('integer')
  public attempts: number;

  public constructor();
  public constructor(init: Partial<TaskEntity>);
  public constructor(...args: [] | [Partial<TaskEntity>]) {
    if (args.length === 1) {
      Object.assign(this, args[0]);
    }
  }
}
