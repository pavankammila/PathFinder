import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = "import { useState, useCallback, useEffect, useRef } from 'react';\n" + content

with open(filepath, 'w') as f:
    f.write(content)
