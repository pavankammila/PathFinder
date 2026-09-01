import re
with open('src/App.tsx', 'r') as f:
    c = f.read()
if 'h-screen w-screen bg-transparent' in c:
    print("Found exact h-screen w-screen")
