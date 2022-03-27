import * as ex from 'excalibur'

export class NeedsPaymentComponent extends ex.Component<'payment'> {
  public readonly type = 'payment'

  constructor(public timeSinceLastPayment: number) {
    super()
  }
}
