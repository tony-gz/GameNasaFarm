class BackgroundScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BackgroundScene' });
        this.layers = [];
    }

    preload() {
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
        const { width, height } = this.cameras.main;
        
        // Crear capas de fondo con diferentes velocidades para efecto parallax
        this.createParallaxLayer('sky_gradient', 0, 0, 0.1);
        this.createParallaxLayer('mountains_far', 0, height * 0.3, 0.2);
        this.createParallaxLayer('mountains_mid', 0, height * 0.4, 0.3);
        this.createParallaxLayer('hills_dark', 0, height * 0.6, 0.5);
        this.createParallaxLayer('forest_line', 0, height * 0.7, 0.7);
        this.createParallaxLayer('water_surface', 0, height * 0.85, 0.9);
        
        // Agregar nubes con movimiento automático
        this.createMovingClouds();
        
        // Configurar animaciones de ambiente
        this.setupAmbientAnimations();
    }

    createParallaxLayer(textureKey, x, y, scrollFactor) {
        const { width, height } = this.cameras.main;
        
        // Crear múltiples instancias de la imagen para efecto seamless
        const layer = this.add.group();
        
        for (let i = 0; i < 3; i++) {
            const sprite = this.add.image(x + (width * i), y, textureKey);
            sprite.setOrigin(0, 0);
            sprite.setScrollFactor(scrollFactor, 1);
            
            // Escalar para cubrir toda la pantalla
            const scaleX = width / sprite.width;
            const scaleY = (height - y) / sprite.height;
            sprite.setScale(Math.max(scaleX, scaleY));
            
            layer.add(sprite);
        }
        
        this.layers.push({
            group: layer,
            scrollFactor: scrollFactor,
            textureKey: textureKey
        });
        
        return layer;
    }

    createMovingClouds() {
        const { width, height } = this.cameras.main;
        
        // Crear varias nubes con diferentes velocidades
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.image(
                Phaser.Math.Between(-200, width + 200),
                Phaser.Math.Between(50, height * 0.4),
                'clouds'
            );
            
            cloud.setScale(Phaser.Math.FloatBetween(0.5, 1.2));
            cloud.setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
            cloud.setScrollFactor(0.15, 1);
            
            // Animación de movimiento horizontal
            this.tweens.add({
                targets: cloud,
                x: cloud.x + Phaser.Math.Between(100, 300),
                duration: Phaser.Math.Between(20000, 40000),
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
            
            // Animación sutil vertical
            this.tweens.add({
                targets: cloud,
                y: cloud.y + Phaser.Math.Between(-20, 20),
                duration: Phaser.Math.Between(8000, 15000),
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        }
    }

    setupAmbientAnimations() {
        // Animación de respiración para las montañas (efecto de atmósfera)
        this.layers.forEach((layer, index) => {
            if (layer.textureKey.includes('mountains')) {
                this.tweens.add({
                    targets: layer.group.children.entries,
                    alpha: '+= 0.1',
                    duration: 3000 + (index * 500),
                    repeat: -1,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // Efecto de ondas en la superficie del agua
        const waterLayer = this.layers.find(l => l.textureKey === 'water_surface');
        if (waterLayer) {
            waterLayer.group.children.entries.forEach(sprite => {
                this.tweens.add({
                    targets: sprite,
                    scaleY: sprite.scaleY * 1.02,
                    duration: 4000,
                    repeat: -1,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
            });
        }
    }

    update(time, delta) {
        // Actualizar el parallax basado en el movimiento de la cámara
        this.updateParallax();
        
        // Efectos adicionales basados en tiempo
        this.updateTimeBasedEffects(time);
    }

    updateParallax() {
        const camera = this.cameras.main;
        
        this.layers.forEach(layer => {
            const speed = layer.scrollFactor;
            layer.group.children.entries.forEach(sprite => {
                // Calcular nueva posición basada en el scroll de la cámara
                const newX = (camera.scrollX * speed * -1) + sprite.getData('originalX');
                sprite.x = newX;
            });
        });
    }

    updateTimeBasedEffects(time) {
        // Cambio sutil de colores basado en el tiempo (simulando día/noche)
        const timeOfDay = (Math.sin(time * 0.0001) + 1) / 2;
        const tint = Phaser.Display.Color.Interpolate.ColorWithColor(
            { r: 135, g: 206, b: 235 }, // Azul día
            { r: 25, g: 25, b: 112 },   // Azul noche
            100,
            Math.floor(timeOfDay * 100)
        );
        
        // Aplicar tinte a las capas de cielo
        const skyLayer = this.layers.find(l => l.textureKey === 'sky_gradient');
        if (skyLayer) {
            const color = Phaser.Display.Color.GetColor(tint.r, tint.g, tint.b);
            skyLayer.group.children.entries.forEach(sprite => {
                sprite.setTint(color);
            });
        }
    }

    // Métodos públicos para controlar el fondo desde otras escenas
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
        fog.setBlendMode(Phaser.BlendModes.SOFT_LIGHT);
        
        this.tweens.add({
            targets: fog,
            alpha: 0.3,
            duration: 5000,
            repeat: -1,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    addParticleEffects() {
        // Partículas flotantes (polvo, polen, etc.)
        const particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: this.cameras.main.width },
            y: { min: 0, max: this.cameras.main.height * 0.8 },
            scale: { start: 0.1, end: 0.3 },
            alpha: { start: 0.8, end: 0 },
            speed: { min: 10, max: 50 },
            lifespan: 8000,
            frequency: 100,
            blendMode: 'ADD'
        });
        
        particles.setScrollFactor(0.5);
    }
}