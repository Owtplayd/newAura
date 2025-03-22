// game.js - Core game mechanics for AURA

document.addEventListener('DOMContentLoaded', function() {
    // Game state
    const gameState = {
        aura: 0,
        totalClicks: 0,
        auraPerClick: 1,
        passiveAuraPerSecond: 0,
        multiplier: 1,
        upgradesPurchased: 0,
        evolutions: 0,
        activeBoosts: []
    };
    
    // Player titles based on aura amount
    const playerTitles = [
        { threshold: 0, title: "Campus Nobody" },
        { threshold: 5000, title: "Lowkey Cool" },
        { threshold: 50000, title: "Certified Big Stepper" },
        { threshold: 250000, title: "Campus Legend" }
    ];
    
    // Define all upgrades
    const upgrades = {
        passive: [
            {
                id: "locked-in",
                name: "LOCKED IN",
                description: "Generates +2 aura/sec because you're \"always locked in.\"",
                cost: 10000,
                effect: () => { gameState.passiveAuraPerSecond += 2; },
                unlocked: false
            },
            {
                id: "big-back",
                name: "BIG BACK",
                description: "Generates +5 aura/sec (you're eating good, so you're focused).",
                cost: 50000,
                effect: () => { gameState.passiveAuraPerSecond += 5; },
                unlocked: false
            },
            {
                id: "blue-collar",
                name: "BLUE COLLAR",
                description: "Generates +10 aura/sec (flexing the LinkedIn update).",
                cost: 250000,
                effect: () => { gameState.passiveAuraPerSecond += 10; },
                unlocked: false
            }
        ],
        powerups: [
            {
                id: "fresh-air-forces",
                name: "FRESH AIR FORCES",
                description: "2x aura per click for 15 seconds.",
                cost: 5000,
                effect: () => { activateBoost("FRESH AIR FORCES", 15, 2); },
                unlocked: false
            },
            {
                id: "blue-check",
                name: "BLUE CHECK",
                description: "+5x aura per click for 20 seconds (you just got verified).",
                cost: 25000,
                effect: () => { activateBoost("BLUE CHECK", 20, 5); },
                unlocked: false
            },
            {
                id: "viral-moment",
                name: "VIRAL MOMENT",
                description: "Randomly boosts clicks by 2x–10x for 10 seconds (your tweet blew up).",
                cost: 100000,
                effect: () => { 
                    const randomMultiplier = Math.floor(Math.random() * 9) + 2; // 2-10
                    activateBoost("VIRAL MOMENT", 10, randomMultiplier); 
                },
                unlocked: false
            }
        ],
        risk: [
            {
                id: "fake-id",
                name: "FAKE ID",
                description: "10x aura per click for 10 seconds but lose 50% after.",
                cost: 20000,
                effect: () => { 
                    activateBoost("FAKE ID", 10, 10, () => {
                        gameState.aura = Math.floor(gameState.aura * 0.5);
                        updateAuraDisplay();
                        showNotification("BUSTED! Lost 50% of your aura.");
                    }); 
                },
                unlocked: false
            },
            {
                id: "ghosted",
                name: "GHOSTED",
                description: "A random event where you either lose 10% of your aura or gain 20%.",
                cost: 30000,
                effect: () => {
                    const isLucky = Math.random() > 0.5;
                    if (isLucky) {
                        gameState.aura = Math.floor(gameState.aura * 1.2);
                        showNotification("They replied! +20% aura gained.");
                    } else {
                        gameState.aura = Math.floor(gameState.aura * 0.9);
                        showNotification("Ghosted! Lost 10% of your aura.");
                    }
                    updateAuraDisplay();
                },
                unlocked: false
            },
            {
                id: "late-night",
                name: "LATE NIGHT CRAMMING",
                description: "Click speed doubled for 15 seconds, but aura/sec idle gain is paused for 30 seconds.",
                cost: 40000,
                effect: () => {
                    const oldPassiveRate = gameState.passiveAuraPerSecond;
                    
                    // Double click value
                    activateBoost("DOUBLE CLICKS", 15, 2);
                    
                    // Pause passive income
                    gameState.passiveAuraPerSecond = 0;
                    showNotification("Passive income paused for 30 seconds!");
                    
                    // Resume passive income after 30 seconds
                    setTimeout(() => {
                        gameState.passiveAuraPerSecond = oldPassiveRate;
                        showNotification("Passive income restored!");
                        updateStats();
                    }, 30000);
                },
                unlocked: false
            }
        ]
    };
    
    // Get DOM elements
    const auraText = document.querySelector('.aura-text');
    const auraCountElement = document.getElementById('aura-count');
    const auraPerSecondElement = document.getElementById('aura-per-second');
    const totalClicksElement = document.getElementById('total-clicks');
    const auraPerClickElement = document.getElementById('aura-per-click');
    const passiveIncomeElement = document.getElementById('passive-income');
    const upgradesPurchasedElement = document.getElementById('upgrades-purchased');
    const evolutionsElement = document.getElementById('evolutions');
    const playerTitleElement = document.querySelector('.player-title');
    const activeBoostsContainer = document.getElementById('active-boosts');
    const notificationsContainer = document.getElementById('notifications');
    const statsToggle = document.querySelector('.stats-toggle');
    const statsContent = document.querySelector('.stats-content');
    
    // Tab switching
    const upgradeTabButtons = document.querySelectorAll('.upgrade-tab');
    const upgradeContents = document.querySelectorAll('.upgrade-content');
    
    upgradeTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            upgradeTabButtons.forEach(btn => btn.classList.remove('active'));
            upgradeContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const tabName = button.getAttribute('data-tab');
            let contentId;
            
            if (tabName === 'passive') contentId = 'passive-upgrades';
            else if (tabName === 'powerups') contentId = 'powerup-upgrades';
            else if (tabName === 'risk') contentId = 'risk-upgrades';
            else if (tabName === 'prestige') contentId = 'prestige-upgrades';
            
            document.getElementById(contentId).classList.add('active');
        });
    });
    
    // Stats toggle
    statsToggle.addEventListener('click', () => {
        statsContent.classList.toggle('hidden');
    });
    
    // Main clicker functionality
    auraText.addEventListener('click', () => {
        // Update clicks and aura
        gameState.totalClicks++;
        const earningsPerClick = gameState.auraPerClick * gameState.multiplier;
        gameState.aura += earningsPerClick;
        
        // Create and show the floating number
        createFloatingNumber(earningsPerClick);
        
        // Add pulse animation
        auraCountElement.classList.add('pulse');
        setTimeout(() => {
            auraCountElement.classList.remove('pulse');
        }, 300);
        
        // Update displays
        updateAuraDisplay();
        
        // Update unlockable status
        checkUpgradeAvailability();
        updatePlayerTitle();
        checkMilestones();
    });
    
    // Create floating number when clicking
    function createFloatingNumber(amount) {
        const floater = document.createElement('div');
        floater.textContent = `+${amount}`;
        floater.style.position = 'absolute';
        floater.style.color = '#f3c902';
        floater.style.fontFamily = "'Press Start 2P', cursive";
        floater.style.fontSize = '1rem';
        floater.style.pointerEvents = 'none';
        
        // Random position near the AURA text
        const x = auraText.offsetLeft + (Math.random() * auraText.offsetWidth);
        const y = auraText.offsetTop + (Math.random() * 20);
        
        floater.style.left = `${x}px`;
        floater.style.top = `${y}px`;
        
        // Add to DOM
        document.querySelector('.game-container').appendChild(floater);
        
        // Animate and remove
        let opacity = 1;
        let posY = y;
        
        const animateFloater = () => {
            opacity -= 0.03;
            posY -= 1;
            floater.style.opacity = opacity;
            floater.style.top = `${posY}px`;
            
            if (opacity > 0) {
                requestAnimationFrame(animateFloater);
            } else {
                floater.remove();
            }
        };
        
        requestAnimationFrame(animateFloater);
    }
    
    // Setup upgrade buttons
    function setupUpgradeButtons() {
        // Set up passive upgrades
        upgrades.passive.forEach(upgrade => {
            const upgradeButton = document.querySelector(`#${upgrade.id} .buy-btn`);
            upgradeButton.addEventListener('click', () => purchaseUpgrade('passive', upgrade));
            upgradeButton.disabled = gameState.aura < upgrade.cost;
        });
        
        // Set up powerup upgrades
        upgrades.powerups.forEach(upgrade => {
            const upgradeButton = document.querySelector(`#${upgrade.id} .buy-btn`);
            upgradeButton.addEventListener('click', () => purchaseUpgrade('powerups', upgrade));
            upgradeButton.disabled = gameState.aura < upgrade.cost;
        });
        
        // Set up risk upgrades
        upgrades.risk.forEach(upgrade => {
            const upgradeButton = document.querySelector(`#${upgrade.id} .buy-btn`);
            upgradeButton.addEventListener('click', () => purchaseUpgrade('risk', upgrade));
            upgradeButton.disabled = gameState.aura < upgrade.cost;
        });
        
        // Evolution button
        document.querySelector('#evolve .evolve-btn').addEventListener('click', () => {
            if (gameState.aura >= 100000) {
                // Prestige mechanics
                gameState.evolutions++;
                gameState.auraPerClick += Math.max(1, Math.floor(gameState.auraPerClick * 0.01));
                gameState.aura = 0;
                updateAuraDisplay();
                updateStats();
                showNotification("EVOLVED! Permanent +1% boost per click.");
            }
        });
    }
    
    // Purchase an upgrade
    function purchaseUpgrade(category, upgrade) {
        if (gameState.aura >= upgrade.cost && !upgrade.unlocked) {
            // Deduct cost
            gameState.aura -= upgrade.cost;
            
            // Apply upgrade effect
            upgrade.effect();
            
            // Mark as purchased
            upgrade.unlocked = true;
            gameState.upgradesPurchased++;
            
            // Update UI
            const upgradeElement = document.getElementById(upgrade.id);
            upgradeElement.classList.remove('locked');
            const buyButton = upgradeElement.querySelector('.buy-btn');
            buyButton.textContent = "PURCHASED";
            buyButton.disabled = true;
            
            // Update displays
            updateAuraDisplay();
            updateStats();
            showNotification(`${upgrade.name} purchased!`);
        }
    }
    
    // Check which upgrades are available
    function checkUpgradeAvailability() {
        // Check passive upgrades
        upgrades.passive.forEach(upgrade => {
            if (!upgrade.unlocked) {
                const buyButton = document.querySelector(`#${upgrade.id} .buy-btn`);
                buyButton.disabled = gameState.aura < upgrade.cost;
            }
        });
        
        // Check powerup upgrades
        upgrades.powerups.forEach(upgrade => {
            if (!upgrade.unlocked) {
                const buyButton = document.querySelector(`#${upgrade.id} .buy-btn`);
                buyButton.disabled = gameState.aura < upgrade.cost;
            }
        });
        
        // Check risk upgrades
        upgrades.risk.forEach(upgrade => {
            if (!upgrade.unlocked) {
                const buyButton = document.querySelector(`#${upgrade.id} .buy-btn`);
                buyButton.disabled = gameState.aura < upgrade.cost;
            }
        });
        
        // Evolution button
        const evolveButton = document.querySelector('#evolve .evolve-btn');
        evolveButton.disabled = gameState.aura < 100000;
    }
    
    // Activate a timed boost
    function activateBoost(name, duration, multiplierValue, endCallback) {
        // Create a boost object
        const boost = {
            id: Date.now(),
            name: name,
            multiplier: multiplierValue,
            endTime: Date.now() + (duration * 1000)
        };
        
        // Apply the boost multiplier
        gameState.multiplier *= multiplierValue;
        
        // Add to active boosts
        gameState.activeBoosts.push(boost);
        
        // Update UI
        updateActiveBoosts();
        updateStats();
        
        // Show notification
        showNotification(`${name} activated! ${multiplierValue}x boost for ${duration} seconds.`);
        
        // Set timeout to remove the boost when done
        setTimeout(() => {
            // Remove the boost
            gameState.activeBoosts = gameState.activeBoosts.filter(b => b.id !== boost.id);
            
            // Recalculate multiplier (multiply all active boost multipliers)
            gameState.multiplier = 1;
            gameState.activeBoosts.forEach(b => {
                gameState.multiplier *= b.multiplier;
            });
            
            // Update UI
            updateActiveBoosts();
            updateStats();
            
            // Show notification
            showNotification(`${name} boost ended.`);
            
            // Execute callback if provided
            if (endCallback) {
                endCallback();
            }
        }, duration * 1000);
    }
    
    // Update the display of active boosts
    function updateActiveBoosts() {
        if (gameState.activeBoosts.length === 0) {
            activeBoostsContainer.innerHTML = '<p class="no-boosts">No active boosts</p>';
            return;
        }
        
        activeBoostsContainer.innerHTML = '';
        
        gameState.activeBoosts.forEach(boost => {
            const timeLeft = Math.max(0, Math.ceil((boost.endTime - Date.now()) / 1000));
            
            const boostElement = document.createElement('div');
            boostElement.className = 'boost-item';
            boostElement.innerHTML = `
                <span class="boost-name">${boost.name} (${boost.multiplier}x)</span>
                <span class="boost-timer">${timeLeft}s</span>
            `;
            
            activeBoostsContainer.appendChild(boostElement);
        });
    }
    
    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        notificationsContainer.appendChild(notification);
        
        // Remove after animation completes (3 seconds)
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Check for milestone achievements
    function checkMilestones() {
        // Check for Silver aura
        if (gameState.aura >= 100000) {
            const silverMilestone = document.getElementById('silver-milestone');
            if (silverMilestone.classList.contains('locked')) {
                silverMilestone.classList.remove('locked');
                silverMilestone.classList.add('unlocked');
                document.getElementById('aura-count').style.color = '#C0C0C0';
                document.getElementById('aura-count').style.textShadow = '0 0 5px rgba(192, 192, 192, 0.5)';
                showNotification("SILVER AURA ACHIEVED!");
            }
        }
        
        // Check for Gold aura
        if (gameState.aura >= 500000) {
            const goldMilestone = document.getElementById('gold-milestone');
            if (goldMilestone.classList.contains('locked')) {
                goldMilestone.classList.remove('locked');
                goldMilestone.classList.add('unlocked');
                document.getElementById('aura-count').style.color = '#FFD700';
                document.getElementById('aura-count').style.textShadow = '0 0 5px rgba(255, 215, 0, 0.5)';
                showNotification("GOLD AURA ACHIEVED!");
            }
        }
        
        // Check for Purple aura
        if (gameState.aura >= 1000000) {
            const purpleMilestone = document.getElementById('purple-milestone');
            if (purpleMilestone.classList.contains('locked')) {
                purpleMilestone.classList.remove('locked');
                purpleMilestone.classList.add('unlocked');
                document.getElementById('aura-count').style.color = '#9370DB';
                document.getElementById('aura-count').style.textShadow = '0 0 5px rgba(147, 112, 219, 0.5)';
                showNotification("PURPLE AURA ACHIEVED!");
            }
        }
    }
    
    // Update player title based on aura amount
    function updatePlayerTitle() {
        let newTitle = playerTitles[0].title;
        
        for (let i = playerTitles.length - 1; i >= 0; i--) {
            if (gameState.aura >= playerTitles[i].threshold) {
                newTitle = playerTitles[i].title;
                break;
            }
        }
        
        playerTitleElement.textContent = newTitle;
    }
    
    // Update aura display
    function updateAuraDisplay() {
        auraCountElement.textContent = formatNumber(gameState.aura);
        auraPerSecondElement.textContent = `+${gameState.passiveAuraPerSecond}/sec`;
    }
    
    // Update stats panel
    function updateStats() {
        totalClicksElement.textContent = formatNumber(gameState.totalClicks);
        auraPerClickElement.textContent = formatNumber(gameState.auraPerClick);
        passiveIncomeElement.textContent = `${formatNumber(gameState.passiveAuraPerSecond)}/sec`;
        upgradesPurchasedElement.textContent = gameState.upgradesPurchased;
        evolutionsElement.textContent = gameState.evolutions;
    }
    
    // Format large numbers with commas
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Passive income tick (per second)
    function passiveIncomeTick() {
        if (gameState.passiveAuraPerSecond > 0) {
            gameState.aura += gameState.passiveAuraPerSecond;
            updateAuraDisplay();
            checkUpgradeAvailability();
            updatePlayerTitle();
            checkMilestones();
        }
    }
    
    // Update active boosts timers
    function updateBoostTimers() {
        if (gameState.activeBoosts.length > 0) {
            updateActiveBoosts();
        }
    }
    
    // Initial setup
    updateAuraDisplay();
    updateStats();
    setupUpgradeButtons();
    
    // Game loops
    setInterval(passiveIncomeTick, 1000); // Passive income every second
    setInterval(updateBoostTimers, 1000); // Update boost timers every second
    
    // Welcome notification
    setTimeout(() => {
        showNotification("Welcome to AURA! Click the AURA text to begin.");
    }, 1000);
});