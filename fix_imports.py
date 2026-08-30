import re
import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace(
    'import { \n  Play, Pause, SkipForward, RotateCcw, Plus, Link2, Trash2,\n  MapPin, Flag, Camera, Settings2, Map, Moon, Sun, Eraser\n} from \'lucide-react\';',
    'import { \n  Play, Pause, SkipForward, RotateCcw, Plus, Link2, Trash2,\n  MapPin, Flag, Camera, Settings2, Map, Moon, Sun, Eraser, Bot\n} from \'lucide-react\';'
)

content = content.replace(
    'import { CameraModal } from \'./components/CameraModal\';',
    'import { CameraModal } from \'./components/CameraModal\';\nimport { AITutorPanel } from \'./components/AITutorPanel\';'
)

with open(filepath, 'w') as f:
    f.write(content)

