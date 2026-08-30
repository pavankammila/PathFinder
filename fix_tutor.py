import re

filepath = 'src/components/AITutorPanel.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_props = """interface AITutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  buildContext: () => any;
}

export function AITutorPanel({ isOpen, onClose, buildContext }: AITutorPanelProps) {"""
new_props = """interface AITutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  buildContext: () => any;
  externalQuery?: string;
  onExternalQueryHandled?: () => void;
}

export function AITutorPanel({ isOpen, onClose, buildContext, externalQuery, onExternalQueryHandled }: AITutorPanelProps) {"""
content = content.replace(old_props, new_props)

old_effect = """  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);"""
new_effect = """  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (externalQuery && isOpen) {
      handleSend(externalQuery);
      onExternalQueryHandled?.();
    }
  }, [externalQuery, isOpen]);"""
content = content.replace(old_effect, new_effect)

with open(filepath, 'w') as f:
    f.write(content)
