import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Make header flex-wrap and auto height
content = content.replace(
    '<header className="h-12 surface-header flex items-center justify-between px-4 shrink-0 z-50">',
    '<header className="min-h-[48px] h-auto py-2 sm:py-0 sm:h-12 surface-header flex flex-wrap items-center justify-between px-4 shrink-0 z-50 gap-y-2">'
)

# Make the controls block wrap to a new line on small screens
content = content.replace(
    '<div className="flex items-center gap-6">',
    '<div className="flex flex-wrap items-center gap-2 sm:gap-6 justify-center w-full md:w-auto order-last md:order-none mt-1 md:mt-0">'
)

# Shrink the camera button text on mobile
content = re.sub(
    r'<Camera className="w-3\.5 h-3\.5" />\s*CAMERA INPUT',
    r'<Camera className="w-3.5 h-3.5" />\n            <span className="hidden sm:inline">CAMERA INPUT</span>\n            <span className="sm:hidden">SCAN</span>',
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed header layout")
