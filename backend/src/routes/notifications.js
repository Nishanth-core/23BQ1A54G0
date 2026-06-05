const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { userId, title, message, type } = req.body;
  const ownerId = userId || (req.user && req.user.id);
  if (!ownerId || !title || !message || !type) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'userId (or authenticated user), title, message and type are required' },
    });
  }

  try {
    const insert = `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING id, user_id AS "userId", title, message, type, is_read AS "isRead", created_at AS "createdAt"`;
    const { rows } = await db.query(insert, [ownerId, title, message, type]);
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create notification' } });
  }
});

router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
  const offset = (page - 1) * limit;
  const isRead = req.query.isRead === undefined ? null : req.query.isRead === 'true';
  const userId = req.user && req.user.id;

  try {
    const baseQuery = `SELECT id, title, message, type, is_read AS "isRead", created_at AS "createdAt" FROM notifications WHERE user_id = $1`;
    const whereClause = isRead === null ? '' : ' AND is_read = $2';
    const orderLimitOffset = ' ORDER BY created_at DESC LIMIT $3 OFFSET $4';
    const notificationsQuery = baseQuery + whereClause + orderLimitOffset;
    const notificationParams = isRead === null ? [userId, limit, offset] : [userId, isRead, limit, offset];
    const { rows } = await db.query(notificationsQuery, notificationParams);

    const countQuery = `SELECT COUNT(*) FROM notifications WHERE user_id = $1` + whereClause;
    const countParams = isRead === null ? [userId] : [userId, isRead];
    const countResult = await db.query(countQuery, countParams);
    const count = parseInt(countResult.rows[0].count, 10);

    return res.json({ success: true, count, data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch notifications' } });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user && req.user.id;
  try {
    const q = `SELECT id, title, message, type, is_read AS "isRead", created_at AS "createdAt" FROM notifications WHERE id = $1 AND user_id = $2`;
    const { rows } = await db.query(q, [id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch notification' } });
  }
});

router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  const { isRead } = req.body;
  const userId = req.user && req.user.id;
  if (typeof isRead !== 'boolean') {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'isRead boolean required' } });
  }

  try {
    const q = `UPDATE notifications SET is_read = $1 WHERE id = $2 AND user_id = $3 RETURNING id`;
    const result = await db.query(q, [isRead, id, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update notification' } });
  }
});

router.patch('/read-all', async (req, res) => {
  const userId = req.user && req.user.id;
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE', [userId]);
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to mark all notifications as read' } });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user && req.user.id;
  try {
    const result = await db.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }
    return res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete notification' } });
  }
});

module.exports = router;
