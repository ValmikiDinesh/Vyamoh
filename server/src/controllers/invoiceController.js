const PDFDocument = require('pdfkit');
const { Order } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');
const archiver = require('archiver') || null; // optional for bulk

// Generate single invoice PDF
const generateInvoicePDF = (order, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
  doc.pipe(res);

  // === HEADER ===
  doc.fontSize(24).font('Helvetica-Bold').text('VYAMOH', 50, 50);
  doc.fontSize(10).font('Helvetica').fillColor('#666666')
    .text('Premium Fashion & Accessories', 50, 78)
    .text('www.vyamoh.com', 50, 92);

  // Invoice title
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#000000')
    .text('INVOICE', 400, 50, { align: 'right' });
  doc.fontSize(10).font('Helvetica').fillColor('#666666')
    .text(`#${order.orderNumber}`, 400, 78, { align: 'right' })
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 400, 92, { align: 'right' });

  // Divider
  doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#e0e0e0').stroke();

  // === BILLING TO ===
  const addr = order.shippingAddress || {};
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
    .text('Bill To:', 50, 130);
  doc.fontSize(10).font('Helvetica').fillColor('#333333')
    .text(addr.fullName || 'Customer', 50, 148)
    .text(addr.addressLine1 || '', 50, 162)
    .text([addr.city, addr.state, addr.pincode].filter(Boolean).join(', '), 50, 176)
    .text(`Phone: ${addr.phone || 'N/A'}`, 50, 190);

  // Payment info
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
    .text('Payment:', 350, 130);
  doc.fontSize(10).font('Helvetica').fillColor('#333333')
    .text(`Method: ${(order.paymentMethod || 'N/A').toUpperCase()}`, 350, 148)
    .text(`Status: ${(order.paymentStatus || 'N/A').toUpperCase()}`, 350, 162)
    .text(`Order Status: ${(order.status || 'N/A').toUpperCase()}`, 350, 176);

  // === ITEMS TABLE ===
  const tableTop = 225;

  // Table header
  doc.rect(50, tableTop, 495, 25).fill('#f5f5f5');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333')
    .text('#', 55, tableTop + 8, { width: 25 })
    .text('Item', 80, tableTop + 8, { width: 230 })
    .text('Qty', 310, tableTop + 8, { width: 40, align: 'center' })
    .text('Price', 350, tableTop + 8, { width: 80, align: 'right' })
    .text('Total', 440, tableTop + 8, { width: 100, align: 'right' });

  // Table rows
  let yPos = tableTop + 30;
  (order.items || []).forEach((item, i) => {
    const itemTotal = (item.price * item.quantity) / 100;

    doc.fontSize(9).font('Helvetica').fillColor('#333333')
      .text(i + 1, 55, yPos, { width: 25 })
      .text(item.name, 80, yPos, { width: 230 })
      .text(item.quantity, 310, yPos, { width: 40, align: 'center' })
      .text(`₹${(item.price / 100).toLocaleString('en-IN')}`, 350, yPos, { width: 80, align: 'right' })
      .text(`₹${itemTotal.toLocaleString('en-IN')}`, 440, yPos, { width: 100, align: 'right' });

    if (item.color || item.frameSize) {
      doc.fontSize(7).fillColor('#888888')
        .text([item.color, item.frameSize].filter(Boolean).join(' | '), 80, yPos + 12, { width: 230 });
      yPos += 8;
    }
    yPos += 20;
  });

  // Divider
  doc.moveTo(50, yPos).lineTo(545, yPos).strokeColor('#e0e0e0').stroke();
  yPos += 15;

  // === TOTALS ===
  const totalsX = 380;
  doc.fontSize(10).font('Helvetica').fillColor('#333333')
    .text('Subtotal:', totalsX, yPos)
    .text(`₹${((order.subtotal || 0) / 100).toLocaleString('en-IN')}`, 460, yPos, { width: 85, align: 'right' });
  yPos += 18;

  if (order.shippingCost > 0) {
    doc.text('Shipping:', totalsX, yPos)
      .text(`₹${(order.shippingCost / 100).toLocaleString('en-IN')}`, 460, yPos, { width: 85, align: 'right' });
    yPos += 18;
  } else {
    doc.text('Shipping:', totalsX, yPos).fillColor('#10b981')
      .text('FREE', 460, yPos, { width: 85, align: 'right' });
    doc.fillColor('#333333');
    yPos += 18;
  }

  if (order.couponDiscount > 0) {
    doc.fillColor('#e85d3a').text('Discount:', totalsX, yPos)
      .text(`-₹${(order.couponDiscount / 100).toLocaleString('en-IN')}`, 460, yPos, { width: 85, align: 'right' });
    doc.fillColor('#333333');
    yPos += 18;
  }

  // Total
  doc.moveTo(totalsX, yPos).lineTo(545, yPos).strokeColor('#333333').stroke();
  yPos += 10;
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000')
    .text('Total:', totalsX, yPos)
    .text(`₹${((order.totalAmount || 0) / 100).toLocaleString('en-IN')}`, 460, yPos, { width: 85, align: 'right' });

  // === FOOTER ===
  const footerY = 750;
  doc.fontSize(8).font('Helvetica').fillColor('#999999')
    .text('Thank you for shopping with Vyamoh!', 50, footerY, { align: 'center', width: 495 })
    .text('For queries, contact support@vyamoh.com | +91 XXXXX XXXXX', 50, footerY + 14, { align: 'center', width: 495 })
    .text('This is a computer-generated invoice and does not require a signature.', 50, footerY + 28, { align: 'center', width: 495 });

  doc.end();
};

// Download single invoice
exports.getInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  generateInvoicePDF(order, res);
});

// Bulk download invoices as ZIP
exports.bulkInvoices = asyncHandler(async (req, res) => {
  const { orderIds } = req.body;
  if (!orderIds || orderIds.length === 0) throw new AppError('No order IDs provided', 400);

  const orders = await Order.find({ _id: { $in: orderIds } });
  if (orders.length === 0) throw new AppError('No orders found', 404);

  // For single order, return PDF directly
  if (orders.length === 1) {
    return generateInvoicePDF(orders[0], res);
  }

  // For multiple orders, create a ZIP
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=invoices-${Date.now()}.zip`);

  // Use archiver if available, otherwise stream individual PDFs
  try {
    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const order of orders) {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));

      await new Promise((resolve) => {
        doc.on('end', resolve);
        // Inline simplified PDF for bulk (reuses same layout)
        doc.fontSize(24).font('Helvetica-Bold').text('VYAMOH', 50, 50);
        doc.fontSize(10).font('Helvetica').fillColor('#666').text(`Invoice #${order.orderNumber}`, 50, 78);
        doc.fontSize(10).fillColor('#333');
        let y = 110;
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 50, y); y += 16;
        doc.text(`Customer: ${order.shippingAddress?.fullName || 'N/A'}`, 50, y); y += 16;
        doc.text(`Status: ${order.status}`, 50, y); y += 16;
        doc.text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 50, y); y += 30;

        doc.font('Helvetica-Bold').text('Items:', 50, y); y += 16;
        doc.font('Helvetica');
        (order.items || []).forEach((item, i) => {
          doc.text(`${i + 1}. ${item.name} x${item.quantity} — ₹${((item.price * item.quantity) / 100).toLocaleString('en-IN')}`, 50, y);
          y += 16;
        });
        y += 10;
        doc.font('Helvetica-Bold').fontSize(14)
          .text(`Total: ₹${((order.totalAmount || 0) / 100).toLocaleString('en-IN')}`, 50, y);
        doc.end();
      });

      archive.append(Buffer.concat(chunks), { name: `invoice-${order.orderNumber}.pdf` });
    }

    await archive.finalize();
  } catch (e) {
    // Fallback: return first order's PDF if archiver isn't available
    generateInvoicePDF(orders[0], res);
  }
});
