import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DomainModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domainData: {
    nome: string;
    cor: string;
    ocorrencias: number;
    percentual: number;
    riquezaLexical: number;
    avgLL?: number;
    palavras: string[];
  } | null;
  onWordClick: (word: string) => void;
}

export function DomainModal({ open, onOpenChange, domainData, onWordClick }: DomainModalProps) {
  if (!domainData) return null;

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <motion.div 
                    className="w-5 h-5 rounded-full shadow-md" 
                    style={{ backgroundColor: domainData.cor }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  />
                  <span className="text-2xl">{domainData.nome}</span>
                </DialogTitle>
                <DialogDescription>
                  Análise completa do domínio semântico e suas palavras-chave
                </DialogDescription>
              </DialogHeader>

        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {/* Estatísticas em Cards */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-2" style={{ borderColor: domainData.cor }}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Ocorrências</span>
                  </div>
                  <div className="text-3xl font-bold">{domainData.ocorrencias.toLocaleString()}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="border-2" style={{ borderColor: domainData.cor }}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">do Corpus</span>
                  </div>
                  <div className="text-3xl font-bold">{domainData.percentual.toFixed(2)}%</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-2" style={{ borderColor: domainData.cor }}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Riqueza Lexical</span>
                  </div>
                  <div className="text-3xl font-bold">{domainData.riquezaLexical}</div>
                  <p className="text-xs text-muted-foreground mt-1">palavras únicas</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Barra de distribuição no corpus */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Distribuição no Corpus</span>
              <span className="text-sm text-muted-foreground">{domainData.percentual.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-background rounded-full h-3 overflow-hidden">
              <div 
                className="h-3 rounded-full transition-all duration-500 shadow-sm" 
                style={{ 
                  width: `${domainData.percentual}%`,
                  backgroundColor: domainData.cor 
                }} 
              />
            </div>
          </div>

          {/* Palavras-chave do domínio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span>Palavras-chave do domínio</span>
              <Badge variant="secondary">{domainData.palavras.length}</Badge>
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Clique em qualquer palavra para ver suas concordâncias (KWIC)
            </p>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-muted/20 rounded-lg">
              {domainData.palavras.sort().map((palavra, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + idx * 0.02 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    className="cursor-pointer hover:shadow-lg transition-all text-sm px-3 py-1.5 border-0"
                    style={{
                      backgroundColor: domainData.cor,
                      color: '#fff'
                    }}
                    onClick={() => {
                      onOpenChange(false);
                      onWordClick(palavra);
                    }}
                  >
                    {palavra}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Informação adicional */}
          {domainData.avgLL && (
            <motion.div 
              className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Significância Estatística Média
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Log-Likelihood médio: <strong>{domainData.avgLL.toFixed(2)}</strong>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
