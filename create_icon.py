from PIL import Image, ImageDraw, ImageFont
import os

def create_app_icon():
    # 1024x1024 boyutunda icon oluştur
    size = 1024
    img = Image.new('RGB', (size, size), '#FFFFFF')
    draw = ImageDraw.Draw(img)
    
    # Gradient arkaplan (Mor-Mavi tonları)
    for y in range(size):
        # Yumuşak gradient: üst mor, alt mavi
        r = int(139 + (59 - 139) * (y / size))  # 139->59
        g = int(92 + (130 - 92) * (y / size))   # 92->130
        b = int(246 + (246 - 246) * (y / size)) # 246->246
        draw.rectangle([(0, y), (size, y+1)], fill=(r, g, b))
    
    # Yuvarlak köşeler için maske
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([(0, 0), (size, size)], radius=180, fill=255)
    
    # Maskeyi uygula
    output = Image.new('RGB', (size, size), '#FFFFFF')
    output.paste(img, (0, 0), mask)
    draw = ImageDraw.Draw(output)
    
    # Merkez daire (beyaz)
    center = size // 2
    circle_radius = 380
    draw.ellipse(
        [(center - circle_radius, center - circle_radius),
         (center + circle_radius, center + circle_radius)],
        fill='#FFFFFF',
        outline='#8B5CF6',
        width=20
    )
    
    # Mescid simgesi (basit kubbe ve minare)
    # Ana kubbe
    dome_bottom = center + 80
    dome_top = center - 120
    dome_width = 280
    draw.ellipse(
        [(center - dome_width//2, dome_top - 100),
         (center + dome_width//2, dome_bottom)],
        fill='#10B981',
        outline='#059669',
        width=8
    )
    
    # Kubbe üstü hilal
    crescent_size = 60
    draw.arc(
        [(center - crescent_size, dome_top - 180),
         (center + crescent_size, dome_top - 60)],
        start=200, end=340,
        fill='#F59E0B',
        width=15
    )
    
    # Minareler (iki yanında)
    minaret_width = 40
    minaret_height = 200
    
    # Sol minare
    left_x = center - 200
    draw.rectangle(
        [(left_x - minaret_width//2, dome_bottom - minaret_height),
         (left_x + minaret_width//2, dome_bottom)],
        fill='#10B981',
        outline='#059669',
        width=6
    )
    # Sol minare kubesi
    draw.ellipse(
        [(left_x - minaret_width, dome_bottom - minaret_height - 30),
         (left_x + minaret_width, dome_bottom - minaret_height + 10)],
        fill='#F59E0B'
    )
    
    # Sağ minare
    right_x = center + 200
    draw.rectangle(
        [(right_x - minaret_width//2, dome_bottom - minaret_height),
         (right_x + minaret_width//2, dome_bottom)],
        fill='#10B981',
        outline='#059669',
        width=6
    )
    # Sağ minare kubesi
    draw.ellipse(
        [(right_x - minaret_width, dome_bottom - minaret_height - 30),
         (right_x + minaret_width, dome_bottom - minaret_height + 10)],
        fill='#F59E0B'
    )
    
    # Ana bina
    building_width = 320
    building_height = 140
    draw.rectangle(
        [(center - building_width//2, dome_bottom),
         (center + building_width//2, dome_bottom + building_height)],
        fill='#10B981',
        outline='#059669',
        width=8
    )
    
    # Kapı (yay şeklinde)
    door_width = 100
    door_height = 110
    draw.rectangle(
        [(center - door_width//2, dome_bottom + 30),
         (center + door_width//2, dome_bottom + building_height)],
        fill='#059669'
    )
    draw.arc(
        [(center - door_width//2, dome_bottom + 30),
         (center + door_width//2, dome_bottom + 130)],
        start=0, end=180,
        fill='#059669',
        width=door_width
    )
    
    # Yıldız süslemeleri (köşelerde)
    star_positions = [
        (center - 250, center - 250),
        (center + 250, center - 250),
        (center - 250, center + 250),
        (center + 250, center + 250)
    ]
    
    for sx, sy in star_positions:
        # Basit yıldız şekli
        star_size = 30
        draw.polygon(
            [(sx, sy - star_size), 
             (sx + star_size//3, sy - star_size//3),
             (sx + star_size, sy),
             (sx + star_size//3, sy + star_size//3),
             (sx, sy + star_size),
             (sx - star_size//3, sy + star_size//3),
             (sx - star_size, sy),
             (sx - star_size//3, sy - star_size//3)],
            fill='#FCD34D'
        )
    
    # Icon'u kaydet
    assets_dir = '/Users/vacitb/Desktop/Work/SujoodDiary/assets'
    output.save(f'{assets_dir}/icon.png', 'PNG', quality=95)
    print("✅ icon.png created!")
    
    # Adaptive icon (Android için)
    output.save(f'{assets_dir}/adaptive-icon.png', 'PNG', quality=95)
    print("✅ adaptive-icon.png created!")
    
    # Splash icon
    output.save(f'{assets_dir}/splash-icon.png', 'PNG', quality=95)
    print("✅ splash-icon.png created!")
    
    # Favicon (küçük versiyon)
    favicon = output.resize((512, 512), Image.Resampling.LANCZOS)
    favicon.save(f'{assets_dir}/favicon.png', 'PNG', quality=95)
    print("✅ favicon.png created!")
    
    print("\n🎨 Tüm icon dosyaları başarıyla oluşturuldu!")
    print("📱 Mescid temalı, çocuk dostu renkli tasarım")

if __name__ == '__main__':
    create_app_icon()
