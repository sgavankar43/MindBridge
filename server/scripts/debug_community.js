// Native fetch is available in Node 18+

const API_URL = 'http://localhost:5002/api';

async function debugHelper() {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'alex.thompson@example.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful. Token obtained.');

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        console.log('\n2. Fetching Posts...');
        const postsRes = await fetch(`${API_URL}/posts`, { headers });
        console.log(`Posts Status: ${postsRes.status}`);
        if (postsRes.ok) {
            const posts = await postsRes.json();
            console.log(`Posts count: ${Array.isArray(posts) ? posts.length : 'Not array'}`);
        } else {
            console.error('Posts Error:', await postsRes.text());
        }

        console.log('\n3. Fetching Suggestions...');
        const suggRes = await fetch(`${API_URL}/users/suggestions`, { headers });
        console.log(`Suggestions Status: ${suggRes.status}`);
        if (suggRes.ok) {
            const sugg = await suggRes.json();
            console.log(`Suggestions count: ${Array.isArray(sugg) ? sugg.length : 'Not array'}`);
            console.log('Suggestions:', JSON.stringify(sugg, null, 2));
        } else {
            console.error('Suggestions Error:', await suggRes.text());
        }

        console.log('\n4. Fetching Conversations...');
        const convRes = await fetch(`${API_URL}/messages/conversations`, { headers });
        console.log(`Conversations Status: ${convRes.status}`);
        if (convRes.ok) {
            const conv = await convRes.json();
            console.log(`Conversations count: ${Array.isArray(conv) ? conv.length : 'Not array'}`);
        } else {
            console.error('Conversations Error:', await convRes.text());
        }

    } catch (error) {
        console.error('Debug script error:', error);
    }
}

debugHelper();
