import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Category from './Category';
import ColumnNumericTransformer from './transformer/ColumnNumericTransformer'; // convert the value returned by postgres to number

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ transformer: new ColumnNumericTransformer() })
  value: number;

  @Column()
  type: string;

  // FK
  @Column({ name: 'category_id' })
  categoryId: string;

  // Object that this FK references to (by using the category_id field)
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;
}

export default Transaction;
