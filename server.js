import express from 'express';
import { AccessToken } from 'livekit-server-sdk';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
const port = 3003;
// Allow frontend to call this server
app.use(cors());
app.use(express.json());
const createToken = async (req, res) => {
    // 1. Get details from the request (or generate defaults)
    const roomName = req.query.room || 'support-room-1';
    const participantName = req.query.username || 'user-' + Math.floor(Math.random() * 10000);
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
        return res.status(500).json({ error: 'Server keys not configured' });
    }
    try {
        // 2. Create the Access Token
        const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
            identity: participantName,
            // The name to display in the UI
            name: participantName,
        });
        // 3. Set Permissions (Grants)
        at.addGrant({
            roomJoin: true, // Can join the room
            room: roomName, // Specific room name
            canPublish: true, // Can use microphone/camera
            canSubscribe: true, // Can hear the agent
        });
        // 4. Convert to JWT string
        const token = await at.toJwt();
        // 5. Return to frontend
        res.json({
            token: token,
            room: roomName,
            username: participantName
        });
        console.log(`Token generated for ${participantName} in ${roomName}`);
    }
    catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
};
// Define the route
app.get('/getToken', createToken);
app.listen(port, () => {
    console.log(`Token server running at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map