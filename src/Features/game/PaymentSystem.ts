import { PaymentComponent } from './PaymentComponent'
import * as ex from 'excalibur'
import { Entity } from 'excalibur'
import { RiderEntity } from '../riders'
import { matMotionPhotosAuto } from '@quasar/extras/material-icons'
import { useGameState } from '../game-state'

export class PaymentSystem extends ex.System<PaymentComponent> {
  readonly types = ['payment'] as const

  public systemType = ex.SystemType.Update

  update(entities: RiderEntity[], delta: number): void {
    const { removeMoney } = useGameState()

    let riderFees = 0

    for (const entity of entities) {
      const payment = entity.get('payment') as PaymentComponent
      payment.addTimeSinceLastPayment(delta)

      if (payment.timeSinceLastPayment > 10000) {
        riderFees += 2
        payment.reset()
      }
    }

    if (riderFees > 0) {
      removeMoney(riderFees, 'Rider salaries!')
    }
  }
}
