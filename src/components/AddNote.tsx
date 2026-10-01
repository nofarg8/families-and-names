import { useId, useState } from 'react'
import { newId, useNotes } from '../hooks/useStore'
import { t } from '../i18n'
import { BigButton } from './BigButton'
import { Status } from './Status'

/** "I know more about this": an inline personal note attached to any item. */
export function AddNote({ targetId, label }: { targetId: string; label: string }) {
  const [notes, saveNotes] = useNotes()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [status, setStatus] = useState('')
  const fieldId = useId()
  const mine = notes.filter((n) => n.targetId === targetId)

  const save = async () => {
    const value = text.trim()
    if (value) {
      await saveNotes((all) => [...all, { id: newId(), targetId, text: value, createdAt: new Date().toISOString() }])
      setStatus(t('note.saved'))
    }
    setText('')
    setOpen(false)
  }

  return (
    <div className="stack">
      {mine.length > 0 && (
        <div className="stack">
          <p className="card-label">{t('note.yours')}</p>
          {mine.map((n) => (
            <p key={n.id} style={{ whiteSpace: 'pre-wrap' }}>
              {n.text}
            </p>
          ))}
        </div>
      )}
      {open ? (
        <div className="stack">
          <label className="field-label" htmlFor={fieldId}>
            {t('note.label')}
          </label>
          <textarea
            id={fieldId}
            className="text-area"
            value={text}
            placeholder={t('note.placeholder')}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <div className="inline-actions">
            <BigButton onClick={save}>{t('note.save')}</BigButton>
            <BigButton variant="secondary" onClick={() => setOpen(false)}>
              {t('note.cancel')}
            </BigButton>
          </div>
        </div>
      ) : (
        <BigButton
          variant="secondary"
          icon="note"
          onClick={() => {
            setStatus('')
            setOpen(true)
          }}
        >
          {label}
        </BigButton>
      )}
      <Status message={status} />
    </div>
  )
}
