import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export default class AddCategoryColumnFKInTransactionTable1606922501920
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'category_id',
        type: 'uuid',
        isNullable: true, // in case the category this register refers to is deleted from the DB, we can set this field to null
      }),
    );

    await queryRunner.createForeignKey(
      'transactions', // table that contains the FK
      new TableForeignKey({
        name: 'CategoryFK', // name of the FK
        columnNames: ['category_id'], // which column is the FK
        referencedTableName: 'categories', // which table this FK refers to
        referencedColumnNames: ['id'], // to which column of the referenced table this FK refers to
        onDelete: 'SET NULL', // upon deleting the refered category, set this field to NULL
        onUpdate: 'CASCADE', // upon updating the referenced category id, update this field
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'CategoryFK');
    await queryRunner.dropColumn('transactions', 'category_id');
  }
}
