class BackgroundScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BackgroundScene' });
        this.layers = [];
    }

    preload() {
        console.log('🎨 Cargando BackgroundScene...');
        
        this.load.image('sky_gradient', 'assets/backgrounds/sky_gradient.png');
        this.load.image('mountains_far', 'assets/backgrounds/mountains_dark.png');
        this.load.image('clouds', 'assets/backgrounds/clouds.png');
        this.load.image('ground_soil', 'assets/backgrounds/ground_soil_new.png'); // Imagen de suelo con textura
        this.load.image('casita', 'assets/backgrounds/Casita-granja.png');
        this.load.image('tree_round', 'assets/backgrounds/Tree_new.png'); // Árbol redondo
        this.load.image('grassTiles_ground', 'assets/backgrounds/GrassTiles_new.png');
        this.load.image('dark_ground', 'assets/backgrounds/Ground.png')
    }

    create() {
        console.log('🎨 BackgroundScene creada');
        
        const { width, height } = this.cameras.main;
        
        // 1. CIELO - Gradiente detallado
        this.createDetailedSky(width, height);
        
        // 2. NUBES - Una sola capa desde el borde superior
        this.createCloudLayer(0, 100, 5, 0.7);
        
        // 4. MONTAÑAS LEJANAS - Comienzan más abajo para simular horizonte
        this.createMountainLayer('mountains_far', height * 0.84, 0.45, 0.85, 0.9);

        //8.1 Casita granja
        // Pinta la casita a la izquierda, en el suelo
        this.createHouse(700, 480, "casita", 0.3, 1, 1);

        // 8.2 Árboles de fondo - Uno de cada tipo
        this.createTree(150, height * 0.88, "tree_round", 0.17, 0.4, 1); // Árbol redondo (más lejano)
        this.createTree(565, height * 0.88, "tree_round", 0.17, 0.4, 1);  // Árbol alto (más cercano)
        
        // 9. TIERRA CON TEXTURA - Directamente después del bosque, sin césped verde
        this.createGroundLayer('grassTiles_ground', height * 0.83, 0.7, 0.07);
        this.createLimitedGroundLayer('ground_soil', height * 0.823, 0.7, 0.07, 3, 250);
        this.createGroundLayer('dark_ground', height * 0.91, 0.7, 0.07);
        
        console.log('✅ BackgroundScene completada');
    }
    
    createHouse(x, y, textureKey, scale = 1, scrollFactor = 1, alpha = 1) {
        try {
            // Agregar sprite de la casita
            const house = this.add.image(x, y, textureKey);
            
            // Ajustar origen (ej: desde la base)
            house.setOrigin(0.5, 1);

            // Escala personalizada
            house.setScale(scale);

            // Factor de desplazamiento (parallax)
            house.setScrollFactor(scrollFactor);

            // Transparencia
            house.setAlpha(alpha);

            house.setDepth(50)

            // Guardar referencia si usas this.layers
            this.layers.push({
                sprite: house,
                scrollFactor: scrollFactor,
                baseX: x,
                baseY: y,
                isTiled: false
            });

            return house;
        } catch (error) {
            console.warn("⚠️ Error: no se pudo crear la casita", error);
        }
    }

    createTree(x, y, textureKey, scale = 1, scrollFactor = 0.5, alpha = 1) {
    try {
        // Agregar sprite del árbol
        const tree = this.add.image(x, y, textureKey);
        
        // Ajustar origen desde la base
        tree.setOrigin(0.5, 1);

        // Escala personalizada
        tree.setScale(scale);

        // Factor de desplazamiento (parallax) - más lento = más lejano
        tree.setScrollFactor(scrollFactor);

        // Transparencia
        tree.setAlpha(alpha);

        // Depth para que esté detrás de otros elementos
        tree.setDepth(10);

        // Guardar referencia
        this.layers.push({
            sprite: tree,
            scrollFactor: scrollFactor,
            baseX: x,
            baseY: y,
            isTiled: false
        });

        return tree;
    } catch (error) {
        console.warn("⚠️ Error: no se pudo crear el árbol", error);
    }
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
            // Usar escala original sin modificaciones
            const tempSprite = this.add.image(0, 0, textureKey);
            
            // Escala 1:1 - tamaño original de las imágenes
            const horizontalScale = scaleMultiplier;
            const verticalScale = scaleMultiplier;
            
            const naturalWidth = tempSprite.width * horizontalScale;
            const copiesNeeded = Math.ceil((width * 2) / naturalWidth) + 2;
            tempSprite.destroy();
            
            // Crear copias suficientes para cubrir el ancho
            for (let i = -1; i < copiesNeeded; i++) {
                const sprite = this.add.image(0, yPos, textureKey);
                sprite.setOrigin(0, 1); // Origen en la base, para que crezca hacia arriba
                sprite.setScrollFactor(scrollFactor, 1);
                sprite.setAlpha(alpha);
                sprite.setScale(horizontalScale, verticalScale);
                
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
            // Usar escala original 1:1
            const tempSprite = this.add.image(0, 0, textureKey);
            const scale = 1.0; // Escala original sin modificaciones
            const naturalWidth = tempSprite.width * scale;
            const copiesNeeded = Math.ceil((width * 2) / naturalWidth) + 2;
            tempSprite.destroy();
            
            for (let i = -1; i < copiesNeeded; i++) {
                const forest = this.add.image(0, yPos, textureKey);
                forest.setOrigin(0, 1);
                forest.setScrollFactor(scrollFactor, 1);
                forest.setAlpha(alpha);
                forest.setScale(scale);
                forest.setDepth(0)
                
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

    createGroundLayer(textureKey, yPos, scrollFactor, scale = 1.0) {
        const { width, height } = this.cameras.main;
        
        try {
            // Calcular el ancho real de cada sprite con la escala aplicada
            const tempSprite = this.add.image(0, 0, textureKey);
            const spriteWidth = tempSprite.width * scale;
            tempSprite.destroy();
            
            // Calcular cuántas copias necesitamos para cubrir toda la pantalla + márgenes para parallax
            const totalCoverage = width * 8; // 8x el ancho de pantalla para más cobertura
            const totalCopies = Math.ceil(totalCoverage / spriteWidth) + 30;
            
            console.log(`📏 Suelo: ancho por sprite=${spriteWidth}px, total copias=${totalCopies}`);
            
            // Crear sprites pegados uno al lado del otro, sin espacios
            // Empezar desde -30 para cubrir mucho más a la izquierda
            for (let i = -30; i < totalCopies; i++) {
                const ground = this.add.image(i * spriteWidth, yPos, textureKey);
                ground.setOrigin(0, 0);
                ground.setScrollFactor(scrollFactor, 1);
                ground.setScale(scale);
                ground.setDepth(10);
                
                this.layers.push({
                    sprite: ground,
                    scrollFactor: scrollFactor,
                    baseX: i * spriteWidth,
                    spriteWidth: spriteWidth,
                    isTiled: true
                });
            }
            
            console.log('✅ Suelo creado: sprites pegados sin espacios');
        } catch (error) {
            console.warn('⚠️ Error al cargar suelo, usando color sólido como respaldo');
            const fallbackGround = this.add.rectangle(0, yPos, width * 3, height * 0.2, 0x8B6F47);
            fallbackGround.setOrigin(0, 0);
            fallbackGround.setScrollFactor(scrollFactor, 1);
        }
    }

    createLimitedGroundLayer(textureKey, yPos, scrollFactor, scale = 1.0, numCopies = 4, startX = 0) {
    const { width, height } = this.cameras.main;
    
    try {
        const tempSprite = this.add.image(0, 0, textureKey);
        const spriteWidth = tempSprite.width * scale;
        tempSprite.destroy();
        
        console.log(`📏 Suelo limitado: ancho por sprite=${spriteWidth}px, copias=${numCopies}`);
        
        // Crear solo el número especificado de copias, comenzando desde startX
        for (let i = 0; i < numCopies; i++) {
            const ground = this.add.image(startX + (i * spriteWidth), yPos, textureKey);
            ground.setOrigin(0, 0);
            ground.setScrollFactor(scrollFactor, 1);
            ground.setScale(scale);
            ground.setDepth(20);
        }
        
        console.log('✅ Suelo limitado creado');
    } catch (error) {
        console.warn('⚠️ Error al cargar suelo limitado');
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
                cloud.setDepth(-50); 
                
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
            if (layer.sprite && layer.sprite.active && layer.isTiled) {
                const offsetX = camera.scrollX * layer.scrollFactor;
                const spriteWidth = layer.spriteWidth;
                
                // Calcular nueva posición basada en el offset de la cámara
                let newX = layer.baseX - offsetX;
                
                // Wrapping simplificado - cuando sale por un lado, aparece por el otro
                const wrapRange = spriteWidth * 50; // Rango grande de wrapping
                
                while (newX < -wrapRange) {
                    newX += spriteWidth;
                    layer.baseX += spriteWidth;
                }
                while (newX > wrapRange) {
                    newX -= spriteWidth;
                    layer.baseX -= spriteWidth;
                }
                
                layer.sprite.x = newX;
            }
        });
    }

    setParallaxSpeed(multiplier) {
        this.layers.forEach(layer => {
            layer.scrollFactor *= multiplier;
        });
    }
}
