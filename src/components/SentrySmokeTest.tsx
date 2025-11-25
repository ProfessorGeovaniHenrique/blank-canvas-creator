import { Button } from "@/components/ui/button";
import { AlertTriangle, Bug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { captureException } from "@/lib/sentry";
import { toast } from "@/hooks/use-toast";

/**
 * Component for testing Sentry integration in development
 * Provides buttons to force frontend and backend errors
 */
export const SentrySmokeTest = () => {
  const testFrontendError = () => {
    try {
      // Create deliberate error
      const testError = new Error('🧪 Sentry Frontend Smoke Test - This is a deliberate error');
      
      // Manually capture and send to Sentry
      captureException(testError, {
        level: 'error',
        tags: {
          test_type: 'smoke_test',
          trigger: 'manual_button_click',
          category: 'frontend_test'
        },
        extra: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      });
      
      toast({
        title: "Error Sent to Sentry",
        description: "Check your Sentry dashboard for the test error",
        variant: "default",
      });
      
      console.log('✅ Test error captured and sent to Sentry');
    } catch (err) {
      console.error('Failed to send test error:', err);
    }
  };

  const testBackendError = async () => {
    try {
      const { error } = await supabase.functions.invoke('test-sentry-error', {
        body: { test: true }
      });
      
      if (error) {
        console.error('Backend test error captured:', error);
      }
    } catch (err) {
      console.error('Error calling test function:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="text-lg font-semibold">Testes de Integração Sentry</h3>
      </div>
      
      <div className="flex gap-3">
        <Button
          variant="destructive"
          onClick={testFrontendError}
          className="flex-1"
        >
          <Bug className="h-4 w-4 mr-2" />
          Testar Erro Frontend
        </Button>
        
        <Button
          variant="outline"
          onClick={testBackendError}
          className="flex-1"
        >
          <Bug className="h-4 w-4 mr-2" />
          Testar Erro Backend
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mt-3">
        Após clicar, verifique o dashboard do Sentry para confirmar que os erros foram capturados corretamente.
      </p>
    </div>
  );
};
