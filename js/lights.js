/**
 * Lighting system for Three.js scene
 */
class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.lights = {};
        this.setupLights();
    }

    setupLights() {
        // Ambient light - very dim blue tint for underwater feel
        this.lights.ambient = new THREE.AmbientLight(0x001630, 0.2);
        this.scene.add(this.lights.ambient);

        // Directional light - main light source from above (moonlight)
        this.lights.directional = new THREE.DirectionalLight(0x3a85e0, 0.5);
        this.lights.directional.position.set(0, 10, 5);
        this.lights.directional.castShadow = true;
        this.lights.directional.shadow.mapSize.width = 1024;
        this.lights.directional.shadow.mapSize.height = 1024;
        this.lights.directional.shadow.camera.far = 50;
        this.lights.directional.shadow.camera.near = 0.5;
        this.scene.add(this.lights.directional);

        // Hemisphere light - subtle coloring for environment
        this.lights.hemisphere = new THREE.HemisphereLight(0x0a4a7c, 0x000a14, 0.3);
        this.scene.add(this.lights.hemisphere);

        // Create multiple point lights with different colors for bioluminescent effect
        this.createBioLights();
    }

    createBioLights() {
        const bioColors = [
            0x00ffff, // Cyan
            0x4dffa6, // Aqua green
            0x00a3ff, // Light blue
            0x4da6ff  // Blue
        ];

        // Create multiple point lights
        this.lights.bioluminescent = [];
        
        for (let i = 0; i < 5; i++) {
            const color = bioColors[i % bioColors.length];
            const intensity = 0.5 + Math.random() * 0.5;
            const distance = 5 + Math.random() * 5;
            
            const light = new THREE.PointLight(color, intensity, distance);
            light.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 5,
                (Math.random() - 0.5) * 20
            );
            
            // Add subtle animation data
            light.userData = {
                originalY: light.position.y,
                originalIntensity: intensity,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1.5
            };

            // Create light helper for debugging (uncomment if needed)
            // const sphereSize = 0.2;
            // const pointLightHelper = new THREE.PointLightHelper(light, sphereSize);
            // this.scene.add(pointLightHelper);
            
            this.lights.bioluminescent.push(light);
            this.scene.add(light);
        }
    }

    update(time) {
        // Animate bioluminescent lights
        this.lights.bioluminescent.forEach((light, i) => {
            const { originalY, originalIntensity, phase, speed } = light.userData;
            
            // Gentle floating motion
            light.position.y = originalY + Math.sin(time * 0.5 + phase) * 0.5;
            
            // Subtle intensity pulsing
            light.intensity = originalIntensity * (0.8 + 0.4 * Math.sin(time * speed + phase));
        });

        // Subtle movement of directional light
        this.lights.directional.position.x = Math.sin(time * 0.1) * 5;
        this.lights.directional.position.z = Math.cos(time * 0.1) * 5;
    }

    // Create a spotlight that follows a specific target (like a fish)
    createFollowSpotlight(target) {
        const spotLight = new THREE.SpotLight(0x4da6ff, 2, 10, Math.PI / 8, 0.5, 2);
        spotLight.position.set(0, 5, 0);
        spotLight.target = target;
        
        this.lights.followSpot = spotLight;
        this.scene.add(spotLight);
        
        return spotLight;
    }

    // Handle interactive lighting based on mouse position
    handleInteractiveLighting(mousePosition, camera) {
        // Create interactive light if it doesn't exist
        if (!this.lights.interactive) {
            this.lights.interactive = new THREE.PointLight(0x7acdff, 1, 10);
            this.scene.add(this.lights.interactive);
        }
        
        // Convert mouse position to 3D space
        const vector = new THREE.Vector3(mousePosition.x, mousePosition.y, 0.5);
        vector.unproject(camera);
        
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        
        // Smoothly move the light to the new position
        this.lights.interactive.position.lerp(pos, 0.05);
    }
}