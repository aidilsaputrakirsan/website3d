/**
 * Main scene manager for Three.js
 */
class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2(0, 0);
        this.raycaster = new THREE.Raycaster();
        this.intersectedObject = null;
        this.isInitialized = false;
        this.loadingPromises = [];
        this.loadingProgress = 0;
        
        // Initialize core components
        this.initScene();
        this.initCamera();
        this.initRenderer();
        
        // Initialize sub-systems
        this.initSystems();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Initialize post-processing
        this.initPostProcessing();
    }

    async init() {
        try {
            // Start loading all resources
            console.log('Initializing scene...');
            
            // Initialize lighting system
            this.lighting = new LightingSystem(this.scene);
            
            // Initialize and wait for all systems to load
            await Promise.all(this.loadingPromises);
            
            this.isInitialized = true;
            Utils.UI.hideLoadingScreen();
            console.log('Scene initialization complete');
            
            return true;
        } catch (error) {
            console.error('Error initializing scene:', error);
            return false;
        }
    }

    initScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x001020); // Dark blue background
        
        // Add fog for depth
        this.scene.fog = new THREE.FogExp2(0x001020, 0.035);
    }

    initCamera() {
        // Create perspective camera
        const fov = 60;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.1;
        const far = 100;
        
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0, 8, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Camera settings
        this.cameraSettings = {
            defaultPosition: new THREE.Vector3(0, 8, 15),
            defaultTarget: new THREE.Vector3(0, 0, 0),
            orbitRadius: 15,
            orbitSpeed: 0.05,
            orbitEnabled: true,
            maxOrbitY: 12,
            minOrbitY: 4
        };
    }

    // Perbaikan di scene.js - initRenderer
    initRenderer() {
        // Create WebGL renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        
        // Configure renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Gunakan outputColorSpace sebagai pengganti outputEncoding yang sudah deprecated
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }
    initSystems() {
        // Initialize particle system
        this.particleSystem = new ParticleSystem(this.scene);
        this.loadingPromises.push(
            this.particleSystem.initialize()
                .then(success => {
                    this.loadingProgress += 25;
                    this.updateLoadingProgress();
                })
        );
        
        // Initialize river system
        this.river = new River(this.scene);
        this.loadingPromises.push(
            this.river.initialize()
                .then(success => {
                    this.loadingProgress += 25;
                    this.updateLoadingProgress();
                })
        );
        
        // Initialize fish system
        this.fishSystem = new FishSystem(this.scene, this.particleSystem);
        this.loadingPromises.push(
            this.fishSystem.initialize()
                .then(success => {
                    this.loadingProgress += 25;
                    this.updateLoadingProgress();
                })
        );
    }

    updateLoadingProgress() {
        const loadingElement = document.querySelector('.loading-container p');
        if (loadingElement) {
            loadingElement.textContent = `Memuat Dunia Bioluminescence... ${Math.min(100, Math.round(this.loadingProgress))}%`;
        }
    }

    // Perbaikan initPostProcessing di scene.js
initPostProcessing() {
    // Coba-coba periksa apakah EffectComposer tersedia
    try {
        // Skip post-processing jika THREE.EffectComposer tidak tersedia
        if (typeof THREE.EffectComposer === 'undefined') {
            console.warn("Post-processing tidak tersedia. THREE.EffectComposer tidak ditemukan.");
            return;
        }
        
        // Initialize composer for post-processing effects
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // Skip jika RenderPass tidak tersedia
        if (typeof THREE.RenderPass === 'undefined') {
            console.warn("Post-processing tidak lengkap. THREE.RenderPass tidak ditemukan.");
            return;
        }
        
        // Add render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Skip jika UnrealBloomPass tidak tersedia
        if (typeof THREE.UnrealBloomPass === 'undefined') {
            console.warn("Bloom effect tidak tersedia. THREE.UnrealBloomPass tidak ditemukan.");
            return;
        }
        
        // Add bloom effect for glow
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
    } catch (error) {
        console.warn("Error initializing post-processing:", error);
    }
}

        // Perbaikan pada loadPostProcessingEffects di scene.js
        async loadPostProcessingEffects() {
            try {
                // Dynamically load required modules with proper paths for r159
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r159/examples/js/postprocessing/EffectComposer.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
                
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r159/examples/js/postprocessing/RenderPass.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
                
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r159/examples/js/postprocessing/ShaderPass.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
                
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r159/examples/js/postprocessing/UnrealBloomPass.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
                
                this.loadingProgress += 25;
                this.updateLoadingProgress();
                this.initPostProcessing();
            } catch (error) {
                console.error('Error loading post-processing effects:', error);
                // Fall back to standard rendering if post-processing fails
            }
        }

        // Perbaikan pada render method
        render() {
            // Check if post-processing is available
            if (this.composer && typeof THREE.EffectComposer !== 'undefined' && this.composer.render) {
                try {
                    this.composer.render();
                } catch (error) {
                    console.warn("Error in composer.render(), falling back to standard rendering:", error);
                    this.renderer.render(this.scene, this.camera);
                }
            } else {
                // Fallback to standard rendering
                this.renderer.render(this.scene, this.camera);
            }
        }

    initEventListeners() {
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Mouse movement
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Mouse click
        window.addEventListener('click', this.handleClick.bind(this));
        
        // Scroll event
        window.addEventListener('wheel', this.handleScroll.bind(this));
        
        // UI Controls
        document.getElementById('toggle-info').addEventListener('click', Utils.UI.toggleInfoPanel);
        document.getElementById('close-info').addEventListener('click', Utils.UI.toggleInfoPanel);
        document.getElementById('toggle-fullscreen').addEventListener('click', Utils.UI.toggleFullscreen);
    }

    handleResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Update composer
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    handleMouseMove(event) {
        // Calculate normalized mouse coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Handle interactive lighting
        if (this.lighting) {
            this.lighting.handleInteractiveLighting(this.mouse, this.camera);
        }
    }

    handleClick(event) {
        // Handle clicks on objects
        if (!this.isInitialized) return;
        
        // Update the raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Calculate objects intersecting the ray
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            // Create ripple in water if clicking on the river
            if (this.river && this.river.riverMesh) {
                if (intersects[0].object === this.river.riverMesh) {
                    const point = intersects[0].point;
                    this.river.createRipple(point, 3, 0.5);
                }
            }
        }
    }

    handleScroll(event) {
        // Handle smooth camera movement with scroll
        const scrollAmount = event.deltaY * 0.005;
        
        // Move camera up/down within limits
        const newY = this.camera.position.y + scrollAmount;
        if (newY > this.cameraSettings.minOrbitY && newY < this.cameraSettings.maxOrbitY) {
            this.camera.position.y = newY;
            
            // Adjust camera look target based on height
            const targetY = Utils.mapRange(
                newY,
                this.cameraSettings.minOrbitY,
                this.cameraSettings.maxOrbitY,
                -2,
                5
            );
            this.cameraSettings.defaultTarget.y = targetY;
            this.camera.lookAt(this.cameraSettings.defaultTarget);
        }
    }

    update() {
        if (!this.isInitialized) return;
        
        // Calculate time and delta
        const time = this.clock.getElapsedTime();
        const deltaTime = this.clock.getDelta();
        
        // Update camera position for orbit
        if (this.cameraSettings.orbitEnabled) {
            const angle = time * this.cameraSettings.orbitSpeed;
            this.camera.position.x = Math.sin(angle) * this.cameraSettings.orbitRadius;
            this.camera.position.z = Math.cos(angle) * this.cameraSettings.orbitRadius;
            this.camera.lookAt(this.cameraSettings.defaultTarget);
        }
        
        // Update systems
        if (this.lighting) {
            this.lighting.update(time);
        }
        
        if (this.river) {
            this.river.update(time, deltaTime, this.camera);
        }
        
        if (this.particleSystem) {
            this.particleSystem.update(time, deltaTime);
            this.particleSystem.updateTemporaryParticles(deltaTime);
        }
        
        if (this.fishSystem) {
            this.fishSystem.update(time, deltaTime, this.mouse, this.camera);
        }
        
        // Check for raycaster intersections for interactive elements
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        // Reset previously highlighted object
        if (this.intersectedObject) {
            this.intersectedObject.scale.set(1, 1, 1);
            this.intersectedObject = null;
        }
        
        // Highlight newly intersected object
        if (intersects.length > 0) {
            // Find parent object (fish or other interactive element)
            let object = intersects[0].object;
            while (object.parent && !(object.userData && object.userData.interactive)) {
                object = object.parent;
            }
            
            if (object.userData && object.userData.interactive) {
                this.intersectedObject = object;
                // Add subtle highlighting effect
                object.scale.set(1.1, 1.1, 1.1);
            }
        }
    }

}