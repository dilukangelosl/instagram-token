document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const setupView = document.getElementById('setup-view');
    const resultView = document.getElementById('result-view');
    const tokenDisplay = document.getElementById('token-display');
    const copyBtn = document.getElementById('copy-btn');
    const resetBtn = document.getElementById('reset-btn');

    let authWindow = null;

    loginBtn.addEventListener('click', () => {
        // Open auth window
        const width = 600;
        const height = 700;
        const left = (window.innerWidth / 2) - (width / 2);
        const top = (window.innerHeight / 2) - (height / 2);
        
        authWindow = window.open(
            '/auth', 
            'Instagram Auth', 
            `width=${width},height=${height},left=${left},top=${top}`
        );
    });

    // Listen for the token from the popup
    window.addEventListener('message', (event) => {
        if (event.data.type === 'INSTAGRAM_TOKEN') {
            const token = event.data.token;
            
            // Show result view
            tokenDisplay.textContent = token;
            setupView.classList.add('hidden');
            resultView.classList.remove('hidden');
        }
    });

    copyBtn.addEventListener('click', () => {
        const token = tokenDisplay.textContent;
        navigator.clipboard.writeText(token).then(() => {
            const originalColor = copyBtn.style.color;
            copyBtn.style.color = '#28a745';
            setTimeout(() => {
                copyBtn.style.color = originalColor;
            }, 2000);
        });
    });

    resetBtn.addEventListener('click', () => {
        setupView.classList.remove('hidden');
        resultView.classList.add('hidden');
        tokenDisplay.textContent = '';
    });
});
