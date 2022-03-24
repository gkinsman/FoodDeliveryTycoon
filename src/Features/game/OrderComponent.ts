import * as ex from 'excalibur'
import { Order } from '../orders'

export class OrderComponent extends ex.Component<'order'> {
  public readonly type = 'order'

  constructor(public order: Order) {
    super()
  }
}
