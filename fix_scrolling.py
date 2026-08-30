import re

with open('src/index.css', 'r') as f:
    css_content = f.read()

# Allow body to scroll
css_content = css_content.replace('overflow-hidden m-0 p-0 h-screen w-screen', 'm-0 p-0 min-h-screen w-full overflow-x-hidden')

with open('src/index.css', 'w') as f:
    f.write(css_content)

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

# Allow root div to expand
app_content = app_content.replace('className="flex flex-col h-screen w-screen bg-transparent transition-colors font-sans overflow-hidden', 'className="flex flex-col min-h-screen w-full bg-transparent transition-colors font-sans overflow-x-hidden')
# Let the middle container grow rather than forcing h-full if it needs to scroll the page,
# but the prompt said "Mobile must be a NORMAL vertically scrollable document."
# If we change App.tsx root to min-h-screen, and middle container to flex-col on mobile, it will naturally stack.
app_content = app_content.replace('<div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">', '<div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">')

with open('src/App.tsx', 'w') as f:
    f.write(app_content)

print("Scrolling fixed")
