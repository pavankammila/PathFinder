import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace both logos with one responsive logo
pattern = r'<img src="/logo-full\.png"[^>]*className="hidden sm:block[^>]*/>\s*<div className="flex sm:hidden items-center gap-2"><img src="/logo-full\.png"[^>]*/></div>'
new_logo = '<img src="/logo-full.png" alt="PathFinder" className="block h-[24px] w-[72px] sm:h-[28px] sm:w-[84px] object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0" />'

content = re.sub(pattern, new_logo, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Combined logo!")
