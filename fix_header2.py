import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_header = """        <div className="flex items-center gap-3 sm:gap-4">
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

new_header = """        <div className="flex items-center gap-2 sm:gap-4">
          <img 
            src="/ChatGPT%20Image%20Aug%2030,%202026,%2004_12_10%20PM.png" 
            alt="PathFinder" 
            className="hidden sm:block h-6 sm:h-7 w-auto object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0 transition-all"
          />
          <div className="flex sm:hidden items-center gap-2">
            <img 
              src="/ChatGPT%20Image%20Aug%2030,%202026,%2004_14_54%20PM.png" 
              alt="PathFinder Icon" 
              className="h-5 w-auto object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0 transition-all"
            />
            <h1 className="text-[12px] font-bold tracking-widest uppercase leading-none">Pathfinder</h1>
          </div>
          <div className="hidden md:flex flex-col ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-4">
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">Shortest Path</span>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mt-0.5">Algorithm Laboratory</span>
          </div>
        </div>"""

content = content.replace(old_header, new_header)

with open(filepath, 'w') as f:
    f.write(content)

