import { Entity, Column, PrimaryColumn, Index, UpdateDateColumn, Generated, CreateDateColumn, OneToMany } from 'typeorm';
import { OperationStatus } from '../../common/dataModels/enums';
import { TaskEntity } from './task';

@Entity('Job')
@Index('jobResourceIndex', ['resourceId', 'version'], { unique: false })
@Index('jobStatusIndex', ['status'], { unique: false })
@Index('jobCleanedIndex', ['isCleaned'], { unique: false })
export class JobEntity {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  public id: string;

  @Column('varchar', { length: 300 })
  public resourceId: string;

  @Column('varchar', { length: 30 })
  public version: string;

  @Column('varchar', { length: 255 })
  public type: string;

  @Column('varchar', { length: 2000 })
  public description: string;

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

  @Column('boolean')
  public isCleaned: boolean;

  @OneToMany(() => TaskEntity, (task) => task.jobId, {
    cascadeInsert: true,
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
