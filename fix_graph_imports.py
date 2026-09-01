import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useEffect, useRef } from 'react';", "import React, { useEffect, useRef, useState } from 'react';")

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)
print("Added useState")
