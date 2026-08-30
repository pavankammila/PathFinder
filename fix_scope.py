import re
import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

clear_func = """  const clearExecutionState = useCallback(() => {
    setExecState(ExecutionState.IDLE);
    setSteps([]);
    setCurrentStepIndex(-1);
    setAlgoResult(null);
  }, []);"""

content = content.replace(clear_func, "")

content = content.replace(
    '  // Keyboard nudging',
    clear_func + '\n\n  // Keyboard nudging'
)

with open(filepath, 'w') as f:
    f.write(content)

print("Fixed scope")
