import * as ex from 'excalibur'

export class PaymentComponent extends ex.Component<'payment'> {
  public readonly type = 'payment'

  constructor(public timeSinceLastPayment: number) {
    super()
  }

  addTimeSinceLastPayment(time: number) {
    this.timeSinceLastPayment += time
  }

  reset() {
    this.timeSinceLastPayment = 0
  }
}
