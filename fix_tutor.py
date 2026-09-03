import re

with open('src/components/AITutorPanel.tsx', 'r') as f:
    content = f.read()

# Add remark-gfm
content = content.replace("import Markdown from 'react-markdown';", "import Markdown from 'react-markdown';\nimport remarkGfm from 'remark-gfm';")

# Add styles for tables
styles_to_add = "[&_table]:w-full [&_table]:mb-2 [&_th]:border [&_th]:border-zinc-300 dark:[&_th]:border-zinc-700 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-zinc-100 dark:[&_th]:bg-zinc-800 [&_td]:border [&_td]:border-zinc-300 dark:[&_td]:border-zinc-700 [&_td]:px-2 [&_td]:py-1"
content = content.replace("font-sans [&>p]:mb-2", "w-full overflow-x-auto font-sans [&>p]:mb-2 " + styles_to_add)
content = content.replace("<Markdown>", "<Markdown remarkPlugins={[remarkGfm]}>")

with open('src/components/AITutorPanel.tsx', 'w') as f:
    f.write(content)
