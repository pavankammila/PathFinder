import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace(
    'import { \n  Play, Pause, SkipForward, RotateCcw, Plus, Link2, Trash2,\n  MapPin, Flag, Camera, Settings2, Map, Moon, Sun, Eraser\n} from \'lucide-react\';',
    'import { \n  Play, Pause, SkipForward, RotateCcw, Plus, Link2, Trash2,\n  MapPin, Flag, Camera, Settings2, Map, Moon, Sun, Eraser, Bot\n} from \'lucide-react\';'
)

# Move currentStep up
step_def = '  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;\n'
content = content.replace(step_def, '')
content = content.replace('  const buildTutorContext = useCallback(() => {', step_def + '  const buildTutorContext = useCallback(() => {')

with open(filepath, 'w') as f:
    f.write(content)
