/**
 * By default, pg was returning string for transaction.value, so I had to force the conversion to number
 * (see Transaction entity, column value)
 */

export default class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }

  from(data: string): number {
    return parseFloat(data);
  }
}
