import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const FROM_EMAIL = 'envio@fotografiaescolar.duploefeito.com'
const ADMIN_EMAIL = 'gomes@duploefeito.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function sendEmail(to: string[], subject: string, html: string) {
  console.log(`Attempting to send email to: ${to.join(', ')}`)
  
  const client = new SMTPClient({
    connection: {
      hostname: "fotografiaescolar.duploefeito.com",
      port: 465,
      tls: true,
      auth: {
        username: "envio@fotografiaescolar.duploefeito.com",
        password: "Imacdejose1506!",
      },
    },
  });

  try {
    for (const recipient of to) {
      const send = await client.send({
        from: FROM_EMAIL,
        to: recipient,
        subject: subject,
        html: html,
      });
      console.log(`Successfully sent email to ${recipient}:`, send)
    }
  } finally {
    await client.close();
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderId, type } = await req.json()
    console.log(`Processing order email for order ${orderId}, type: ${type}`)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        students (
          name
        ),
        shipping_methods (
          name
        ),
        order_items (
          quantity,
          price_at_time,
          photos (
            url
          ),
          products (
            name
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order:', orderError)
      throw new Error(`Error fetching order: ${orderError?.message || 'Order not found'}`)
    }

    console.log('Successfully fetched order data')

    const orderItemsHtml = order.order_items.map(item => `
      <tr>
        <td>${item.products.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price_at_time}€</td>
        <td><a href="${item.photos.url}">Ver foto</a></td>
      </tr>
    `).join('')

    const shippingInfo = order.shipping_methods 
      ? `<p>Método de envio: ${order.shipping_methods.name}</p>
         <p>Morada: ${order.shipping_address}, ${order.shipping_postal_code} ${order.shipping_city}</p>`
      : ''

    const isCreatedEmail = type === 'created'
    const subject = isCreatedEmail 
      ? `Nova encomenda #${orderId}`
      : `Pagamento recebido - Encomenda #${orderId}`

    const emailHtml = `
      <h1>${isCreatedEmail ? 'Nova encomenda' : 'Pagamento confirmado'}</h1>
      <p>Olá ${order.shipping_name},</p>
      <p>${isCreatedEmail 
          ? 'A sua encomenda foi criada com sucesso.' 
          : 'O pagamento da sua encomenda foi confirmado.'}</p>
      <h2>Detalhes da encomenda #${orderId}</h2>
      <p>Cliente: ${order.shipping_name}</p>
      <p>Email: ${order.email}</p>
      <p>Telefone: ${order.shipping_phone}</p>
      ${shippingInfo}
      <h3>Produtos:</h3>
      <table>
        <tr>
          <th>Produto</th>
          <th>Quantidade</th>
          <th>Preço</th>
          <th>Foto</th>
        </tr>
        ${orderItemsHtml}
      </table>
      <p><strong>Total: ${order.total_amount}€</strong></p>
    `

    // Send email to customer and admin
    await sendEmail([order.email, ADMIN_EMAIL], subject, emailHtml)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-order-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

serve(handler)