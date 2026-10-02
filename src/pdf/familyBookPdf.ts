/**
 * Family book as a designed, large-print A4 PDF.
 *
 * Pages are drawn on a canvas (the browser shapes Hebrew RTL correctly there,
 * unlike most PDF libraries) and embedded as JPEG images in a minimal PDF.
 */

export type BookEntry = { question: string; answer: string; dateLine: string }

export type BookContent = {
  title: string
  subtitle: string
  dateLine: string
  footer: string
  pageLabel: (n: number) => string
  entries: BookEntry[]
}

// A4 in PDF points, drawn at 2.5 px per point (~180 dpi).
const PAGE_W = 595.28
const PAGE_H = 841.89
const SCALE = 2.5
const pt = (v: number) => v * SCALE
const W = Math.round(PAGE_W * SCALE)
const H = Math.round(PAGE_H * SCALE)

const C = {
  ink: '#1A1F36',
  soft: '#4A5068',
  rimon: '#A3243B',
  blue: '#1F4E79',
  gold: '#C9952B',
  paper: '#FFFFFF',
  cream: '#FBF7EF',
}

const HEAD = '"Frank Ruhl Libre", Arial, sans-serif'
const BODY = 'Assistant, Arial, sans-serif'

const MARGIN = pt(60)
const TOP = pt(92)
const BOTTOM = H - pt(78)
const TEXT_W = W - 2 * MARGIN

const Q_SIZE = pt(22)
const Q_LH = Q_SIZE * 1.4
const A_SIZE = pt(18) // large print
const A_LH = A_SIZE * 1.65
const D_SIZE = pt(11)

async function ensureFonts() {
  const sample = 'אבגדה'
  await Promise.all([
    document.fonts.load(`700 40px "Frank Ruhl Libre"`, sample),
    document.fonts.load(`500 40px Assistant`, sample),
    document.fonts.load(`700 40px Assistant`, sample),
  ]).catch(() => {})
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  for (const para of text.split('\n')) {
    const words = para.split(/\s+/).filter(Boolean)
    if (!words.length) {
      lines.push('')
      continue
    }
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (!line || ctx.measureText(test).width <= maxWidth) line = test
      else {
        lines.push(line)
        line = word
      }
    }
    lines.push(line)
  }
  return lines
}

function diamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ctx.beginPath()
  ctx.moveTo(cx, cy - ry)
  ctx.lineTo(cx + rx, cy)
  ctx.lineTo(cx, cy + ry)
  ctx.lineTo(cx - rx, cy)
  ctx.closePath()
}

/** Carpet-style band: gold diamonds with pomegranate centers. */
function band(ctx: CanvasRenderingContext2D, y: number, x1: number, x2: number, h: number) {
  const step = h * 2
  const count = Math.floor((x2 - x1) / step)
  const start = x1 + ((x2 - x1) - count * step) / 2 + step / 2
  ctx.save()
  ctx.lineWidth = Math.max(2, h * 0.1)
  ctx.strokeStyle = C.gold
  ctx.beginPath()
  ctx.moveTo(x1, y)
  ctx.lineTo(x2, y)
  ctx.stroke()
  for (let i = 0; i < count; i++) {
    const cx = start + i * step
    ctx.fillStyle = C.paper
    diamond(ctx, cx, y, h * 0.7, h / 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = C.rimon
    diamond(ctx, cx, y, h * 0.27, h * 0.2)
    ctx.fill()
  }
  ctx.restore()
}

function newCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = C.paper
  ctx.fillRect(0, 0, W, H)
  ctx.direction = 'rtl'
  ctx.textBaseline = 'top'
  return { canvas, ctx }
}

function toJpeg(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? b.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)), reject) : reject(new Error('toBlob'))),
      'image/jpeg',
      0.88,
    ),
  )
}

function drawCover(ctx: CanvasRenderingContext2D, book: BookContent) {
  ctx.fillStyle = C.cream
  ctx.fillRect(0, 0, W, H)

  // Double frame.
  ctx.strokeStyle = C.gold
  ctx.lineWidth = pt(2)
  ctx.strokeRect(pt(28), pt(28), W - pt(56), H - pt(56))
  ctx.lineWidth = pt(0.8)
  ctx.strokeRect(pt(36), pt(36), W - pt(72), H - pt(72))

  band(ctx, pt(78), pt(60), W - pt(60), pt(16))
  band(ctx, H - pt(78), pt(60), W - pt(60), pt(16))

  // Central medallion, as on the app icon.
  const cx = W / 2
  const cy = H * 0.32
  ctx.lineWidth = pt(3)
  ctx.strokeStyle = C.gold
  diamond(ctx, cx, cy, pt(70), pt(70))
  ctx.stroke()
  diamond(ctx, cx, cy, pt(46), pt(46))
  ctx.stroke()
  ctx.fillStyle = C.rimon
  diamond(ctx, cx, cy, pt(20), pt(20))
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.fillStyle = C.ink
  ctx.font = `700 ${pt(50)}px ${HEAD}`
  ctx.fillText(book.title, cx, H * 0.47)

  ctx.fillStyle = C.rimon
  ctx.font = `700 ${pt(24)}px ${BODY}`
  ctx.fillText(book.subtitle, cx, H * 0.47 + pt(76))

  ctx.fillStyle = C.soft
  ctx.font = `500 ${pt(16)}px ${BODY}`
  ctx.fillText(book.dateLine, cx, H * 0.47 + pt(122))

  ctx.font = `500 ${pt(12)}px ${BODY}`
  ctx.fillText(book.footer, cx, H - pt(120))
}

function drawPageFrame(ctx: CanvasRenderingContext2D, book: BookContent, pageNo: number) {
  band(ctx, pt(44), MARGIN, W - MARGIN, pt(10))
  ctx.textAlign = 'center'
  ctx.fillStyle = C.soft
  ctx.font = `500 ${pt(11)}px ${BODY}`
  ctx.fillText(`${book.title} · ${book.pageLabel(pageNo)}`, W / 2, H - pt(46))
}

function drawSeparator(ctx: CanvasRenderingContext2D, y: number) {
  const cx = W / 2
  ctx.save()
  ctx.strokeStyle = C.gold
  ctx.lineWidth = pt(1)
  ctx.beginPath()
  ctx.moveTo(cx - pt(70), y)
  ctx.lineTo(cx - pt(12), y)
  ctx.moveTo(cx + pt(12), y)
  ctx.lineTo(cx + pt(70), y)
  ctx.stroke()
  ctx.fillStyle = C.rimon
  diamond(ctx, cx, y, pt(6), pt(6))
  ctx.fill()
  ctx.restore()
}

/** Lays the book out page by page, converting each page to JPEG as soon as it's full. */
async function renderPages(book: BookContent): Promise<Uint8Array[]> {
  await ensureFonts()
  const pages: Uint8Array[] = []

  const cover = newCanvas()
  drawCover(cover.ctx, book)
  pages.push(await toJpeg(cover.canvas))

  let pageNo = 1
  let { canvas, ctx } = newCanvas()
  let y = TOP
  const right = W - MARGIN

  const startPage = async () => {
    drawPageFrame(ctx, book, pageNo)
    pages.push(await toJpeg(canvas))
    pageNo++
    ;({ canvas, ctx } = newCanvas())
    y = TOP
  }

  for (let i = 0; i < book.entries.length; i++) {
    const entry = book.entries[i]
    ctx.font = `700 ${Q_SIZE}px ${HEAD}`
    const qLines = wrap(ctx, entry.question, TEXT_W)
    ctx.font = `500 ${A_SIZE}px ${BODY}`
    const aLines = wrap(ctx, entry.answer, TEXT_W)

    // Keep the question together with at least two lines of its answer.
    const needed = qLines.length * Q_LH + pt(10) + Math.min(2, aLines.length) * A_LH
    if (y > TOP && y + needed > BOTTOM) await startPage()

    ctx.textAlign = 'right'
    ctx.fillStyle = C.rimon
    ctx.font = `700 ${Q_SIZE}px ${HEAD}`
    for (const line of qLines) {
      ctx.fillText(line, right, y)
      y += Q_LH
    }
    y += pt(10)

    ctx.fillStyle = C.ink
    ctx.font = `500 ${A_SIZE}px ${BODY}`
    for (const line of aLines) {
      if (y + A_LH > BOTTOM) {
        await startPage()
        ctx.textAlign = 'right'
        ctx.fillStyle = C.ink
        ctx.font = `500 ${A_SIZE}px ${BODY}`
      }
      ctx.fillText(line, right, y)
      y += A_LH
    }

    if (y + D_SIZE * 1.6 <= BOTTOM) {
      ctx.fillStyle = C.soft
      ctx.font = `500 ${D_SIZE}px ${BODY}`
      ctx.fillText(entry.dateLine, right, y + pt(4))
      y += D_SIZE * 1.6 + pt(4)
    }

    if (i < book.entries.length - 1) {
      y += pt(22)
      if (y + pt(30) < BOTTOM) drawSeparator(ctx, y)
      y += pt(30)
    }
  }

  drawPageFrame(ctx, book, pageNo)
  pages.push(await toJpeg(canvas))
  return pages
}

/** Minimal PDF 1.4 writer: one full-page JPEG per page. */
function writePdf(jpegs: Uint8Array[]): Blob {
  const enc = new TextEncoder()
  const parts: BlobPart[] = []
  const offsets: number[] = []
  let offset = 0
  const push = (p: string | Uint8Array) => {
    const bytes = typeof p === 'string' ? enc.encode(p) : p
    parts.push(bytes as BlobPart)
    offset += bytes.length
  }
  const obj = (n: number, ...body: (string | Uint8Array)[]) => {
    offsets[n] = offset
    push(`${n} 0 obj\n`)
    body.forEach(push)
    push('\nendobj\n')
  }

  push('%PDF-1.4\n%âãÏÓ\n')
  const kids = jpegs.map((_, i) => `${3 + 3 * i} 0 R`).join(' ')
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>')
  obj(2, `<< /Type /Pages /Kids [${kids}] /Count ${jpegs.length} >>`)
  jpegs.forEach((data, i) => {
    const p = 3 + 3 * i
    obj(
      p,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
        `/Resources << /XObject << /Im0 ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>`,
    )
    const content = `q ${PAGE_W} 0 0 ${PAGE_H} 0 0 cm /Im0 Do Q`
    obj(p + 1, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
    obj(
      p + 2,
      `<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB ` +
        `/BitsPerComponent 8 /Filter /DCTDecode /Length ${data.length} >>\nstream\n`,
      data,
      '\nendstream',
    )
  })

  const total = 3 + 3 * jpegs.length
  const xref = offset
  push(`xref\n0 ${total}\n0000000000 65535 f \n`)
  for (let n = 1; n < total; n++) push(`${String(offsets[n]).padStart(10, '0')} 00000 n \n`)
  push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  return new Blob(parts, { type: 'application/pdf' })
}

export async function buildFamilyBookPdf(book: BookContent): Promise<{ blob: Blob; pages: number }> {
  const jpegs = await renderPages(book)
  return { blob: writePdf(jpegs), pages: jpegs.length }
}
