class BackgroundScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BackgroundScene' });
        this.layers = [];
    }

    preload() {
        console.log('🎨 Cargando BackgroundScene...');
        
        // Cargar las imágenes de fondo
        this.load.image('sky_gradient', 'assets/backgrounds/sky_gradient.png');
        this.load.image('mountains_far', 'assets/backgrounds/mountains_dark.png');
        this.load.image('mountains_mid', 'assets/backgrounds/mountains_blue.png');
        this.load.image('hills_dark', 'assets/backgrounds/hills_dark.png');
        this.load.image('forest_line', 'assets/backgrounds/forest_line.png');
        this.load.image('clouds', 'assets/backgrounds/clouds.png');
        this.load.image('water_surface', 'assets/backgrounds/water_surface.png');
    }

    create() {
        console.log('🎨 BackgroundScene creada');
        
        const { width, height } = this.cameras.main;
        
        // Fondo base de cielo (por si las imágenes no cargan)
        const skyBg = this.add.rectangle(0, 0, width, height, 0x87CEEB);
        skyBg.setOrigin(0, 0);
        
        // Crear capas de fondo con parallax
        this.createLayer('sky_gradient', 0, 0, width, height * 0.6, 0.05);
        this.createLayer('mountains_far', 0, height * 0.4, width, height * 0.3, 0.2);
        this.createLayer('mountains_mid', 0, height * 0.5, width, height * 0.25, 0.3);
        this.createLayer('hills_dark', 0, height * 0.6, width, height * 0.2, 0.5);
        this.createLayer('forest_line', 0, height * 0.7, width, height * 0.15, 0.7);
        this.createLayer('water_surface', 0, height * 0.85, width, height * 0.15, 0.9);
        
        // Agregar nubes
        this.createMovingClouds();
        
        console.log('✅ BackgroundScene completada');
    }

    createLayer(textureKey, x, y, displayWidth, displayHeight, scrollFactor) {
        const { width } = this.cameras.main;
        
        try {
            // Crear sprite
            const sprite = this.add.image(x, y, textureKey);
            sprite.setOrigin(0, 0);
            sprite.setDisplaySize(displayWidth, displayHeight);
            sprite.setScrollFactor(scrollFactor, 1);
            
            // Guardar info de la capa
            this.layers.push({
                sprite: sprite,
                scrollFactor: scrollFactor,
                textureKey: textureKey,
                baseX: x
            });
            
            return sprite;
        } catch (error) {
            console.warn(`⚠️ No se pudo crear capa ${textureKey}:`, error);
            return null;
        }
    }

    createMovingClouds() {
        const { width, height } = this.cameras.main;
        
        try {
            // Crear 3 nubes
            for (let i = 0; i < 3; i++) {
                const cloud = this.add.image(
                    Phaser.Math.Between(100, width - 100),
                    Phaser.Math.Between(50, 150),
                    'clouds'
                );
                
                cloud.setOrigin(0, 0);
                cloud.setDisplaySize(150, 50);
                cloud.setAlpha(0.5);
                cloud.setScrollFactor(0.15, 1);
                
                // Movimiento horizontal
                this.tweens.add({
                    targets: cloud,
                    x: cloud.x + Phaser.Math.Between(50, 150),
                    duration: 25000,
                    repeat: -1,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
            }
        } catch (error) {
            console.warn('⚠️ No se pudieron crear nubes:', error);
        }
    }

    update(time, delta) {
        // Actualizar parallax
        const camera = this.cameras.main;
        
        this.layers.forEach(layer => {
            if (layer.sprite && layer.sprite.active) {
                const offsetX = camera.scrollX * layer.scrollFactor;
                layer.sprite.x = layer.baseX - offsetX;
            }
        });
    }

    // Métodos públicos
    setParallaxSpeed(multiplier) {
        this.layers.forEach(layer => {
            layer.scrollFactor *= multiplier;
        });
    }

    addFogEffect() {
        const { width, height } = this.cameras.main;
        
        const fog = this.add.rectangle(0, 0, width, height, 0xffffff, 0.1);
        fog.setOrigin(0, 0);
        fog.setScrollFactor(0);
        fog.setBlendMode(Phaser.BlendModes.SCREEN);
        
        this.tweens.add({
            targets: fog,
            alpha: 0.2,
            duration: 5000,
            repeat: -1,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }
}