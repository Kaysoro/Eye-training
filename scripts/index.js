var normalSpeed = 0.5   ;
var fastSpeed = 1.5;
var minDuration = 700;
var maxDuration = 2000;

document.addEventListener("DOMContentLoaded", function(){

    // Service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/EyeTraining/sw.js', { scope: '/EyeTraining/' }).then(function(reg) {
    
        if(reg.installing) {
            console.log('SoundBox SW installing');
        } else if(reg.waiting) {
            console.log('SoundBox SW installed');
        } else if(reg.active) {
            console.log('SoundBox SW active');
        }
    
        }).catch(function(error) {
        console.log('Registration failed with ' + error);
        });
    }

    let deferredPrompt;
    const addBtn = document.getElementById('app');
    addBtn.style.display = 'none';

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        addBtn.style.display = 'block';

        addBtn.addEventListener('click', (e) => {
            // hide our user interface that shows our A2HS button
            addBtn.style.display = 'none';
            // Show the prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
                } else {
                console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            });
        });
    });

    // APP
    var action = {
        speed    : normalSpeed, // Groove length percentage
        direction: true       , // true means right or bottom, false means left or top
        duration : 1000       , // action duration in miliseconds
        position : 0          , // position in real time of the laser
    };
    
    // Drawing loop
    setInterval(function () {
        let device = document.getElementById("device");
        let groove = document.getElementById("groove");
        let laser = document.getElementById("laser");
        let laserSize = laser.scrollWidth;
        let horizontal = device.className === "device horizontal";
        let length = horizontal ? groove.scrollWidth - laserSize: groove.scrollHeight - laserSize;

        if (action.direction) {
            action.position += (action.speed * length / 100);
            if (action.position > length) {
                action.direction = false;
                action.position = length - (action.position - length)
            }
        } else {
            action.position -= (action.speed * length / 100);
            if (action.position < 0) {
                action.direction = true;
                action.position = Math.abs(action.position)
            }
        }
    
        // Draw
        if (horizontal) {
            laser.style.marginTop = 0;
            laser.style.marginLeft = action.position + "px"; 
        } else {
            laser.style.marginTop = action.position + "px";
            laser.style.marginLeft = 0; 
        }
    }, 20);
    
    // Random actions generated here
    setTimeout(function(){
        generateAction()
    }, action.duration);

    function generateAction(){
        let speed = Math.random() >= 0.75 ? fastSpeed: normalSpeed;
        let direction = Math.random() >= 0.25 ? !action.direction : action.direction;
        let duration = Math.random() * (maxDuration - minDuration) + minDuration;
        let position = action.position;
    
        action = {
            speed    : speed,
            direction: direction,
            duration : duration,
            position : position,
        };
    
        setTimeout(function(){
            generateAction()
        }, action.duration);
    }

    document.addEventListener('click', (event) => {
        let device = document.getElementById("device");
        device.className = device.className === "device horizontal" ? "device vertical" : "device horizontal";
    });
});
