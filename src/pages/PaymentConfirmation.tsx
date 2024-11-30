import { useLocation, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentConfirmation = () => {
  const location = useLocation();
  const paymentDetails = location.state?.paymentDetails;

  if (!paymentDetails) {
    return <Navigate to="/" replace />;
  }

  const { entity, reference, amount, shippingCost = 0, subtotal = amount - shippingCost } = paymentDetails;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 space-y-6 animate-fade-up">
          <div className="flex items-center gap-4 pb-6 border-b">
            <Button variant="ghost" onClick={() => window.location.href = '/'} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar à Loja
            </Button>
            <h1 className="text-2xl font-bold">Confirmação de Pagamento</h1>
          </div>

          <div className="space-y-6">
            <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold">Dados para Pagamento Multibanco</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Entidade</p>
                  <p className="text-lg font-medium">{entity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Referência</p>
                  <p className="text-lg font-medium">{reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montante</p>
                  <p className="text-lg font-medium">{amount}€</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Resumo do Pagamento</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{subtotal}€</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Portes de Envio</span>
                  <span>{shippingCost}€</span>
                </div>
                <div className="flex justify-between py-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">{amount}€</span>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-center text-muted-foreground">
                Por favor efetue o pagamento utilizando os dados acima. Após confirmação do pagamento, receberá um email com os detalhes da sua encomenda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;