import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace the mobile logo div
pattern = r'<div className="flex sm:hidden items-center gap-2"><img src="/logo-icon\.png" alt="PathFinder Icon" className="h-\[20px\] w-\[20px\] object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0" /></div>'
new_mobile = '<div className="flex sm:hidden items-center gap-2"><img src="/logo-full.png" alt="PathFinder" className="h-[24px] w-[72px] object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0" /></div>'

content = re.sub(pattern, new_mobile, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed mobile logo")
