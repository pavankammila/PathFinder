import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Desktop
old_desktop = '<img \n            src="/logo-full.png" \n            alt="PathFinder" \n            className="hidden sm:block h-6 sm:h-7 w-auto object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0 transition-all"\n          />'
new_desktop = '<img src="/logo-full.png" alt="PathFinder" className="hidden sm:block h-[28px] w-[84px] object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0" />'

# Find the exact desktop img string
pattern1 = r'<img[^>]*src="/logo-full\.png"[^>]*className="[^"]*transition-all"[^>]*/>'
content = re.sub(pattern1, new_desktop, content)

# Mobile
pattern2 = r'<div className="flex sm:hidden items-center gap-2">\s*<img[^>]*src="/logo-icon\.png"[^>]*/>\s*<h1[^>]*>Pathfinder</h1>\s*</div>'
new_mobile = '<div className="flex sm:hidden items-center gap-2"><img src="/logo-icon.png" alt="PathFinder Icon" className="h-[20px] w-[20px] object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0" /></div>'
content = re.sub(pattern2, new_mobile, content)

# Subtitle
pattern3 = r'<span className="text-\[9px\] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">Shortest Path</span>\s*<span className="text-\[9px\] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mt-0\.5">Algorithm Laboratory</span>'
new_subtitle = '<span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider antialiased leading-none">Shortest Path</span>\n            <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider antialiased leading-none mt-0.5">Algorithm Laboratory</span>'
content = re.sub(pattern3, new_subtitle, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed")
