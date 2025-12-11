from playwright.sync_api import sync_playwright

def verify_chat_interface():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock API responses

        # Mock AI Sessions
        page.route("**/api/ai/sessions", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"_id": "1", "title": "Mock Session", "messages": [{"role": "user", "content": "Hello", "timestamp": "2023-01-01T12:00:00Z"}, {"role": "model", "content": "Hi there!", "timestamp": "2023-01-01T12:01:00Z"}], "updatedAt": "2023-01-01T12:01:00Z"}]'
        ))

        # Mock /api/auth/me to avoid auth issues if the component calls it
        page.route("**/api/auth/me", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"user": {"_id": "u1", "name": "Test User", "role": "user", "verificationStatus": "approved"}}'
        ))

        # Pre-seed local storage with user data so UserContext thinks we are logged in
        page.goto("http://localhost:5173/")
        page.evaluate("""() => {
            localStorage.setItem('token', 'fake-token');
            localStorage.setItem('user', JSON.stringify({
                _id: 'u1',
                name: 'Test User',
                role: 'user',
                verificationStatus: 'approved'
            }));
        }""")

        try:
            print("Navigating to AI Chat page...")
            # Route is /ai-chat, not /messages
            page.goto("http://localhost:5173/ai-chat")

            print("Waiting for chat interface...")
            page.wait_for_selector("text=Mock Session", timeout=15000)

            print("Taking screenshot of AI Chat...")
            page.screenshot(path="verification/ai_chat.png")

        except Exception as e:
            print(f"Error verifying AI Chat: {e}")
            page.screenshot(path="verification/error_ai_chat.png")

        # Mock Direct Messages
        page.route("**/api/messages/conversations", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"id": "2", "name": "Dr. Smith", "lastMessage": "Hello", "timestamp": "2023-01-01T12:00:00Z", "unread": 1}]'
        ))

        page.route("**/api/messages/2", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"_id": "m1", "sender": "2", "recipient": "me", "text": "Hello user", "createdAt": "2023-01-01T12:00:00Z"}]'
        ))

        try:
            print("Navigating to Direct Messages page...")
            page.goto("http://localhost:5173/direct-messages")

            print("Waiting for conversation list...")
            page.wait_for_selector("text=Dr. Smith", timeout=15000)

            page.click("text=Dr. Smith")

            # Wait for message to appear
            page.wait_for_selector("text=Hello user", timeout=5000)

            print("Taking screenshot of Direct Messages...")
            page.screenshot(path="verification/direct_messages.png")

        except Exception as e:
            print(f"Error verifying Direct Messages: {e}")
            page.screenshot(path="verification/error_dm.png")

        browser.close()

if __name__ == "__main__":
    verify_chat_interface()
