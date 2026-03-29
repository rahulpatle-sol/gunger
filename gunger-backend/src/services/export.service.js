const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')

const generateExcel = async (data, title) => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(title)

  if (data.length === 0) {
    sheet.addRow(['No data available'])
    return workbook
  }

  const headers = Object.keys(data[0])
  sheet.addRow(headers)
  sheet.getRow(1).font = { bold: true }
  sheet.getRow(1).fill = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: 'FF1F1F2E' }
  }
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  data.forEach(row => {
    sheet.addRow(Object.values(row))
  })

  headers.forEach((_, i) => {
    sheet.getColumn(i + 1).width = 20
  })

  return workbook
}

const generatePDF = (data, title, columns) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' })
    const buffers = []

    doc.on('data', b => buffers.push(b))
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text(`GUNGER — ${title}`, { align: 'center' })
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
    doc.moveDown()

    // Table header
    const colWidth = (doc.page.width - 80) / columns.length
    let x = 40
    const headerY = doc.y

    doc.rect(40, headerY - 5, doc.page.width - 80, 20).fill('#1F1F2E')
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold')

    columns.forEach(col => {
      doc.text(col.header, x + 2, headerY, { width: colWidth - 4, ellipsis: true })
      x += colWidth
    })

    doc.fillColor('black').moveDown(0.5)

    // Rows
    data.forEach((row, idx) => {
      if (doc.y > doc.page.height - 60) doc.addPage()

      const rowY = doc.y
      if (idx % 2 === 0) {
        doc.rect(40, rowY - 3, doc.page.width - 80, 16).fill('#F5F5F5')
      }
      doc.fillColor('#111').fontSize(8).font('Helvetica')
      x = 40
      columns.forEach(col => {
        const val = String(row[col.key] ?? '')
        doc.text(val, x + 2, rowY, { width: colWidth - 4, ellipsis: true })
        x += colWidth
      })
      doc.moveDown(0.3)
    })

    doc.end()
  })
}

module.exports = { generateExcel, generatePDF }
