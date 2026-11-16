from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

files = sorted(Path("tmp/pdfs/render").glob("page-*.jpg"))
width = 280
items = []
for path in files:
    image = Image.open(path).convert("RGB")
    height = round(image.height * width / image.width)
    image = ImageOps.expand(image.resize((width, height)), border=2, fill="gray")
    items.append((path.name, image))
columns = 4
cell_height = max(image.height for _, image in items) + 22
rows = (len(items) + columns - 1) // columns
sheet = Image.new("RGB", (columns * (width + 4), rows * cell_height), "white")
draw = ImageDraw.Draw(sheet)
for index, (name, image) in enumerate(items):
    x = (index % columns) * (width + 4)
    y = (index // columns) * cell_height
    draw.text((x + 3, y + 2), name, fill="black")
    sheet.paste(image, (x, y + 18))
sheet.save("tmp/pdfs/contact.jpg", quality=90)
print(f"Rendered {len(files)} pages; contact sheet {sheet.size}")
