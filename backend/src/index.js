const express = require('express');
const dotenv = require('dotenv');
const notificationsRouter = require('./routes/notifications');
const auth = require('./middleware/auth');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1/notifications', auth, notificationsRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

app.listen(port, () => {
  console.log(`Notification API listening on port ${port}`);
});
