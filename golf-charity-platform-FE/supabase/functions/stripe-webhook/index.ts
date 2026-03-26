import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-04-10',
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    )
  } catch (err) {
    return new Response(`Webhook error: ${(err as Error).message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try { switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const uid = session.metadata?.supabase_uid
      if (uid && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const interval = sub.items.data[0]?.plan?.interval ?? sub.items.data[0]?.price?.recurring?.interval
        await supabase.from('profiles').update({
          stripe_subscription_id: sub.id,
          stripe_customer_id: session.customer as string,
          subscription_status: sub.status as string,
          subscription_period: interval === 'year' ? 'yearly' : 'monthly',
          subscription_current_period_end: new Date((sub.current_period_end as number) * 1000).toISOString(),
        }).eq('id', uid)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const uid = sub.metadata?.supabase_uid
      if (uid) {
        const interval = sub.items.data[0]?.plan?.interval ?? sub.items.data[0]?.price?.recurring?.interval
        await supabase.from('profiles').update({
          subscription_status: sub.status as string,
          subscription_period: interval === 'year' ? 'yearly' : 'monthly',
          subscription_current_period_end: new Date((sub.current_period_end as number) * 1000).toISOString(),
        }).eq('id', uid)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const uid = sub.metadata?.supabase_uid
      if (uid) {
        await supabase.from('profiles').update({
          subscription_status: 'canceled',
          stripe_subscription_id: null,
        }).eq('id', uid)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      await supabase.from('profiles').update({
        subscription_status: 'past_due',
      }).eq('stripe_customer_id', customerId)
      break
    }
  }

  } catch (err) {
    console.error('Webhook handler error:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
