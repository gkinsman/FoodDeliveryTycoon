import { NeedsPaymentComponent } from './NeedsPaymentComponent'
import * as ex from 'excalibur'
import { Entity } from 'excalibur'
import { RiderEntity } from '../riders'
import { matMotionPhotosAuto } from '@quasar/extras/material-icons'
import { useGameState } from '../game-state'

export class PaymentSystem extends ex.System<NeedsPaymentComponent> {
  readonly types = ['payment'] as const

  public systemType = ex.SystemType.Update

  private timeSinceLastPayment: number = 0

  update(entities: RiderEntity[], delta: number): void {
    const { removeMoney } = useGameState()

    const numberOfRiders = entities.length

    this.timeSinceLastPayment += delta

    if (this.timeSinceLastPayment > 20000) {
      const riderFees = numberOfRiders * 1 // $2 per rider

      if (riderFees > 0) {
        removeMoney(riderFees, 'Rider salaries!')
      }

      this.timeSinceLastPayment = 0
    }
  }
}
