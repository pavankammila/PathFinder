import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add comparisonResults state to App.tsx
state_declarations = r"  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);"
new_state_declarations = "  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);\n  const [comparisonResults, setComparisonResults] = useState<any[]>([]);"
content = content.replace(state_declarations, new_state_declarations)

# Update CompareAlgorithmsModal usage
old_modal = r"<CompareAlgorithmsModal\n        isOpen={isCompareModalOpen}\n        onClose={() => setIsCompareModalOpen(false)}\n        graph={{ nodes, edges }}\n        sourceId={sourceNodeId}\n        destId={destNodeId}\n      />"
new_modal = """<CompareAlgorithmsModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        graph={{ nodes, edges }}
        sourceId={sourceNodeId}
        destId={destNodeId}
        onResultsUpdate={setComparisonResults}
      />"""
content = content.replace(old_modal, new_modal)

# Update buildContext
build_context_old = r"result: algoResult\n    };"
build_context_new = """result: algoResult,
      comparisonResults: comparisonResults.length > 0 ? comparisonResults : undefined
    };"""
content = content.replace(build_context_old, build_context_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/CompareAlgorithmsModal.tsx', 'r') as f:
    content = f.read()

props_old = r"interface CompareModalProps {\n  isOpen: boolean;\n  onClose: () => void;\n  graph: { nodes: Node[]; edges: Edge[] };\n  sourceId: string | null;\n  destId: string | null;\n}"
props_new = """interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  graph: { nodes: Node[]; edges: Edge[] };
  sourceId: string | null;
  destId: string | null;
  onResultsUpdate?: (results: any[]) => void;
}"""
content = content.replace(props_old, props_new)

old_comp_def = r"export function CompareAlgorithmsModal\({ isOpen, onClose, graph, sourceId, destId }: CompareModalProps\) {"
new_comp_def = "export function CompareAlgorithmsModal({ isOpen, onClose, graph, sourceId, destId, onResultsUpdate }: CompareModalProps) {"
content = re.sub(old_comp_def, new_comp_def, content)

old_set_res = r"setResults\(\[\.\.\.runResults\]\);"
new_set_res = "setResults([...runResults]);\n      if (onResultsUpdate) onResultsUpdate([...runResults]);"
content = content.replace(old_set_res, new_set_res)

with open('src/components/CompareAlgorithmsModal.tsx', 'w') as f:
    f.write(content)
