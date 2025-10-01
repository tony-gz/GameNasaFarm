class BackgroundScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BackgroundScene' });
        this.layers = [];
    }

    preload() {
        console.log('🎨 Cargando BackgroundScene...');
        
        this.load.image('sky_gradient', 'assets/backgrounds/sky_gradient.png');
        this.load.image('mountains_far', 'assets/backgrounds/mountains_dark.png');
        this.load.image('mountains_mid', 'assets/backgrounds/mountains_blue.png');
        this.load.image('hills_dark', 'assets/backgrounds/hills_dark.png');
        this.load.image('forest_line', 'assets/backgrounds/forest_line.png');
        this.load.image('clouds', 'assets/backgrounds/clouds.png');
    }

    create() {
        console.log('🎨 BackgroundScene creada');
        
        const { width, height } = this.cameras.main;
        
        // 1. CIELO - Gradiente detallado
        this.createDetailedSky(width, height);
        
        // 2. NUBES DE FONDO - Capa lejana
        this.createCloudLayer(80, 180, 4, 0.25);
        
        // 3. MONTAÑAS LEJANAS - Más oscuras y pequeñas
        this.createMountainLayer('mountains_far', height * 0.48, 0.08, 0.5, 0.8);
        
        // 4. MONTAÑAS MEDIAS - Azules
        this.createMountainLayer('mountains_mid', height * 0.58, 0.15, 0.7, 1.2);
        
        // 5. NUBES MEDIAS
        this.createCloudLayer(250, 350, 3, 0.35);
        
        // 6. COLINAS OSCURAS - Base de las montañas
        this.createMountainLayer('hills_dark', height * 0.68, 0.25, 0.9, 1.5);
        
        // 7. BOSQUE LEJANO - Capa verde oscura
        this.createForestLayer('forest_line', height * 0.76, 0.35, 0.7);
        
        // 8. BOSQUE CERCANO - Más verde y grande
        this.createForestLayer('forest_line', height * 0.82, 0.5, 1);
        
        // 9. CÉSPED/HIERBA - Verde brillante
        const grass = this.add.rectangle(0, height * 0.82, width, height * 0.05, 0x4a7c59);
        grass.setOrigin(0, 0);
        grass.setScrollFactor(0.6, 1);
        
        // 10. TIERRA SUPERIOR - Café claro con textura
        this.createTexturedGround(height * 0.87, 0.08, 0x8B6F47, 0.7);
        
        // 11. TIERRA MEDIA - Café medio
        const midSoil = this.add.rectangle(0, height * 0.95, width, height * 0.05, 0x6B4423);
        midSoil.setOrigin(0, 0);
        midSoil.setScrollFactor(0.8, 1);
        
        console.log('✅ BackgroundScene completada');
    }

    createDetailedSky(width, height) {
        // Cielo base
        const sky = this.add.graphics();
        sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x5A9FD4, 0x4682B4, 1);
        sky.fillRect(0, 0, width, height * 0.7);
        
        // Transición a horizonte
        const horizon = this.add.graphics();
        horizon.fillGradientStyle(0x5A9FD4, 0x5A9FD4, 0x87CEEB, 0x87CEEB, 1);
        horizon.fillRect(0, height * 0.4, width, height * 0.3);
    }

    createMountainLayer(textureKey, yPos, scrollFactor, alpha, scaleMultiplier) {
        const { width } = this.cameras.main;
        
        try {
            // Crear 3 copias para cubrir el ancho
            for (let i = -0.5; i <= 1.5; i++) {
                const sprite = this.add.image(width * i, yPos, textureKey);
                sprite.setOrigin(0.5, 1);
                sprite.setScrollFactor(scrollFactor, 1);
                sprite.setAlpha(alpha);
                
                const scale = (width / sprite.width) * scaleMultiplier;
                sprite.setScale(scale);
                
                this.layers.push({
                    sprite: sprite,
                    scrollFactor: scrollFactor,
                    baseX: width * i,
                    isMountain: true
                });
            }
        } catch (error) {
            console.warn(`⚠️ Error: ${textureKey}`);
        }
    }

    createForestLayer(textureKey, yPos, scrollFactor, alpha) {
        const { width } = this.cameras.main;
        
        try {
            for (let i = -1; i <= 2; i++) {
                const forest = this.add.image(width * i, yPos, textureKey);
                forest.setOrigin(0, 1);
                forest.setScrollFactor(scrollFactor, 1);
                forest.setAlpha(alpha);
                
                const scale = (width / forest.width) * 1.1;
                forest.setScale(scale);
                
                this.layers.push({
                    sprite: forest,
                    scrollFactor: scrollFactor,
                    baseX: width * i,
                    isTiled: true
                });
            }
        } catch (error) {
            console.warn('⚠️ Error: bosque');
        }
    }

    createTexturedGround(yPos, heightPercent, color, scrollFactor) {
        const { width, height } = this.cameras.main;
        
        // Base sólida
        const ground = this.add.rectangle(0, yPos, width, height * heightPercent, color);
        ground.setOrigin(0, 0);
        ground.setScrollFactor(scrollFactor, 1);
        
        // Agregar "textura" con puntos aleatorios
        const graphics = this.add.graphics();
        graphics.setScrollFactor(scrollFactor, 1);
        
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = yPos + Phaser.Math.Between(0, height * heightPercent);
            const size = Phaser.Math.Between(2, 4);
            const darkness = Phaser.Math.Between(-30, 30);
            
            graphics.fillStyle(Phaser.Display.Color.GetColor(
                Math.max(0, 139 + darkness),
                Math.max(0, 111 + darkness),
                Math.max(0, 71 + darkness)
            ));
            graphics.fillCircle(x, y, size);
        }
    }

    createCloudLayer(minY, maxY, count, alpha) {
        const { width } = this.cameras.main;
        
        try {
            for (let i = 0; i < count; i++) {
                const cloud = this.add.image(
                    Phaser.Math.Between(0, width),
                    Phaser.Math.Between(minY, maxY),
                    'clouds'
                );
                
                cloud.setOrigin(0.5, 0.5);
                cloud.setAlpha(alpha);
                cloud.setScrollFactor(0.03 + (i * 0.02), 1);
                
                const scale = Phaser.Math.FloatBetween(0.5, 1);
                cloud.setScale(scale);
                
                this.tweens.add({
                    targets: cloud,
                    x: cloud.x + Phaser.Math.Between(100, 200),
                    duration: 40000 + (i * 10000),
                    repeat: -1,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
            }
        } catch (error) {
            console.warn('⚠️ Error: nubes');
        }
    }

    update(time, delta) {
        const camera = this.cameras.main;
        const { width } = this.cameras.main;
        
        this.layers.forEach(layer => {
            if (layer.sprite && layer.sprite.active) {
                const offsetX = camera.scrollX * layer.scrollFactor;
                
                if (layer.isTiled) {
                    let newX = layer.baseX - offsetX;
                    const spriteWidth = layer.sprite.displayWidth;
                    
                    while (newX < -spriteWidth * 2) newX += spriteWidth * 4;
                    while (newX > spriteWidth * 2) newX -= spriteWidth * 4;
                    
                    layer.sprite.x = newX;
                } else if (layer.isMountain) {
                    layer.sprite.x = layer.baseX - offsetX;
                }
            }
        });
    }

    setParallaxSpeed(multiplier) {
        this.layers.forEach(layer => {
            layer.scrollFactor *= multiplier;
        });
    }
}