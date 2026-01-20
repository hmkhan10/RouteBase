import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { merchantId, items } = body

        if (!merchantId || !items || !Array.isArray(items)) {
            return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 })
        }

        // 1. Fetch Merchant Plan from Django Backend
        const djangoApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const merchantRes = await fetch(`${djangoApiUrl}/api/merchants/${merchantId}`)

        if (!merchantRes.ok) {
            // Fallback for demo if merchant not found
            console.warn(`Merchant ${merchantId} not found, using default plan.`)
        }

        const merchantData = merchantRes.ok ? await merchantRes.json() : { plan: 'FREE' }
        const isPro = merchantData.plan === 'PRO'

        // 2. Enforce Plan Restrictions
        if (!isPro && items.length > 5) {
            return NextResponse.json({
                success: false,
                message: "Free plan is limited to 5 items per cart. Upgrade to Pro for unlimited items."
            }, { status: 403 })
        }

        // 3. Create Checkout Session in Django
        const sessionId = `sess_${Math.random().toString(36).substring(7)}`
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0)

        try {
            await fetch(`${djangoApiUrl}/api/checkout/session/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantId,
                    items,
                    sessionId,
                    totalAmount
                })
            })
        } catch (err) {
            console.error("Failed to sync cart session to Django:", err)
            // We continue even if sync fails for demo, but in production we might want to handle this
        }

        // 4. Return Checkout URL
        const checkoutUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/pay/${merchantId}?amount=${totalAmount}&cart_session=true&session_id=${sessionId}`

        return NextResponse.json({
            success: true,
            checkoutUrl,
            sessionId
        })

    } catch (error) {
        console.error("Checkout Session Error:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
