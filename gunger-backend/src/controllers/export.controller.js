const { query } = require('../config/db')
const { generateExcel, generatePDF } = require('../services/export.service')

const exportBatchReport = async (req, res) => {
  try {
    const { batch_id } = req.params
    const { format = 'excel' } = req.query

    // Verify teacher owns this batch
    const batch = await query(
      'SELECT * FROM batches WHERE id = $1 AND teacher_id = $2',
      [batch_id, req.user.id]
    )
    if (batch.rows.length === 0) return res.status(403).json({ error: 'Not authorized' })

    const data = await query(
      `SELECT u.username, u.email, u.xp,
              COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.question_id END) as problems_solved,
              COUNT(s.id) as total_submissions,
              MAX(s.created_at) as last_activity
       FROM batch_members bm
       JOIN users u ON u.id = bm.user_id
       LEFT JOIN submissions s ON s.user_id = u.id
       WHERE bm.batch_id = $1
       GROUP BY u.id, u.username, u.email, u.xp
       ORDER BY u.xp DESC`,
      [batch_id]
    )

    const rows = data.rows
    const title = `Batch Report - ${batch.rows[0].name}`

    if (format === 'pdf') {
      const columns = [
        { key: 'username', header: 'Username' },
        { key: 'email', header: 'Email' },
        { key: 'xp', header: 'XP' },
        { key: 'problems_solved', header: 'Solved' },
        { key: 'total_submissions', header: 'Submissions' },
        { key: 'last_activity', header: 'Last Active' }
      ]
      const pdfBuffer = await generatePDF(rows, title, columns)
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="gunger-${batch_id}.pdf"`
      })
      return res.send(pdfBuffer)
    }

    // Default: Excel
    const workbook = await generateExcel(rows, title)
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="gunger-${batch_id}.xlsx"`
    })
    await workbook.xlsx.write(res)
    res.end()
  } catch (err) {
    console.error('Export error:', err)
    res.status(500).json({ error: 'Export failed' })
  }
}

module.exports = { exportBatchReport }
