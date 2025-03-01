/**
 * Particle system for underwater effects
 */
class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particleGroups = {};
        this.initialized = false;
    }

    async initialize() {
        try {
            // Load particle texture
            this.particleTexture = await Utils.loadTexture('assets/textures/particle.png');
            
            // Create particle systems
            await this.createDustParticles();
            await this.createGlowParticles();
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing particle system:', error);
            return false;
        }
    }

    async createDustParticles() {
        // Underwater dust particles
        const particleCount = 500;
        const positions = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);
        const opacities = new Float32Array(particleCount);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Position particles in a large volume
            positions[i3] = (Math.random() - 0.5) * 50;  // x
            positions[i3 + 1] = Math.random() * 20;      // y
            positions[i3 + 2] = (Math.random() - 0.5) * 50; // z

            // Random sizes
            scales[i] = 0.2 + Math.random() * 0.3;
            
            // Varying opacity
            opacities[i] = 0.2 + Math.random() * 0.5;
            
            // Particle movement data
            velocities.push({
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            });
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
        geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0xffffff) },
                pointTexture: { value: this.particleTexture }
            },
            vertexShader: `
                attribute float scale;
                attribute float opacity;
                varying float vOpacity;
                
                void main() {
                    vOpacity = opacity;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = scale * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform sampler2D pointTexture;
                varying float vOpacity;
                
                void main() {
                    gl_FragColor = vec4(color, vOpacity) * texture2D(pointTexture, gl_PointCoord);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        particles.userData = { velocities };
        this.scene.add(particles);
        this.particleGroups.dust = particles;
    }

    async createGlowParticles() {
        // Bioluminescent glow particles
        const particleCount = 150;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);
        const opacities = new Float32Array(particleCount);
        const velocities = [];

        // Glow colors
        const glowColors = [
            new THREE.Color(0x00ffff), // Cyan
            new THREE.Color(0x4dffa6), // Aqua green
            new THREE.Color(0x00a3ff), // Light blue
            new THREE.Color(0x4da6ff)  // Blue
        ];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position particles in a large volume
            positions[i3] = (Math.random() - 0.5) * 30;
            positions[i3 + 1] = Math.random() * 15;
            positions[i3 + 2] = (Math.random() - 0.5) * 30;

            // Random color from palette
            const color = glowColors[Math.floor(Math.random() * glowColors.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Larger sizes for glow particles
            scales[i] = 0.5 + Math.random() * 1.0;
            
            // Higher opacity for stronger glow
            opacities[i] = 0.4 + Math.random() * 0.6;
            
            // Slower, gentler movement
            velocities.push({
                x: (Math.random() - 0.5) * 0.005,
                y: (Math.random() - 0.5) * 0.005,
                z: (Math.random() - 0.5) * 0.005,
                // Additional animation properties
                pulseSpeed: 0.5 + Math.random() * 2,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
        geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: this.particleTexture },
                time: { value: 0.0 }
            },
            vertexShader: `
                attribute vec3 color;
                attribute float scale;
                attribute float opacity;
                uniform float time;
                
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    vColor = color;
                    vOpacity = opacity;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = scale * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                uniform float time;
                
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    gl_FragColor = vec4(vColor, vOpacity) * texture2D(pointTexture, gl_PointCoord);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        const particles = new THREE.Points(geometry, material);
        particles.userData = { velocities };
        this.scene.add(particles);
        this.particleGroups.glow = particles;
    }

    update(time, deltaTime) {
        if (!this.initialized) return;

        // Update dust particles
        if (this.particleGroups.dust) {
            const geometry = this.particleGroups.dust.geometry;
            const positions = geometry.attributes.position.array;
            const velocities = this.particleGroups.dust.userData.velocities;
            
            for (let i = 0; i < positions.length / 3; i++) {
                const i3 = i * 3;
                
                // Update positions based on velocity
                positions[i3] += velocities[i].x;
                positions[i3 + 1] += velocities[i].y;
                positions[i3 + 2] += velocities[i].z;
                
                // Wrap particles around if they go out of bounds
                if (positions[i3] > 25) positions[i3] = -25;
                if (positions[i3] < -25) positions[i3] = 25;
                if (positions[i3 + 1] > 20) positions[i3 + 1] = 0;
                if (positions[i3 + 1] < 0) positions[i3 + 1] = 20;
                if (positions[i3 + 2] > 25) positions[i3 + 2] = -25;
                if (positions[i3 + 2] < -25) positions[i3 + 2] = 25;
            }
            
            geometry.attributes.position.needsUpdate = true;
        }

        // Update glow particles
        if (this.particleGroups.glow) {
            const geometry = this.particleGroups.glow.geometry;
            const positions = geometry.attributes.position.array;
            const opacities = geometry.attributes.opacity.array;
            const scales = geometry.attributes.scale.array;
            const velocities = this.particleGroups.glow.userData.velocities;
            
            // Update shader time uniform
            this.particleGroups.glow.material.uniforms.time.value = time;
            
            for (let i = 0; i < positions.length / 3; i++) {
                const i3 = i * 3;
                
                // Update positions based on velocity
                positions[i3] += velocities[i].x;
                positions[i3 + 1] += velocities[i].y;
                positions[i3 + 2] += velocities[i].z;
                
                // Pulsing effect for opacity
                const pulseValue = 0.5 + 0.5 * Math.sin(time * velocities[i].pulseSpeed + velocities[i].pulsePhase);
                opacities[i] = 0.4 + 0.6 * pulseValue;
                
                // Subtle size fluctuation
                scales[i] = (0.5 + Math.random() * 1.0) * (0.8 + 0.2 * pulseValue);
                
                // Wrap particles
                if (positions[i3] > 15) positions[i3] = -15;
                if (positions[i3] < -15) positions[i3] = 15;
                if (positions[i3 + 1] > 15) positions[i3 + 1] = 0;
                if (positions[i3 + 1] < 0) positions[i3 + 1] = 15;
                if (positions[i3 + 2] > 15) positions[i3 + 2] = -15;
                if (positions[i3 + 2] < -15) positions[i3 + 2] = 15;
            }
            
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.opacity.needsUpdate = true;
            geometry.attributes.scale.needsUpdate = true;
        }
    }

    // Add particles at specific location (for fish interaction)
    emitParticles(position, color = 0x4da6ff, count = 10) {
        if (!this.initialized) return;
        
        const particlePositions = new Float32Array(count * 3);
        const particleColors = new Float32Array(count * 3);
        const particleScales = new Float32Array(count);
        const particleOpacities = new Float32Array(count);
        const particleVelocities = [];
        
        const colorObj = new THREE.Color(color);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Random position within a small sphere
            const radius = 0.2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            particlePositions[i3] = position.x + radius * Math.sin(phi) * Math.cos(theta);
            particlePositions[i3 + 1] = position.y + radius * Math.sin(phi) * Math.sin(theta);
            particlePositions[i3 + 2] = position.z + radius * Math.cos(phi);
            
            // Set color
            particleColors[i3] = colorObj.r;
            particleColors[i3 + 1] = colorObj.g;
            particleColors[i3 + 2] = colorObj.b;
            
            // Random size and opacity
            particleScales[i] = 0.2 + Math.random() * 0.3;
            particleOpacities[i] = 0.8 + Math.random() * 0.2;
            
            // Outward velocity
            particleVelocities.push({
                x: Math.sin(phi) * Math.cos(theta) * 0.02,
                y: Math.sin(phi) * Math.sin(theta) * 0.02,
                z: Math.cos(phi) * 0.02,
                life: 1.0 // Full life
            });
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));
        geometry.setAttribute('opacity', new THREE.BufferAttribute(particleOpacities, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: this.particleTexture }
            },
            vertexShader: `
                attribute vec3 color;
                attribute float scale;
                attribute float opacity;
                
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    vColor = color;
                    vOpacity = opacity;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = scale * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    gl_FragColor = vec4(vColor, vOpacity) * texture2D(pointTexture, gl_PointCoord);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData = {
            velocities: particleVelocities,
            lifetime: 2.0, // Seconds the particles will exist
            age: 0 // Current age in seconds
        };
        
        this.scene.add(particles);
        
        // Add to a temporary array for updating and removing
        if (!this.particleGroups.temporary) this.particleGroups.temporary = [];
        this.particleGroups.temporary.push(particles);
    }
    
    // Update temporary particles (like fish interaction particles)
    updateTemporaryParticles(deltaTime) {
        if (!this.particleGroups.temporary || !this.particleGroups.temporary.length) return;
        
        // Update each temporary particle system
        for (let i = this.particleGroups.temporary.length - 1; i >= 0; i--) {
            const particles = this.particleGroups.temporary[i];
            
            // Update age
            particles.userData.age += deltaTime;
            
            // Remove if too old
            if (particles.userData.age >= particles.userData.lifetime) {
                this.scene.remove(particles);
                particles.geometry.dispose();
                particles.material.dispose();
                this.particleGroups.temporary.splice(i, 1);
                continue;
            }
            
            // Calculate life percentage (1 = new, 0 = old)
            const lifeRatio = 1 - (particles.userData.age / particles.userData.lifetime);
            
            // Update positions and opacities
            const positions = particles.geometry.attributes.position.array;
            const opacities = particles.geometry.attributes.opacity.array;
            const velocities = particles.userData.velocities;
            
            for (let j = 0; j < positions.length / 3; j++) {
                const j3 = j * 3;
                
                // Update particle position
                positions[j3] += velocities[j].x;
                positions[j3 + 1] += velocities[j].y;
                positions[j3 + 2] += velocities[j].z;
                
                // Fade out opacity based on life
                opacities[j] = velocities[j].life * lifeRatio;
                
                // Slow down
                velocities[j].x *= 0.98;
                velocities[j].y *= 0.98;
                velocities[j].z *= 0.98;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            particles.geometry.attributes.opacity.needsUpdate = true;
        }
    }
}