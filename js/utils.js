/**
 * Utility functions for 3D Portfolio website
 */

// Function to normalize value between two ranges
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Generate a random number between min and max
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Load GLB model with error handling
async function loadModel(url) {
    const GLTFLoader = await importGLTFLoader();
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            url,
            (gltf) => resolve(gltf),
            (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
            (error) => reject(error)
        );
    });
}

// Import GLTFLoader dynamically
async function importGLTFLoader() {
    const GLTFLoader = await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r159/addons/loaders/GLTFLoader.min.js';
        script.onload = () => resolve(THREE.GLTFLoader);
        document.head.appendChild(script);
    });
    return GLTFLoader;
}

// Load texture with error handling
function loadTexture(url) {
    return new Promise((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            url,
            (texture) => resolve(texture),
            undefined,
            (error) => reject(error)
        );
    });
}

// Easing functions
const Easing = {
    // Sine
    easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    
    // Cubic
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    
    // Elastic
    easeOutElastic: (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
};

// Handle device detection
const Device = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTablet: /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent),
    isDesktop: !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
};

// Handle UI elements
const UI = {
    toggleInfoPanel: () => {
        const infoPanel = document.querySelector('.info-panel');
        infoPanel.classList.toggle('active');
    },
    
    toggleFullscreen: () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    },
    
    toggleAudio: (audioElement, buttonElement) => {
        if (audioElement.paused) {
            audioElement.play();
            buttonElement.querySelector('i').classList.replace('fa-volume-mute', 'fa-volume-up');
        } else {
            audioElement.pause();
            buttonElement.querySelector('i').classList.replace('fa-volume-up', 'fa-volume-mute');
        }
    },
    
    hideLoadingScreen: () => {
        const loadingScreen = document.querySelector('.loading-container');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    }
};

// Export utilities
const Utils = {
    mapRange,
    random,
    loadModel,
    loadTexture,
    Easing,
    Device,
    UI
};