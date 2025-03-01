/**
 * Bioluminescent fish implementation for Three.js scene
 */
class FishSystem {
    constructor(scene, particleSystem) {
        this.scene = scene;
        this.particleSystem = particleSystem;
        this.fishes = [];
        this.fishCount = 15;
        this.swimBounds = {
            minX: -15, maxX: 15,
            minY: 2, maxY: 10,
            minZ: -15, maxZ: 15
        };
    }

    async initialize() {
        try {
            // Create custom fish model (procedural) instead of loading external model
            this.createFishSchool();
            return true;
        } catch (error) {
            console.error('Error initializing fish system:', error);
            return false;
        }
    }

    createFishSchool() {
        // Create multiple fish
        for (let i = 0; i < this.fishCount; i++) {
            const fish = this.createFish();
            
            // Set random position within bounds
            fish.position.set(
                Utils.random(this.swimBounds.minX, this.swimBounds.maxX),
                Utils.random(this.swimBounds.minY, this.swimBounds.maxY),
                Utils.random(this.swimBounds.minZ, this.swimBounds.maxZ)
            );
            
            // Set random scale (varying fish sizes)
            const scale = Utils.random(0.6, 1.2);
            fish.scale.set(scale, scale, scale);
            
            // Set random rotation
            fish.rotation.y = Utils.random(0, Math.PI * 2);
            
            // Add movement parameters
            fish.userData = {
                velocity: new THREE.Vector3(
                    Utils.random(-0.02, 0.02),
                    Utils.random(-0.01, 0.01),
                    Utils.random(-0.02, 0.02)
                ),
                acceleration: new THREE.Vector3(0, 0, 0),
                maxSpeed: Utils.random(0.03, 0.08),
                rotationSpeed: Utils.random(0.05, 0.1),
                targetPosition: new THREE.Vector3(
                    Utils.random(this.swimBounds.minX, this.swimBounds.maxX),
                    Utils.random(this.swimBounds.minY, this.swimBounds.maxY),
                    Utils.random(this.swimBounds.minZ, this.swimBounds.maxZ)
                ),
                cohesionFactor: Utils.random(0.0005, 0.002),
                alignmentFactor: Utils.random(0.01, 0.03),
                separationFactor: Utils.random(0.01, 0.04),
                targetChangeCooldown: 0,
                tailAnimPhase: Utils.random(0, Math.PI * 2),
                tailAnimSpeed: Utils.random(5, 10),
                interacted: false,
                glowIntensity: Utils.random(0.5, 1.0),
                glowColor: new THREE.Color()
            };
            
            // Set random glow color
            this.setRandomGlowColor(fish);
            
            // Add to fishes array
            this.fishes.push(fish);
            
            // Add to scene
            this.scene.add(fish);
        }
    }

    createFish() {
        // Create a group for the fish
        const fishGroup = new THREE.Group();
        
        // Create fish body geometry (elongated ellipsoid)
        const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        bodyGeometry.scale(1, 0.7, 1.5);
        
        // Create tail geometry
        const tailGeometry = new THREE.ConeGeometry(0.5, 1.2, 3);
        tailGeometry.rotateX(Math.PI / 2);
        tailGeometry.translate(0, 0, 1.2);
        
        // Create fins geometry
        const finGeometry = new THREE.ConeGeometry(0.3, 0.8, 2);
        finGeometry.rotateZ(Math.PI / 2);
        
        // Create materials with varying glow properties
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a3a4a,
            emissive: 0x4da6ff,
            emissiveIntensity: 0.5,
            shininess: 70,
            transparent: true,
            opacity: 0.9
        });
        
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a3a4a,
            emissive: 0x4da6ff,
            emissiveIntensity: 0.3,
            shininess: 70,
            transparent: true,
            opacity: 0.8
        });
        
        // Create mesh parts
        const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        fishGroup.add(bodyMesh);
        
        const tailMesh = new THREE.Mesh(tailGeometry, tailMaterial);
        tailMesh.name = 'tail';
        fishGroup.add(tailMesh);
        
        // Add left fin
        const leftFin = new THREE.Mesh(finGeometry, tailMaterial);
        leftFin.position.set(-0.5, 0, 0.2);
        leftFin.name = 'leftFin';
        fishGroup.add(leftFin);
        
        // Add right fin
        const rightFin = new THREE.Mesh(finGeometry, tailMaterial);
        rightFin.rotation.z = Math.PI;
        rightFin.position.set(0.5, 0, 0.2);
        rightFin.name = 'rightFin';
        fishGroup.add(rightFin);
        
        // Add glowing spots
        this.addGlowingSpots(fishGroup);
        
        // Add subtle point light to make fish glow
        const light = new THREE.PointLight(0x4da6ff, 1, 3);
        light.position.set(0, 0, 0);
        light.name = 'fishLight';
        fishGroup.add(light);
        
        return fishGroup;
    }

    addGlowingSpots(fishGroup) {
        // Create glowing spots along the body
        const spotCount = Math.floor(Utils.random(3, 7));
        const spotMaterial = new THREE.MeshBasicMaterial({
            color: 0x4da6ff, 
            transparent: true, 
            opacity: 0.9
        });
        
        for (let i = 0; i < spotCount; i++) {
            const spotSize = Utils.random(0.05, 0.1);
            const spotGeometry = new THREE.SphereGeometry(spotSize, 8, 8);
            const spot = new THREE.Mesh(spotGeometry, spotMaterial);
            
            // Position spots along the body
            const angle = Utils.random(0, Math.PI * 2);
            const radius = 0.45;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.7;
            const z = Utils.random(-0.8, 0.8);
            
            spot.position.set(x, y, z);
            spot.name = 'glowSpot';
            fishGroup.add(spot);
        }
    }

    // Perbaikan fungsi setRandomGlowColor di fish.js
        setRandomGlowColor(fish) {
            // Choose from bioluminescent color palette
            const glowColors = [
                0x00ffff, // Cyan
                0x4dffa6, // Aqua green
                0x00a3ff, // Light blue
                0x4da6ff  // Blue
            ];
            
            const colorIndex = Math.floor(Math.random() * glowColors.length);
            const glowColor = glowColors[colorIndex];
            
            // Set color to all glowing elements
            fish.userData.glowColor = new THREE.Color(glowColor);
            
            // Update light color
            const light = fish.getObjectByName('fishLight');
            if (light) {
                light.color.set(glowColor);
            }
            
            // Update emissive color for body and tail
            fish.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Check if the material has emissive property before trying to set it
                    if (child.material.emissive !== undefined) {
                        child.material.emissive.set(glowColor);
                    } else {
                        // For materials without emissive property (like MeshBasicMaterial)
                        // Just set the color instead
                        child.material.color.set(glowColor);
                    }
                    
                    // Spots should be fully emissive
                    if (child.name === 'glowSpot') {
                        child.material.color.set(glowColor);
                    }
                }
            });
        }

    update(time, deltaTime, mousePosition = null, camera = null) {
        // Update each fish
        this.fishes.forEach((fish, index) => {
            this.updateFishMovement(fish, index, time, deltaTime);
            this.updateFishAnimation(fish, time);
            this.updateFishGlow(fish, time);
            
            // Handle mouse interaction if mouse position is provided
            if (mousePosition && camera) {
                this.handleMouseInteraction(fish, mousePosition, camera);
            }
        });
    }

    updateFishMovement(fish, index, time, deltaTime) {
        const { 
            velocity, acceleration, maxSpeed, targetPosition, 
            targetChangeCooldown, cohesionFactor, alignmentFactor, separationFactor 
        } = fish.userData;
        
        // Update cooldown for changing target
        fish.userData.targetChangeCooldown -= deltaTime;
        
        // Occasionally change target
        if (fish.userData.targetChangeCooldown <= 0) {
            fish.userData.targetPosition.set(
                Utils.random(this.swimBounds.minX, this.swimBounds.maxX),
                Utils.random(this.swimBounds.minY, this.swimBounds.maxY),
                Utils.random(this.swimBounds.minZ, this.swimBounds.maxZ)
            );
            fish.userData.targetChangeCooldown = Utils.random(5, 15); // seconds
        }
        
        // Reset acceleration
        acceleration.set(0, 0, 0);
        
        // Seek behavior - move towards target
        const seekForce = new THREE.Vector3();
        seekForce.subVectors(targetPosition, fish.position);
        seekForce.normalize();
        seekForce.multiplyScalar(0.0005);
        acceleration.add(seekForce);
        
        // Flocking behavior
        if (this.fishes.length > 1) {
            // Cohesion - move towards center of nearby fish
            const cohesion = this.calculateCohesion(fish, index);
            cohesion.multiplyScalar(cohesionFactor);
            acceleration.add(cohesion);
            
            // Alignment - align with nearby fish
            const alignment = this.calculateAlignment(fish, index);
            alignment.multiplyScalar(alignmentFactor);
            acceleration.add(alignment);
            
            // Separation - avoid crowding nearby fish
            const separation = this.calculateSeparation(fish, index);
            separation.multiplyScalar(separationFactor);
            acceleration.add(separation);
        }
        
        // Add some noise/randomness to movement
        const noise = new THREE.Vector3(
            (Math.sin(time + index) * 0.0001),
            (Math.cos(time * 0.7 + index) * 0.00005),
            (Math.sin(time * 0.5 + index) * 0.0001)
        );
        acceleration.add(noise);
        
        // Update velocity
        velocity.add(acceleration);
        
        // Limit speed
        if (velocity.length() > maxSpeed) {
            velocity.normalize();
            velocity.multiplyScalar(maxSpeed);
        }
        
        // Update position
        fish.position.add(velocity);
        
        // Rotate fish to face direction of movement
        if (velocity.length() > 0.001) {
            const targetRotation = Math.atan2(velocity.x, velocity.z);
            
            // Smooth rotation
            let angleDiff = targetRotation - fish.rotation.y;
            
            // Handle angle wrapping
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            fish.rotation.y += angleDiff * fish.userData.rotationSpeed;
        }
        
        // Boundary checking - make fish turn around at boundaries
        this.applyBoundaries(fish);
    }

    calculateCohesion(fish, fishIndex) {
        const cohesionForce = new THREE.Vector3();
        let count = 0;
        
        // Find center of nearby fish
        this.fishes.forEach((otherFish, i) => {
            if (i !== fishIndex) {
                const distance = fish.position.distanceTo(otherFish.position);
                
                if (distance < 5) {
                    cohesionForce.add(otherFish.position);
                    count++;
                }
            }
        });
        
        // Calculate average position
        if (count > 0) {
            cohesionForce.divideScalar(count);
            return cohesionForce.sub(fish.position);
        }
        
        return new THREE.Vector3();
    }

    calculateAlignment(fish, fishIndex) {
        const alignmentForce = new THREE.Vector3();
        let count = 0;
        
        // Align with average velocity of nearby fish
        this.fishes.forEach((otherFish, i) => {
            if (i !== fishIndex) {
                const distance = fish.position.distanceTo(otherFish.position);
                
                if (distance < 4) {
                    alignmentForce.add(otherFish.userData.velocity);
                    count++;
                }
            }
        });
        
        // Calculate average velocity
        if (count > 0) {
            alignmentForce.divideScalar(count);
            return alignmentForce;
        }
        
        return new THREE.Vector3();
    }

    calculateSeparation(fish, fishIndex) {
        const separationForce = new THREE.Vector3();
        let count = 0;
        
        // Move away from nearby fish
        this.fishes.forEach((otherFish, i) => {
            if (i !== fishIndex) {
                const distance = fish.position.distanceTo(otherFish.position);
                
                if (distance < 2) {
                    const diff = new THREE.Vector3();
                    diff.subVectors(fish.position, otherFish.position);
                    diff.normalize();
                    diff.divideScalar(Math.max(0.1, distance)); // Closer fish have more influence
                    separationForce.add(diff);
                    count++;
                }
            }
        });
        
        // Calculate average separation
        if (count > 0) {
            separationForce.divideScalar(count);
        }
        
        return separationForce;
    }

    applyBoundaries(fish) {
        const { position, userData } = fish;
        const turnFactor = 0.05;
        
        // X boundaries
        if (position.x < this.swimBounds.minX) {
            userData.velocity.x += turnFactor;
        } else if (position.x > this.swimBounds.maxX) {
            userData.velocity.x -= turnFactor;
        }
        
        // Y boundaries
        if (position.y < this.swimBounds.minY) {
            userData.velocity.y += turnFactor;
        } else if (position.y > this.swimBounds.maxY) {
            userData.velocity.y -= turnFactor;
        }
        
        // Z boundaries
        if (position.z < this.swimBounds.minZ) {
            userData.velocity.z += turnFactor;
        } else if (position.z > this.swimBounds.maxZ) {
            userData.velocity.z -= turnFactor;
        }
    }

    updateFishAnimation(fish, time) {
        // Animate tail and fins
        const tail = fish.getObjectByName('tail');
        if (tail) {
            const { tailAnimPhase, tailAnimSpeed, velocity } = fish.userData;
            const speed = velocity.length() * 50; // Adjust tail movement based on speed
            
            // Swing tail side to side
            tail.rotation.y = Math.sin(time * tailAnimSpeed + tailAnimPhase) * 0.3 * speed;
        }
        
        // Animate fins
        const leftFin = fish.getObjectByName('leftFin');
        const rightFin = fish.getObjectByName('rightFin');
        
        if (leftFin && rightFin) {
            const finSpeed = 0.7;
            leftFin.rotation.x = Math.sin(time * finSpeed + Math.PI) * 0.2;
            rightFin.rotation.x = Math.sin(time * finSpeed) * 0.2;
        }
    }

    updateFishGlow(fish, time) {
        // Pulse the glow intensity
        const { glowIntensity, tailAnimPhase, glowColor } = fish.userData;
        const pulseFrequency = 0.5 + tailAnimPhase * 0.2; // Different for each fish
        const pulseFactor = 0.5 + 0.5 * Math.sin(time * pulseFrequency);
        const currentIntensity = glowIntensity * pulseFactor;
        
        // Update light intensity
        const light = fish.getObjectByName('fishLight');
        if (light) {
            light.intensity = currentIntensity;
        }
        
        // Update material glow (emissive intensity)
        fish.traverse((child) => {
            if (child.isMesh) {
                if (child.name === 'glowSpot') {
                    // Glow spots have more intense pulsing
                    child.material.opacity = 0.7 + 0.3 * pulseFactor;
                } else {
                    // Body and fins have subtle pulsing
                    child.material.emissiveIntensity = currentIntensity * 0.5;
                }
            }
        });
        
        // Add particle trail occasionally
        if (this.particleSystem && Math.random() < 0.02) {
            // Get position behind the fish
            const trailPos = new THREE.Vector3(0, 0, 1.5);
            trailPos.applyMatrix4(fish.matrixWorld);
            
            // Emit particles with the fish's color
            this.particleSystem.emitParticles(
                trailPos, 
                glowColor.getHex(), 
                Math.floor(1 + Math.random() * 3)
            );
        }
    }

    handleMouseInteraction(fish, mousePosition, camera) {
        // Create a raycaster from the mouse position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mousePosition, camera);
        
        // Check for intersection with the fish
        const intersects = raycaster.intersectObject(fish, true);
        
        if (intersects.length > 0) {
            // Fish was clicked or hovered
            const oldInteracted = fish.userData.interacted;
            fish.userData.interacted = true;
            
            // If this is the first frame it's being interacted with
            if (!oldInteracted) {
                // Increase glow
                fish.userData.glowIntensity = 1.5;
                
                // Make fish swim away quickly
                const escapeDirection = new THREE.Vector3();
                escapeDirection.subVectors(fish.position, camera.position);
                escapeDirection.normalize();
                
                fish.userData.velocity.add(escapeDirection.multiplyScalar(0.05));
                
                // Generate particles
                if (this.particleSystem) {
                    this.particleSystem.emitParticles(
                        fish.position, 
                        fish.userData.glowColor.getHex(), 
                        10
                    );
                }
            }
        } else {
            // Reset interaction state
            fish.userData.interacted = false;
            
            // Gradually return to normal glow level
            if (fish.userData.glowIntensity > 1.0) {
                fish.userData.glowIntensity *= 0.95;
            }
        }
    }
}