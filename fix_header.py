import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Desktop logo: remove transition-all, set exact pixel rendering or remove w-auto if it causes fractional scaling.
# h-7 is 28px. 28 * 3 = 84.
desktop_logo_regex = r'<img\s+src="/logo-full\.png"\s+alt="PathFinder"\s+className="hidden sm:block h-6 sm:h-7 w-auto object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0 transition-all"\s*/>'
desktop_logo_repl = r'<img src="/logo-full.png" alt="PathFinder" className="hidden sm:block h-[28px] w-[84px] object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0 style={{ imageRendering: \'crisp-edges\' }}" />'
# Wait, let's just do standard tailwind classes
desktop_logo_repl = r'<img src="/logo-full.png" alt="PathFinder" className="hidden sm:block h-7 w-[84px] object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0" />'
content = re.sub(desktop_logo_regex, desktop_logo_repl, content)

# Mobile icon: remove HTML text and set exact dimensions.
mobile_logo_regex = r'<div className="flex sm:hidden items-center gap-2">\s*<img\s+src="/logo-icon\.png"\s+alt="PathFinder Icon"\s+className="h-5 w-auto object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0 transition-all"\s*/>\s*<h1 className="text-\[12px\] font-bold tracking-widest uppercase leading-none">Pathfinder</h1>\s*</div>'
mobile_logo_repl = r'<div className="flex sm:hidden items-center justify-center w-full">\s*<img src="/logo-icon.png" alt="PathFinder Icon" className="h-6 w-6 object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0" />\s*</div>'
content = re.sub(mobile_logo_regex, mobile_logo_repl, content)

# Subtitle
subtitle_regex = r'<span className="text-\[9px\] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">Shortest Path</span>\s*<span className="text-\[9px\] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mt-0\.5">Algorithm Laboratory</span>'
subtitle_repl = r'<span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider antialiased leading-none">Shortest Path</span>\n            <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider antialiased leading-none mt-0.5">Algorithm Laboratory</span>'
content = re.sub(subtitle_regex, subtitle_repl, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Replaced!")
