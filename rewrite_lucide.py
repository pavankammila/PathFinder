import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Remove any accidental 'import {\n  Bot,'
content = content.replace('import {\n  Bot,', 'import {')

# The current import should be like:
# import { 
#   Play, Pause, SkipForward, RotateCcw, Plus, Link2, Trash2,
#   MapPin, Flag, Camera, Settings2, Map, Moon, Sun, Eraser, Bot
# } from 'lucide-react';

# Let's just find "from 'lucide-react'" and replace the whole block.
lucide_pattern = re.compile(r"import\s+\{.*?\s*\}\s+from\s+'lucide-react';", re.DOTALL)

def replace_lucide(match):
    return '''import { 
  Play, Pause, SkipForward, RotateCcw, Plus, Link2, Trash2,
  MapPin, Flag, Camera, Settings2, Map, Moon, Sun, Eraser, Bot
} from 'lucide-react';'''

content = lucide_pattern.sub(replace_lucide, content)

with open(filepath, 'w') as f:
    f.write(content)

