import { Entity, Column, PrimaryColumn, Index, UpdateDateColumn, Generated, CreateDateColumn, OneToMany } from 'typeorm';
import { OperationStatus } from '../../common/dataModels/enums';
import { TaskEntity } from './task';

@Entity('Job')
@Index('jobResourceIndex', ['resourceId', 'version'], { unique: false })
@Index('jobStatusIndex', ['status'], { unique: false })
@Index('jobTypeIndex', ['type'], { unique: false })
@Index('jobCleanedIndex', ['isCleaned'], { unique: false })
export class JobEntity {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  public id: string;

  @Column('varchar', { length: 300, nullable: false })
  public resourceId: string;

  @Column('varchar', { length: 30, nullable: false })
  public version: string;

  @Column('varchar', { length: 255, nullable: false })
  public type: string;

  @Column('varchar', { length: 2000, default: '', nullable: false })
  public description: string;

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

  @Column('boolean', { default: false, nullable: false })
  public isCleaned: boolean;

  @OneToMany(() => TaskEntity, (task) => task.jobId, {
    cascade: true,
  })
  public tasks: TaskEntity[];

  public constructor();
  public constructor(init: Partial<JobEntity>);
  public constructor(...args: [] | [Partial<JobEntity>]) {
    if (args.length === 1) {
      Object.assign(this, args[0]);
    }
  }
}
