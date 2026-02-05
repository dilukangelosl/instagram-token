require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Privacy Policy Route
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

// 1. Initial Auth Request
app.get('/auth', (req, res) => {
    const appId = process.env.INSTAGRAM_APP_ID;
    const redirectUri = process.env.REDIRECT_URI;
    const scope = 'instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement';
    
    // Using the Facebook Login for Instagram flow
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
    
    res.redirect(authUrl);
});

// 2. Callback Handling
app.get('/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        return res.status(400).send(`Auth error: ${error}`);
    }

    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        // Exchange code for short-lived access token
        const tokenResponse = await axios.get('https://graph.facebook.com/v21.0/oauth/access_token', {
            params: {
                client_id: process.env.INSTAGRAM_APP_ID,
                client_secret: process.env.INSTAGRAM_APP_SECRET,
                redirect_uri: process.env.REDIRECT_URI,
                code: code
            }
        });

        const shortLivedToken = tokenResponse.data.access_token;

        // Exchange for long-lived access token (optional but recommended)
        const longLivedTokenResponse = await axios.get('https://graph.facebook.com/v21.0/oauth/access_token', {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: process.env.INSTAGRAM_APP_ID,
                client_secret: process.env.INSTAGRAM_APP_SECRET,
                fb_exchange_token: shortLivedToken
            }
        });

        const longLivedToken = longLivedTokenResponse.data.access_token;

        // Send token back to frontend (using a simple HTML script to pass it back)
        res.send(`
            <html>
                <body>
                    <h1>Success!</h1>
                    <p>Your access token has been generated. Closing this window...</p>
                    <script>
                        window.opener.postMessage({ type: 'INSTAGRAM_TOKEN', token: "${longLivedToken}" }, "*");
                        window.close();
                    </script>
                </body>
            </html>
        `);

    } catch (err) {
        console.error('Error exchanging token:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to exchange token', details: err.response?.data || err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Auth endpoint: http://localhost:${PORT}/auth`);
});
