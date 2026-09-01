import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix trace item flex direction
content = content.replace(
    '<div key={idx} className="flex items-center gap-4 px-2 py-1',
    '<div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-2 py-2 sm:py-1'
)

# Fix Explain button positioning (was absolute right-2)
content = content.replace(
    '<button onClick={() => askTutor(\'Explain this step\')} className="opacity-0 group-hover:opacity-100 absolute right-2',
    '<button onClick={() => askTutor(\'Explain this step\')} className="opacity-100 sm:opacity-0 group-hover:opacity-100 mt-2 sm:mt-0 sm:absolute sm:right-2 w-max self-start sm:self-auto'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed trace item")
