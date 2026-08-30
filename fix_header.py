import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_header = """        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
            <div className="w-2 h-2 bg-white dark:bg-zinc-900 rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[11px] font-bold tracking-widest uppercase leading-none">Pathfinder</h1>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mt-0.5">Shortest Path Algorithm Laboratory</span>
          </div>
        </div>"""

new_header = """        <div className="flex items-center gap-3 sm:gap-4">
          <img 
            src="/ChatGPT%20Image%20Aug%2030,%202026,%2004_12_10%20PM.png" 
            alt="PathFinder" 
            className="hidden sm:block h-6 sm:h-7 w-auto object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0 transition-all"
          />
          <img 
            src="/ChatGPT%20Image%20Aug%2030,%202026,%2004_14_54%20PM.png" 
            alt="PathFinder" 
            className="block sm:hidden h-6 w-auto object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0 transition-all"
          />
          <div className="flex flex-col hidden md:flex">
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mt-0.5">Shortest Path Algorithm Laboratory</span>
          </div>
        </div>"""

content = content.replace(old_header, new_header)

with open(filepath, 'w') as f:
    f.write(content)

