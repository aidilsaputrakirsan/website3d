/**
 * Dynamic river implementation for Three.js scene
 */
class River {
    constructor(scene, width = 30, length = 60) {
        this.scene = scene;
        this.width = width;
        this.length = length;
        this.riverMesh = null;
        this.flowSpeed = 0.3;
        this.waveHeight = 0.2;
        this.waveFrequency = 0.5;
    }

    async initialize() {
        try {
            // Load water normal texture
            this.waterTexture = await Utils.loadTexture('assets/textures/water_normal.jpg');
            this.waterTexture.wrapS = this.waterTexture.wrapT = THREE.RepeatWrapping;
            this.waterTexture.repeat.set(5, 10);
            
            this.createRiverGeometry();
            this.createShaderMaterial();
            this.addToScene();
            
            // Add riverbed and banks
            this.createRiverBed();
            this.createRiverBanks();
            
            return true;
        } catch (error) {
            console.error('Error initializing river:', error);
            return false;
        }
    }

    createRiverGeometry() {
        // Create a plane for the river surface with high segment count for wave animation
        this.riverGeometry = new THREE.PlaneGeometry(
            this.width, 
            this.length, 
            this.width, 
            this.length * 2 // More segments on length for better flow animation
        );
        
        // Rotate to horizontal and position
        this.riverGeometry.rotateX(-Math.PI / 2);
        
        // Store original positions for animation
        this.originalPositions = [...this.riverGeometry.attributes.position.array];
    }

    createShaderMaterial() {
        // Custom shader material for dynamic water
        this.riverMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                normalMap: { value: this.waterTexture },
                flowSpeed: { value: this.flowSpeed },
                waveHeight: { value: this.waveHeight },
                waveFrequency: { value: this.waveFrequency },
                color: { value: new THREE.Color(0x0a4a7c) },
                deepColor: { value: new THREE.Color(0x001630) },
                fogColor: { value: new THREE.Color(0x001020) },
                fogNear: { value: 5 },
                fogFar: { value: 50 }
            },
            vertexShader: `
                uniform float time;
                uniform float waveHeight;
                uniform float waveFrequency;
                uniform float flowSpeed;
                
                varying vec2 vUv;
                varying float vElevation;
                
                void main() {
                    vUv = uv;
                    
                    // Create wave pattern based on position and time
                    float waveX = sin(position.x * waveFrequency + time * 2.0) * 0.5;
                    float waveZ = sin(position.z * waveFrequency * 0.8 + time * 1.5) * 0.5;
                    float waveXZ = sin(position.x * waveFrequency * 0.3 + position.z * waveFrequency * 0.5 + time) * 0.5;
                    
                    // Combine waves
                    float elevation = (waveX + waveZ + waveXZ) * waveHeight;
                    
                    // Flow effect (moving in -z direction)
                    float flowOffset = time * flowSpeed;
                    vUv.y += flowOffset;
                    
                    // Store elevation for fragment shader
                    vElevation = elevation;
                    
                    // Apply to vertex position
                    vec3 newPosition = position;
                    newPosition.y += elevation;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D normalMap;
                uniform vec3 color;
                uniform vec3 deepColor;
                uniform vec3 fogColor;
                uniform float fogNear;
                uniform float fogFar;
                
                varying vec2 vUv;
                varying float vElevation;
                
                void main() {
                    // Sample normal map
                    vec3 normal = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
                    
                    // Mix colors based on elevation to create depth effect
                    float depthFactor = smoothstep(-0.2, 0.2, vElevation);
                    vec3 finalColor = mix(deepColor, color, depthFactor);
                    
                    // Add normal-based color variation for more realistic water
                    finalColor += normal.x * 0.1;
                    
                    // Apply some opacity variation
                    float alpha = 0.9 + normal.x * 0.1;
                    
                    // Fog effect for depth
                    float depth = gl_FragCoord.z / gl_FragCoord.w;
                    float fogFactor = smoothstep(fogNear, fogFar, depth);
                    finalColor = mix(finalColor, fogColor, fogFactor * 0.6);
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
    }

    addToScene() {
        this.riverMesh = new THREE.Mesh(this.riverGeometry, this.riverMaterial);
        this.riverMesh.position.y = 0;
        this.riverMesh.receiveShadow = true;
        this.scene.add(this.riverMesh);
    }

    createRiverBed() {
        // Create a darker floor below the river
        const floorGeometry = new THREE.PlaneGeometry(this.width - 1, this.length - 1, 1, 1);
        floorGeometry.rotateX(-Math.PI / 2);
        
        const floorMaterial = new THREE.MeshPhongMaterial({
            color: 0x00111f,
            emissive: 0x001630,
            shininess: 0,
            flatShading: true
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = -2; // Below the river
        this.scene.add(floor);

        // Add some random rocks on the riverbed
        this.addRocks();
    }

    addRocks() {
        const rockCount = 25;
        const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a3a4a,
            roughness: 0.8,
            metalness: 0.2
        });
        
        for (let i = 0; i < rockCount; i++) {
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            
            // Random position along riverbed
            rock.position.x = (Math.random() - 0.5) * (this.width - 5);
            rock.position.y = -1.9 + Math.random() * 0.5; // Slightly above riverbed
            rock.position.z = (Math.random() - 0.5) * (this.length - 5);
            
            // Random scale and rotation
            const scale = 0.2 + Math.random() * 0.8;
            rock.scale.set(
                scale * (0.8 + Math.random() * 0.4),
                scale * (0.8 + Math.random() * 0.4),
                scale * (0.8 + Math.random() * 0.4)
            );
            
            rock.rotation.x = Math.random() * Math.PI;
            rock.rotation.y = Math.random() * Math.PI;
            rock.rotation.z = Math.random() * Math.PI;
            
            rock.castShadow = true;
            rock.receiveShadow = true;
            
            this.scene.add(rock);
        }
    }

    createRiverBanks() {
        // Create river banks on both sides
        const bankGeometry = new THREE.BoxGeometry(this.width + 10, 5, this.length + 10);
        const bankMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a1a25,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Create a hole in the middle for the river
        const holeGeometry = new THREE.BoxGeometry(this.width, 8, this.length);
        
        // Use CSG (Constructive Solid Geometry) to subtract the hole from the bank
        // Since Three.js doesn't have built-in CSG, we'll position multiple boxes instead
        
        // Top bank (surrounds the river)
        const bankTop = new THREE.Mesh(bankGeometry, bankMaterial);
        bankTop.position.y = -2.5;
        
        // Make the center hollow by creating side banks
        const bankLeft = new THREE.Mesh(
            new THREE.BoxGeometry(5, 5, this.length + 10),
            bankMaterial
        );
        bankLeft.position.set(-(this.width / 2 + 2.5), -2.5, 0);
        
        const bankRight = new THREE.Mesh(
            new THREE.BoxGeometry(5, 5, this.length + 10),
            bankMaterial
        );
        bankRight.position.set(this.width / 2 + 2.5, -2.5, 0);
        
        // Add front and back banks
        const bankFront = new THREE.Mesh(
            new THREE.BoxGeometry(this.width + 10, 5, 5),
            bankMaterial
        );
        bankFront.position.set(0, -2.5, this.length / 2 + 2.5);
        
        const bankBack = new THREE.Mesh(
            new THREE.BoxGeometry(this.width + 10, 5, 5),
            bankMaterial
        );
        bankBack.position.set(0, -2.5, -(this.length / 2 + 2.5));
        
        this.scene.add(bankLeft, bankRight, bankFront, bankBack);
    }

    update(time, deltaTime, camera) {
        if (!this.riverMesh) return;
        
        // Update time uniform for shader animations
        this.riverMaterial.uniforms.time.value = time;
        
        // Optional: Adjust wave height based on camera distance for performance
        const distanceToCamera = camera.position.distanceTo(this.riverMesh.position);
        const detailLevel = Math.max(0.1, Math.min(1.0, 30 / distanceToCamera));
        this.riverMaterial.uniforms.waveHeight.value = this.waveHeight * detailLevel;
    }

    // Methods for interactive features
    
    // Create a ripple effect at a specific position
    createRipple(position, radius = 1, strength = 0.5) {
        if (!this.riverMesh) return;
        
        // Get river mesh local position
        const localPosition = new THREE.Vector3();
        localPosition.copy(position);
        this.riverMesh.worldToLocal(localPosition);
        
        // Get all vertices of the river geometry
        const positions = this.riverGeometry.attributes.position.array;
        
        // Apply ripple effect to each vertex
        for (let i = 0; i < positions.length; i += 3) {
            const vertexX = positions[i];
            const vertexZ = positions[i + 2];
            
            // Calculate distance from ripple center
            const dx = vertexX - localPosition.x;
            const dz = vertexZ - localPosition.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            // If within radius, apply ripple effect
            if (distance < radius) {
                // Calculate ripple height using an exponential decay function
                const rippleHeight = strength * Math.exp(-distance / (radius * 0.3)) * Math.sin(distance * 10);
                
                // Apply to vertex
                positions[i + 1] += rippleHeight;
            }
        }
        
        // Update geometry
        this.riverGeometry.attributes.position.needsUpdate = true;
        
        // Gradually restore to original positions over time
        setTimeout(() => {
            this.smoothRestoreGeometry();
        }, 50);
    }
    
    // Gradually restore river geometry to original form
    smoothRestoreGeometry() {
        if (!this.riverMesh) return;
        
        const positions = this.riverGeometry.attributes.position.array;
        const originalPositions = this.originalPositions;
        
        // Apply a very small adjustment towards original position
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += (originalPositions[i + 1] - positions[i + 1]) * 0.1;
        }
        
        this.riverGeometry.attributes.position.needsUpdate = true;
    }
    
    // Adjust flow speed (user interaction)
    setFlowSpeed(speed) {
        this.flowSpeed = speed;
        if (this.riverMaterial) {
            this.riverMaterial.uniforms.flowSpeed.value = speed;
        }
    }
    
    // Adjust wave height and frequency
    setWaveProperties(height, frequency) {
        this.waveHeight = height;
        this.waveFrequency = frequency;
        
        if (this.riverMaterial) {
            this.riverMaterial.uniforms.waveHeight.value = height;
            this.riverMaterial.uniforms.waveFrequency.value = frequency;
        }
    }
}