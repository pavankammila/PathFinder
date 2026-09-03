with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Revert imports
import_old = "ChevronDown, Check, Share2, Sparkles\n} from 'lucide-react';"
import_new = "ChevronDown, Check, Share2\n} from 'lucide-react';"
content = content.replace(import_old, import_new)

# 2. Revert button
btn_old = """            {/* PATHFINDER AI PREMIUM BUTTON */}
            <button
              onClick={() => setIsTutorOpen(!isTutorOpen)}
              className="absolute bottom-6 left-4 sm:left-6 z-30 flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-2.5 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:via-amber-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50 border border-orange-400/50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-900 focus-visible:outline-none transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group"
              title="Open PathFinder AI"
              aria-label="Open PathFinder AI"
            >
              <Sparkles className="w-5 h-5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300" />"""

btn_new = """            {/* PATHFINDER AI PREMIUM BUTTON */}
            <button
              onClick={() => setIsTutorOpen(!isTutorOpen)}
              className="absolute bottom-6 left-4 sm:left-6 z-30 flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-900 focus-visible:outline-none transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              title="Open PathFinder AI"
              aria-label="Open PathFinder AI"
            >
              <Bot className="w-5 h-5 sm:w-4 sm:h-4" />"""
content = content.replace(btn_old, btn_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
