import { useCallback, useEffect, useState } from "react";

const handleAuthError = (response) => {
  if (response.status === 401 || response.status === 403) {
    const authError = new Error(
      "Your session has expired. Please sign in again.",
    );
    authError.code = "AUTHENTICATION_FAILED";
    throw authError;
  }
};

export function useNotes(API_URL, store) {
  const [notes, setNotes] = useState([]);
  const [noteForm, setNoteForm] = useState({
    content: "",
    owner: "Dev",
    category: "",
  });
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);

  const persistNotes = useCallback(
    (nextNotes) => {
      try {
        store.set("dlrs_notes", JSON.stringify(nextNotes));
      } catch (e) {
        console.error("Error persisting notes:", e);
      }
    },
    [store],
  );

  const fetchNotes = useCallback(async () => {
    setNotesLoading(true);
    setNotesError(null);
    try {
      const response = await fetch(`${API_URL}/v1/notes`, {
        credentials: "include",
      });

      handleAuthError(response);

      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      setNotes(data);
      persistNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      if (error.code === "AUTHENTICATION_FAILED") {
        setNotesError({
          code: "AUTHENTICATION_FAILED",
          message: error.message,
        });
      } else {
        setNotesError({
          code: "GENERIC_ERROR",
          message: "Failed to load notes from server. Using local fallback.",
        });
      }

      try {
        const localNotes = store.get("dlrs_notes");
        if (localNotes && localNotes.value) {
          setNotes(JSON.parse(localNotes.value));
        }
      } catch (localError) {
        console.error("Error loading local notes:", localError);
      }
    } finally {
      setNotesLoading(false);
    }
  }, [API_URL, persistNotes, store]);

  const createNote = useCallback(
    async (e) => {
      e.preventDefault();

      setNotesLoading(true);
      setNotesError(null);
      try {
        const response = await fetch(`${API_URL}/v1/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(noteForm),
        });

        handleAuthError(response);

        if (!response.ok) throw new Error("Failed to create note");
        const newNote = await response.json();

        setNotes((prev) => {
          const next = [newNote, ...prev];
          persistNotes(next);
          return next;
        });
        setNoteForm({ content: "", owner: "Dev", category: "" });
      } catch (error) {
        console.error("Error creating note:", error);
        if (error.code === "AUTHENTICATION_FAILED") {
          setNotesError({
            code: "AUTHENTICATION_FAILED",
            message: error.message,
          });
        } else {
          setNotesError({
            code: "GENERIC_ERROR",
            message: "Failed to save note to server. Saved locally only.",
          });
        }

        const localNote = {
          id: Date.now().toString(),
          ...noteForm,
          created_at: new Date().toISOString(),
        };
        setNotes((prev) => {
          const next = [localNote, ...prev];
          persistNotes(next);
          return next;
        });
        setNoteForm({ content: "", owner: "Dev", category: "" });
      } finally {
        setNotesLoading(false);
      }
    },
    [API_URL, noteForm, persistNotes],
  );

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    noteForm,
    setNoteForm,
    notesLoading,
    notesError,
    createNote,
  };
}
