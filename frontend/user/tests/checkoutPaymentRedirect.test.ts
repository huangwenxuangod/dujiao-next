import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveCheckoutPaymentRedirect } from '../src/utils/paymentResumePolicy.ts'

test('checkout uses the initial redirect payment URL without reopening the payment page', () => {
  assert.equal(
    resolveCheckoutPaymentRedirect({
      interaction_mode: 'redirect',
      pay_url: 'https://pay.example.test/checkout/123',
    }),
    'https://pay.example.test/checkout/123',
  )
})

test('checkout keeps QR, paid, and incomplete payment results on the payment page', () => {
  assert.equal(resolveCheckoutPaymentRedirect({ interaction_mode: 'qr', pay_url: 'https://pay.example.test/qr' }), '')
  assert.equal(resolveCheckoutPaymentRedirect({ interaction_mode: 'redirect', pay_url: '' }), '')
  assert.equal(resolveCheckoutPaymentRedirect({ order_paid: true, interaction_mode: 'redirect', pay_url: 'https://pay.example.test/paid' }), '')
})
