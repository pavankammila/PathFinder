from PIL import Image
img = Image.open('public/logo-full.png')
img = img.convert('RGBA')
colors = img.getcolors(maxcolors=1000000)
# sort by count
colors.sort(key=lambda x: x[0], reverse=True)
print("Top 10 colors (count, (r,g,b,a)):")
for c in colors[:10]:
    print(c)
