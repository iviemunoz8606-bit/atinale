// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const { userId, poolId, poolName, entryFee, userEmail, userName } = await req.json()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const isLocal = appUrl.includes('localhost')

    const preference = new Preference(mp)

    const body: any = {
      items: [
        {
          id: poolId,
          title: `Atínale — ${poolName}`,
          quantity: 1,
          unit_price: entryFee,
          currency_id: 'MXN',
        },
      ],
      payer: {
        email: userEmail,
        name: userName,
      },
      external_reference: `${userId}|${poolId}`,
      notification_url: `${appUrl}/api/mp/webhook`,
    }

    // auto_return solo funciona en producción con HTTPS
    if (!isLocal) {
      body.back_urls = {
        success: `${appUrl}/pago/exitoso`,
        failure: `${appUrl}/pago/fallido`,
        pending: `${appUrl}/pago/pendiente`,
      }
      body.auto_return = 'approved'
    }

    const result = await preference.create({ body })

    return NextResponse.json({ url: result.init_point })
  } catch (error: any) {
    console.error('MP Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}