# Messages Page Documentation

## Overview
A fully responsive messaging/chat interface that matches the dashboard's clean, modern UI/UX style with neumorphic design elements.

## Features Implemented

### Layout
- **Left Sidebar (Conversations)**
  - User profile section with avatar
  - Search bar for filtering conversations
  - List of recent conversations with:
    - User avatars with gradient backgrounds
    - Online/offline status indicators
    - Last message preview
    - Timestamp
    - Unread message badges
  - Smooth hover effects and active state highlighting

- **Main Chat Area**
  - Top header with:
    - Selected user info (avatar, name, online status)
    - Action buttons (phone, video, more options)
  - Scrollable message container with:
    - Sent messages (right-aligned, gradient background)
    - Received messages (left-aligned, gray background)
    - Message timestamps
    - Smooth fade-in animations for new messages
    - Auto-scroll to latest message
  - Typing indicator with animated dots
  - Bottom message input with:
    - Attachment button
    - Emoji button
    - Text input field
    - Send button (gradient, disabled when empty)

### Design Elements
- **Color Palette**: Matches dashboard (#f5f0e8 background, #e74c3c to #f39c12 gradients)
- **Rounded Corners**: Consistent 24px (rounded-3xl) for containers
- **Soft Shadows**: Subtle shadow-sm for depth
- **Smooth Transitions**: All interactive elements have hover states
- **Custom Scrollbar**: Styled to match the overall design
- **Responsive**: Adapts to different screen sizes

### Functionality
- Click any user in sidebar to load their chat history
- Type and send messages (Enter key or Send button)
- Messages auto-scroll to bottom
- Search/filter conversations
- Typing indicator simulation (2 seconds after sending)
- Real-time online status display
- Unread message count badges

### Dummy Data
- 5 sample users with different avatars and gradient colors
- Pre-populated conversation history
- Various message states (online/offline, read/unread)

## Navigation
Access the Messages page via:
- URL: `/messages`
- Sidebar: Click the MessageCircle icon (3rd icon from top)

## Technical Stack
- React with Hooks (useState, useRef, useEffect)
- Tailwind CSS for styling
- Lucide React for icons
- React Router for navigation
- Custom CSS animations for smooth transitions
