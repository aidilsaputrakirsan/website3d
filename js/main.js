/**
 * Main application code for 3D Portfolio Website
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the 3D scene
    initializeScene();
    
    // Initialize navigation and UI
    initializeNavigation();
});

async function initializeScene() {
    // Get the canvas element
    const canvas = document.getElementById('scene-container');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // Create the scene manager
    window.sceneManager = new SceneManager(canvas);
    
    // Initialize the scene
    try {
        await window.sceneManager.init();
        
        // Start the animation loop once everything is loaded
        animationLoop();
    } catch (error) {
        console.error('Failed to initialize scene:', error);
    }
}

function animationLoop() {
    // Update scene
    if (window.sceneManager) {
        window.sceneManager.update();
        window.sceneManager.render();
    }
    
    // Continue animation loop
    requestAnimationFrame(animationLoop);
}

function initializeNavigation() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('nav a');
    
    // Get all sections
    const sections = document.querySelectorAll('.section');
    
    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get target section ID
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Update active nav link
                navLinks.forEach(link => link.classList.remove('active'));
                link.classList.add('active');
                
                // Scroll to section
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Track scroll position to update navigation
    const main = document.querySelector('main');
    if (main) {
        main.addEventListener('scroll', () => {
            // Find which section is currently in view
            let currentSectionId = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (main.scrollTop >= sectionTop - sectionHeight / 3) {
                    currentSectionId = section.getAttribute('id');
                    
                    // Update active class for sections
                    sections.forEach(s => {
                        if (s.getAttribute('id') === currentSectionId) {
                            s.classList.add('active');
                        } else {
                            s.classList.remove('active');
                        }
                    });
                }
            });
            
            // Update active nav link
            if (currentSectionId) {
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${currentSectionId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }
    
    // Handle form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(contactForm);
            const formDataObj = {};
            
            for (const [key, value] of formData.entries()) {
                formDataObj[key] = value;
            }
            
            // Show success message (in real implementation, you would send this data to a server)
            alert('Pesan telah dikirim! Terima kasih telah menghubungi.');
            contactForm.reset();
        });
    }
    
    // Initialize UI controls
    initializeUIControls();
}

function initializeUIControls() {
    // Toggle audio button
    const toggleAudioBtn = document.getElementById('toggle-audio');
    if (toggleAudioBtn) {
        // Create audio element for background ambient sound
        const audio = document.createElement('audio');
        audio.src = 'https://example.com/ambient.mp3'; // Placeholder URL - replace with actual ambient sound
        audio.loop = true;
        audio.volume = 0.3;
        document.body.appendChild(audio);
        
        toggleAudioBtn.addEventListener('click', () => {
            Utils.UI.toggleAudio(audio, toggleAudioBtn);
        });
    }
    
    // Handle window scroll animations
    window.addEventListener('scroll', () => {
        // Get all elements that should animate on scroll
        const animatedElements = document.querySelectorAll('.content');
        
        animatedElements.forEach(element => {
            // Check if element is in viewport
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('slide-up');
            }
        });
    });
    
    // Add mobile navigation toggle
    addMobileNavigation();
}

function addMobileNavigation() {
    // Create mobile nav toggle button
    const header = document.querySelector('header');
    if (header && window.innerWidth <= 768) {
        // Create hamburger menu if it doesn't exist
        if (!document.querySelector('.mobile-nav-toggle')) {
            const mobileNavToggle = document.createElement('button');
            mobileNavToggle.className = 'mobile-nav-toggle';
            mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
            
            header.appendChild(mobileNavToggle);
            
            // Toggle navigation on click
            mobileNavToggle.addEventListener('click', () => {
                const nav = document.querySelector('nav');
                nav.classList.toggle('mobile-active');
                
                // Toggle icon
                const icon = mobileNavToggle.querySelector('i');
                if (nav.classList.contains('mobile-active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            });
            
            // Add mobile-specific styles
            const style = document.createElement('style');
            style.textContent = `
                @media (max-width: 768px) {
                    header nav {
                        display: none;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        width: 100%;
                        background: rgba(5, 14, 20, 0.95);
                        padding: 20px;
                        backdrop-filter: blur(10px);
                    }
                    
                    header nav.mobile-active {
                        display: block;
                    }
                    
                    header nav ul {
                        flex-direction: column;
                    }
                    
                    header nav ul li {
                        margin: 10px 0;
                    }
                    
                    .mobile-nav-toggle {
                        display: block;
                        background: none;
                        border: none;
                        color: var(--text-color);
                        font-size: 1.5rem;
                        cursor: pointer;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Add scroll-based scene effects
function updateSceneOnScroll() {
    if (!window.sceneManager) return;
    
    const scrollPosition = document.querySelector('main').scrollTop;
    const totalHeight = document.querySelector('main').scrollHeight - window.innerHeight;
    const scrollPercentage = scrollPosition / totalHeight;
    
    // Adjust scene based on scroll position
    if (window.sceneManager.river) {
        // Slow down river flow as user scrolls down
        const flowSpeed = 0.3 - (scrollPercentage * 0.2);
        window.sceneManager.river.setFlowSpeed(flowSpeed);
        
        // Increase wave height as user scrolls down
        const waveHeight = 0.2 + (scrollPercentage * 0.3);
        const waveFrequency = 0.5 + (scrollPercentage * 0.5);
        window.sceneManager.river.setWaveProperties(waveHeight, waveFrequency);
    }
}

// Add scroll event listener for scene effects
document.querySelector('main')?.addEventListener('scroll', updateSceneOnScroll);

// Function to handle browser visibility changes (save resources when tab not visible)
function handleVisibilityChange() {
    if (document.hidden) {
        // Browser tab is hidden
        if (window.sceneManager) {
            window.sceneManager.cameraSettings.orbitEnabled = false;
        }
    } else {
        // Browser tab is visible
        if (window.sceneManager) {
            window.sceneManager.cameraSettings.orbitEnabled = true;
        }
    }
}

// Listen for visibility changes
document.addEventListener('visibilitychange', handleVisibilityChange);

// Add preloader for textures and models
function preloadAssets() {
    const assetsToPreload = [
        'assets/textures/water_normal.jpg',
        'assets/textures/particle.png'
    ];
    
    const preloadPromises = assetsToPreload.map(url => {
        return new Promise((resolve, reject) => {
            if (url.endsWith('.jpg') || url.endsWith('.png')) {
                const img = new Image();
                img.onload = () => resolve(url);
                img.onerror = () => reject(`Failed to load ${url}`);
                img.src = url;
            } else {
                // For other file types, resolve immediately
                resolve(url);
            }
        });
    });
    
    return Promise.all(preloadPromises);
}

// Immediately invoke preloading
preloadAssets().catch(error => console.warn('Asset preloading issue:', error));