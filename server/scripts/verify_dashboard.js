// Native fetch is available in Node 18+
const API_URL = 'http://localhost:5002/api';

async function verifyDashboard() {
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

        const { token } = await loginRes.json();
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        console.log('Login successful.');

        console.log('\n2. Updating Mood...');
        const moodRes = await fetch(`${API_URL}/users/mental-health/mood`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ mood: 'great' })
        });
        console.log('Update Mood Status:', moodRes.status);
        const moodData = await moodRes.json();
        console.log('Current Mood:', moodData.currentMood);

        console.log('\n3. Adding Goal...');
        const goalRes = await fetch(`${API_URL}/users/mental-health/goals`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ text: 'Test Goal 1' })
        });
        console.log('Add Goal Status:', goalRes.status);
        const newGoal = await goalRes.json();
        console.log('New Goal:', newGoal);

        console.log('\n4. Fetching Mental Health Profile...');
        const profileRes = await fetch(`${API_URL}/users/mental-health`, { headers });
        const profile = await profileRes.json();
        console.log('Goals count:', profile.goals.length);
        console.log('Mood:', profile.currentMood);

        if (newGoal._id) {
            console.log('\n5. Toggling Goal...');
            const toggleRes = await fetch(`${API_URL}/users/mental-health/goals/${newGoal._id}`, {
                method: 'PUT',
                headers
            });
            const toggledGoal = await toggleRes.json();
            console.log('Goal Completed:', toggledGoal.completed);

            console.log('\n6. Deleting Goal...');
            const delRes = await fetch(`${API_URL}/users/mental-health/goals/${newGoal._id}`, {
                method: 'DELETE',
                headers
            });
            console.log('Delete Status:', delRes.status);
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyDashboard();
