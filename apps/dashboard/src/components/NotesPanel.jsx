import { Activity, Clock, StickyNote } from "lucide-react";
import { Badge } from "../App";

export function NotesPanel({
  notes,
  noteForm,
  setNoteForm,
  notesLoading,
  notesError,
  onCreateNote,
}) {
  return (
    <div>
      <div className="notes-container">
        <div className="notes-form-section">
          <h2 className="section-header">
            <StickyNote size={18} style={{ color: "var(--primary)" }} />
            Add New Note
          </h2>
          <form onSubmit={onCreateNote} className="notes-form">
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                className="form-textarea"
                value={noteForm.content}
                onChange={(e) =>
                  setNoteForm({ ...noteForm, content: e.target.value })
                }
                placeholder="Enter your note content..."
                rows={4}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Owner</label>
                <select
                  className="form-select"
                  value={noteForm.owner}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, owner: e.target.value })
                  }
                >
                  <option value="Dev">Dev</option>
                  <option value="Chairman">Chairman</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  className="form-input"
                  type="text"
                  value={noteForm.category}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, category: e.target.value })
                  }
                  placeholder="e.g., Architecture, Bug, Feature"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={
                notesLoading ||
                !noteForm.content.trim() ||
                !noteForm.category.trim()
              }
              style={{
                marginTop: "16px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                border: "none",
                backgroundColor: "var(--primary)",
                color: "white",
                cursor:
                  notesLoading ||
                  !noteForm.content.trim() ||
                  !noteForm.category.trim()
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  notesLoading ||
                  !noteForm.content.trim() ||
                  !noteForm.category.trim()
                    ? 0.6
                    : 1,
              }}
            >
              {notesLoading ? "Saving..." : "Save Note"}
            </button>
          </form>
          {notesError && (
            <div className="error-banner">{notesError.message}</div>
          )}
        </div>

        <div className="notes-history-section">
          <h2 className="section-header">
            <Clock size={18} style={{ color: "var(--primary)" }} />
            Historical Notes
          </h2>
          {notesLoading && notes.length === 0 ? (
            <div className="notes-empty-state">
              <Activity
                className="animate-spin"
                style={{ margin: "0 auto 16px", color: "var(--primary)" }}
                size={32}
              />
              <div>Loading notes...</div>
            </div>
          ) : notes.length === 0 ? (
            <div className="notes-empty-state">
              <StickyNote
                size={32}
                style={{ margin: "0 auto 16px", opacity: 0.5 }}
              />
              <div>No notes yet. Add your first note above.</div>
            </div>
          ) : (
            <div className="notes-list">
              {notes.map((note) => (
                <div key={note.id} className="note-card">
                  <div className="note-header">
                    <div className="note-meta">
                      <Badge
                        text={note.owner}
                        color="var(--primary)"
                        bg="rgba(1, 54, 38, 0.05)"
                      />
                      <Badge
                        text={note.category}
                        color="var(--text-secondary)"
                        bg="rgba(113, 121, 116, 0.08)"
                      />
                    </div>
                    <div className="note-date mono-display">
                      {new Date(note.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="note-content">{note.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
