import { Entity, Column, PrimaryColumn, Index, UpdateDateColumn, Generated, CreateDateColumn, ManyToOne } from 'typeorm';
import { OperationStatus } from '../../common/dataModels/enums';
import { JobEntity } from './job';

@Entity('Job')
@Index('discreteIndex', ['id', 'version'], { unique: true })
export class TaskEntity {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  public id: string;

  @ManyToOne(() => JobEntity, (job) => job.tasks, { nullable: false })
  public jobId: string;

  @Column('varchar', { length: 255 })
  public type: string;

  @Column('jsonb', { nullable: false })
  public parameters: Record<string, unknown>;

  @CreateDateColumn()
  public creationTime: Date;

  @UpdateDateColumn()
  public updateTime: Date;

  @Column({ type: 'enum', enum: OperationStatus, default: OperationStatus.PENDING, nullable: false })
  public status: OperationStatus;

  @Column('smallint', { nullable: true })
  public percentage: number;

  @Column('varchar', { length: 255, default: '', nullable: false })
  public reason: string;

  @Column('integer', { nullable: false, default: 0 })
  public attempts: number;

  public constructor();
  public constructor(init: Partial<TaskEntity>);
  public constructor(...args: [] | [Partial<TaskEntity>]) {
    if (args.length === 1) {
      Object.assign(this, args[0]);
    }
  }
}
