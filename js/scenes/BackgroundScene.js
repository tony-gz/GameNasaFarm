class BackgroundScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BackgroundScene' });
        this.layers = [];
    }

    preload() {
        console.log('🎨 Cargando BackgroundScene...');
        
        this.load.image('sky_gradient', 'assets/backgrounds/sky_gradient.png');
        this.load.image('mountains_far', 'assets/backgrounds/mountains_dark.png');
        //this.load.image('mountains_mid', 'assets/backgrounds/mountains_blue.png');
        this.load.image('hills_dark', 'assets/backgrounds/hills_dark.png');
        this.load.image('forest_line', 'assets/backgrounds/forest_line.png');
        this.load.image('clouds', 'assets/backgrounds/clouds.png');
        this.load.image('ground_soil', 'assets/backgrounds/ground_soil.png'); // Nueva imagen de suelo
    }

    create() {
        console.log('🎨 BackgroundScene creada');
        
        const { width, height } = this.cameras.main;
        
        // 1. CIELO - Gradiente detallado
        this.createDetailedSky(width, height);
        
        // 2. NUBES - Una sola capa desde el borde superior
        this.createCloudLayer(0, 100, 5, 0.3);
        
        // 3. MONTAÑAS MUY LEJANAS - Color original sin modificar
        //this.createMountainLayer('mountains_mid', height * 0.35, 0.05, 1, 0.5);
        
        // 4. MONTAÑAS LEJANAS - Comienzan más abajo para simular horizonte
        this.createMountainLayer('mountains_far', height * 0.58, 0.45, 0.85, 0.9);
        
        // 5. MONTAÑAS MEDIAS - Con tinte más visible
        //this.createMountainLayer('mountains_mid', height * 0.52, 0.18, 1, 0.9);
        
        // 6. COLINAS OSCURAS - Base de las montañas
        this.createMountainLayer('hills_dark', height * 0.62, 0.28, 1, 1.2);
        
        // 7. BOSQUE LEJANO - Capa verde oscura
        this.createForestLayer('forest_line', height * 0.68, 0.35, 0.7);
        
        // 8. BOSQUE CERCANO - Más verde y grande
        this.createForestLayer('forest_line', height * 0.73, 0.5, 1);
        
        // 9. CÉSPED/HIERBA - Verde brillante
        const grass = this.add.rectangle(0, height * 0.76, width, height * 0.05, 0x4a7c59);
        grass.setOrigin(0, 0);
        grass.setScrollFactor(0.6, 1);
        
        // 10. TIERRA SUPERIOR - Café claro con textura
        this.createTexturedGround(height * 0.81, 0.12, 0x8B6F47, 0.7);
        
        // 11. TIERRA MEDIA - Café medio
        const midSoil = this.add.rectangle(0, height * 0.93, width, height * 0.07, 0x6B4423);
        midSoil.setOrigin(0, 0);
        midSoil.setScrollFactor(0.8, 1);
        
        console.log('✅ BackgroundScene completada');
    }

    createDetailedSky(width, height) {
        // Cielo con gradiente completo de arriba a abajo
        const sky = this.add.graphics();
        sky.fillGradientStyle(0x5ec4ff, 0x5ec4ff, 0x87CEEB, 0x4682B4, 1);
        sky.fillRect(0, 0, width, height);
        sky.setDepth(-100); // Asegurar que esté detrás de todo
    }

    createMountainLayer(textureKey, yPos, scrollFactor, alpha, scaleMultiplier) {
        const { width, height } = this.cameras.main;
        
        try {
            // Calcular escala para que las montañas ocupen más espacio
            const tempSprite = this.add.image(0, 0, textureKey);
            
            // Aumentar ambas escalas para que las montañas ocupen más espacio
            const horizontalScale = scaleMultiplier * 2.5; // Estirar horizontalmente
            
            // Calcular escala vertical basada en la posición Y
            // Mientras más abajo esté yPos, más grande debe ser la escala vertical
            const verticalMultiplier = 1.8 + ((yPos / height) * 1.5); // Se ajusta dinámicamente
            const verticalScale = scaleMultiplier * verticalMultiplier;
            
            const naturalWidth = tempSprite.width * horizontalScale;
            const copiesNeeded = Math.ceil((width * 2) / naturalWidth) + 2;
            tempSprite.destroy();
            
            // Crear copias suficientes para cubrir el ancho
            for (let i = -1; i < copiesNeeded; i++) {
                const sprite = this.add.image(0, yPos, textureKey);
                sprite.setOrigin(0, 1); // Origen en la base, para que crezca hacia arriba
                sprite.setScrollFactor(scrollFactor, 1);
                sprite.setAlpha(alpha);
                sprite.setScale(horizontalScale, verticalScale); // Escala más grande en ambos ejes
                
                sprite.x = naturalWidth * i;
                
                this.layers.push({
                    sprite: sprite,
                    scrollFactor: scrollFactor,
                    baseX: naturalWidth * i,
                    spriteWidth: naturalWidth,
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
            // Calcular tamaño natural con escala moderada
            const tempSprite = this.add.image(0, 0, textureKey);
            const scale = 0.8; // Escala fija más conservadora
            const naturalWidth = tempSprite.width * scale;
            const copiesNeeded = Math.ceil((width * 2) / naturalWidth) + 2;
            tempSprite.destroy();
            
            for (let i = -1; i < copiesNeeded; i++) {
                const forest = this.add.image(0, yPos, textureKey);
                forest.setOrigin(0, 1);
                forest.setScrollFactor(scrollFactor, 1);
                forest.setAlpha(alpha);
                forest.setScale(scale);
                
                forest.x = naturalWidth * i;
                
                this.layers.push({
                    sprite: forest,
                    scrollFactor: scrollFactor,
                    baseX: naturalWidth * i,
                    spriteWidth: naturalWidth,
                    isTiled: true
                });
            }
        } catch (error) {
            console.warn('⚠️ Error: bosque');
        }
    }

    createGroundLayer(textureKey, yPos, scrollFactor) {
        const { width, height } = this.cameras.main;
        
        try {
            // Calcular cuántas copias de la imagen necesitamos para cubrir el ancho
            const tempSprite = this.add.image(0, 0, textureKey);
            const scale = 2.0; // Escala más grande para cubrir más área
            const naturalWidth = tempSprite.width * scale;
            const naturalHeight = tempSprite.height * scale;
            const copiesNeeded = Math.ceil((width * 2) / naturalWidth) + 2;
            tempSprite.destroy();
            
            for (let i = -1; i < copiesNeeded; i++) {
                const ground = this.add.image(0, yPos, textureKey);
                ground.setOrigin(0, 0); // Origen en la esquina superior izquierda
                ground.setScrollFactor(scrollFactor, 1);
                ground.setScale(scale);
                ground.setDepth(10); // Asegurar que esté visible
                
                ground.x = naturalWidth * i;
                
                this.layers.push({
                    sprite: ground,
                    scrollFactor: scrollFactor,
                    baseX: naturalWidth * i,
                    spriteWidth: naturalWidth,
                    isTiled: true
                });
            }
            
            console.log('✅ Suelo creado correctamente');
        } catch (error) {
            console.warn('⚠️ Error al cargar suelo, usando color sólido como respaldo');
            // Si falla, crear un rectángulo café como respaldo
            const fallbackGround = this.add.rectangle(0, yPos, width * 3, height * 0.2, 0x8B6F47);
            fallbackGround.setOrigin(0, 0);
            fallbackGround.setScrollFactor(scrollFactor, 1);
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
                cloud.setScrollFactor(0.05 + (i * 0.01), 1);
                
                const scale = Phaser.Math.FloatBetween(0.8, 1.3);
                cloud.setScale(scale);
                
                this.tweens.add({
                    targets: cloud,
                    x: cloud.x + Phaser.Math.Between(50, 150),
                    duration: 50000 + (i * 10000),
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
        
        this.layers.forEach(layer => {
            if (layer.sprite && layer.sprite.active) {
                const offsetX = camera.scrollX * layer.scrollFactor;
                
                if (layer.isTiled || layer.isMountain) {
                    let newX = layer.baseX - offsetX;
                    const spriteWidth = layer.spriteWidth;
                    
                    // Wrap infinito para tiling
                    while (newX < -spriteWidth * 2) newX += spriteWidth * 5;
                    while (newX > spriteWidth * 3) newX -= spriteWidth * 5;
                    
                    layer.sprite.x = newX;
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