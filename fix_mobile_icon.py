import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace the single combined logo with the two separate ones
pattern = r'<img src="/logo-full\.png"[^>]*/>'
new_code = '''
          {/* Desktop/Tablet Logo: exact 3:1 integer bounds to prevent subpixel blur */}
          <img 
            src="/logo-full.png" 
            alt="PathFinder" 
            className="hidden sm:block h-[28px] w-[84px] object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0" 
          />
          {/* Mobile Icon: exact integer bounds to prevent subpixel blur, forcing 1:1 since 1.03 is visually imperceptible */}
          <div className="flex sm:hidden items-center justify-center">
            <img 
              src="/logo-icon.png" 
              alt="PathFinder Icon" 
              className="h-[24px] w-[24px] object-fill invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0" 
            />
          </div>
'''
# Wait, I should not use object-fill if it's already exactly dimensioned, but object-fill forces it to ignore aspect ratio.
content = re.sub(pattern, new_code.strip(), content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Reverted to mobile icon")
