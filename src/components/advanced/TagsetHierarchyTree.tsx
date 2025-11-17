import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronDown, Check, X } from 'lucide-react';
import { Tagset } from '@/hooks/useTagsets';

interface TagsetNode extends Tagset {
  children: TagsetNode[];
}

interface TagsetHierarchyTreeProps {
  tagsets: Tagset[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function TagsetHierarchyTree({
  tagsets,
  selectedIds,
  onToggleSelect,
  onApprove,
  onReject
}: TagsetHierarchyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Construir árvore hierárquica
  const buildTree = (items: Tagset[]): TagsetNode[] => {
    const map = new Map<string, TagsetNode>();
    const roots: TagsetNode[] = [];

    // Criar nós
    items.forEach(item => {
      map.set(item.codigo, { ...item, children: [] });
    });

    // Construir hierarquia
    items.forEach(item => {
      const node = map.get(item.codigo)!;
      if (item.categoria_pai) {
        const parent = map.get(item.categoria_pai);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots.sort((a, b) => a.codigo.localeCompare(b.codigo));
  };

  const toggleExpand = (codigo: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(codigo)) {
        next.delete(codigo);
      } else {
        next.add(codigo);
      }
      return next;
    });
  };

  const renderNode = (node: TagsetNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.codigo);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedIds.includes(node.id);
    const needsApproval = node.status !== 'ativo' && !node.aprovado_por;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-3 hover:bg-accent/50 rounded-md transition-colors ${
            level > 0 ? 'ml-6' : ''
          }`}
        >
          {/* Expand/Collapse */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node.codigo)}
              className="w-5 h-5 flex items-center justify-center hover:bg-accent rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(node.id)}
          />

          {/* Código */}
          <Badge variant="outline" className="font-mono text-xs">
            {node.codigo}
          </Badge>

          {/* Nome */}
          <span className="font-semibold flex-1">{node.nome}</span>

          {/* Status */}
          {node.status === 'ativo' && (
            <Badge className="bg-green-600 text-xs">Ativo</Badge>
          )}
          {needsApproval && (
            <Badge variant="secondary" className="text-xs">
              Pendente
            </Badge>
          )}
          {node.aprovado_por && (
            <Badge variant="outline" className="text-xs">
              ✓ Aprovado
            </Badge>
          )}

          {/* Ações rápidas */}
          {needsApproval && onApprove && onReject && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => onApprove(node.id)}
              >
                <Check className="w-4 h-4 text-green-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => onReject(node.id)}
              >
                <X className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          )}
        </div>

        {/* Descrição e exemplos (quando expandido) */}
        {isExpanded && (
          <div className="ml-14 mb-2 text-sm text-muted-foreground space-y-1">
            {node.descricao && <p>{node.descricao}</p>}
            {node.exemplos && node.exemplos.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs font-semibold">Exemplos:</span>
                {node.exemplos.map((ex, i) => (
                  <Badge key={i} variant="secondary" className="font-mono text-xs">
                    {ex}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Renderizar filhos */}
        {isExpanded && hasChildren && (
          <div className="ml-3 border-l-2 border-border/50">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(tagsets);

  return (
    <div className="space-y-1">
      {tree.map(node => renderNode(node))}
    </div>
  );
}
