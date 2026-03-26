import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WinnerPayload {
  winnerIds: string[]
  drawDate: string
  prizeAmounts: Record<string, number>
  tierLabels: Record<string, string>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { winnerIds, drawDate, prizeAmounts, tierLabels }: WinnerPayload = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const results = []

    for (const userId of winnerIds) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
      const email = userData?.user?.email
      const name = userData?.user?.user_metadata?.full_name ?? 'Winner'
      if (!email) continue

      const prize = prizeAmounts[userId] ?? 0
      const tier = tierLabels[userId] ?? 'Match'

      const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:16px">
          <h1 style="color:#10b981;font-size:24px;margin-bottom:8px">🏆 Congratulations, ${name}!</h1>
          <p style="color:#94a3b8;margin-bottom:24px">You've won a prize in the GolfGives draw on ${new Date(drawDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
          <div style="background:#1e293b;border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="margin:0;font-size:14px;color:#64748b">${tier}</p>
            <p style="margin:8px 0 0;font-size:32px;font-weight:700;color:#10b981">£${prize.toFixed(2)}</p>
          </div>
          <p style="color:#94a3b8;font-size:14px">Log in to your GolfGives account and visit <strong>Draw & Prizes</strong> to upload your proof and claim your prize.</p>
          <a href="${Deno.env.get('SITE_URL') ?? 'https://golfgives.com'}/dashboard/draw"
             style="display:inline-block;margin-top:20px;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Claim Your Prize →
          </a>
          <p style="color:#334155;font-size:12px;margin-top:32px">GolfGives · Golf. Draw. Impact.</p>
        </div>
      `

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'GolfGives <noreply@golfgives.com>',
          to: [email],
          subject: `🏆 You won £${prize.toFixed(2)} in the GolfGives draw!`,
          html,
        }),
      })

      const data = await res.json()
      results.push({ userId, email, status: res.ok ? 'sent' : 'failed', data })
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
