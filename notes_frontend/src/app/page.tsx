"use client";

import { useState, useMemo } from "react";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiX } from "react-icons/fi";

/**
 * Color palette and theme settings
 */
const COLORS = {
  primary: "#1976d2",
  accent: "#ffca28",
  secondary: "#424242",
  lightBg: "#fff",
  lightFg: "#171717",
  sidebarBg: "#f5f7fa",
  noteBg: "#fbfbfc",
  border: "#ececec"
};

type Note = {
  id: string;
  title: string;
  content: string;
  lastEdited: number;
};

// Seed notes for first run/demo
const initialNotes: Note[] = [
  {
    id: "1",
    title: "Welcome to the Notes App!",
    content: "Create, edit, and organize your notes with a modern, minimal UI.",
    lastEdited: Date.now(),
  },
];

/**
 * Util - formats timestamp to a simple readable string.
 */
function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Main Home component rendering the Notes app layout, state, and core UI logic.
 */
// PUBLIC_INTERFACE
export default function Page() {
  // Application State
  const [notes, setNotes] = useState<Note[]>(() => {
    // Restore from localStorage if exists
    if (typeof window !== "undefined") {
      try {
        const cached = window.localStorage.getItem("notes-data");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return initialNotes;
  });

  const [currentId, setCurrentId] = useState<string | null>(
    notes.length ? notes[0].id : null
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Persist notes to localStorage
  const persistNotes = (updated: Note[]) => {
    setNotes(updated);
    if (typeof window !== "undefined")
      window.localStorage.setItem("notes-data", JSON.stringify(updated));
  };

  // Filtered + sorted notes
  const displayedNotes = useMemo(() => {
    const filtered = !searchTerm
      ? notes
      : notes.filter(
          (n) =>
            n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    return filtered.sort((a, b) => b.lastEdited - a.lastEdited);
  }, [notes, searchTerm]);

  // Active note
  const currNote = useMemo(
    () => notes.find((n) => n.id === currentId) || null,
    [notes, currentId]
  );

  // Handlers
  const handleCreate = (title: string, content: string) => {
    const newNote: Note = {
      id: Math.random().toString(36).slice(2),
      title: title || "Untitled",
      content,
      lastEdited: Date.now(),
    };
    const updated = [newNote, ...notes];
    persistNotes(updated);
    setCurrentId(newNote.id);
  };

  const handleEdit = (id: string, title: string, content: string) => {
    const updated = notes.map((n) =>
      n.id === id
        ? { ...n, title: title || "Untitled", content, lastEdited: Date.now() }
        : n
    );
    persistNotes(updated);
    setCurrentId(id);
  };

  const handleDelete = (id: string) => {
    const idx = notes.findIndex((n) => n.id === id);
    const updated = notes.filter((n) => n.id !== id);
    persistNotes(updated);
    if (currentId === id) {
      if (updated.length) setCurrentId(updated[Math.max(0, idx - 1)].id);
      else setCurrentId(null);
    }
  };

  // Modal state (for create or edit)
  const [modalData, setModalData] = useState<{ id?: string; title: string; content: string }>({
    title: "",
    content: "",
  });
  const openCreateModal = () => {
    setModalData({ title: "", content: "" });
    setModalMode("create");
    setIsModalOpen(true);
  };
  const openEditModal = (note: Note) => {
    setModalData({ id: note.id, title: note.title, content: note.content });
    setModalMode("edit");
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // Modal submission
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "create") handleCreate(modalData.title, modalData.content);
    else if (modalMode === "edit" && modalData.id)
      handleEdit(modalData.id, modalData.title, modalData.content);
    setIsModalOpen(false);
  };

  return (
    <div style={{ background: COLORS.lightBg, color: COLORS.lightFg }}>
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <nav
          className="w-[275px] shrink-0 border-r flex flex-col h-screen"
          style={{
            background: COLORS.sidebarBg,
            borderColor: COLORS.border,
            borderWidth: 0,
            borderRightWidth: 1,
          }}
        >
          <div className="flex items-center justify-between px-6 py-6 gap-2">
            <span
              className="font-bold text-xl tracking-tight"
              style={{ color: COLORS.primary }}
            >
              Notes
            </span>
            <button
              className="rounded-full p-2 hover:bg-[#eef3fa] transition"
              style={{ color: COLORS.accent }}
              aria-label="New note"
              onClick={openCreateModal}
              title="Create note"
            >
              <FiPlus size={22} />
            </button>
          </div>
          <div className="px-5 mb-3">
            <div className="flex items-center pr-1 bg-[#e8eef6] rounded-lg shadow-sm">
              <FiSearch className="ml-3 mr-2 text-[#93add1]" size={18} />
              <input
                autoFocus={false}
                type="text"
                value={searchTerm}
                placeholder="Search notes"
                className="w-full outline-none bg-transparent border-none py-2 text-[15px]"
                style={{ color: COLORS.secondary }}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {displayedNotes.length ? (
              <ul>
                {displayedNotes.map((note) => (
                  <li key={note.id}>
                    <button
                      className={`w-full text-left py-3 px-6  border-l-4 flex flex-col transition group ${
                        currentId === note.id
                          ? "bg-[#e6f0fa]"
                          : "bg-transparent hover:bg-[#f4f8fd]"
                      }`}
                      style={{
                        borderColor:
                          currentId === note.id ? COLORS.primary : "transparent",
                        color: COLORS.secondary,
                        borderRadius: 0,
                      }}
                      aria-current={currentId === note.id ? "true" : undefined}
                      onClick={() => setCurrentId(note.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold text-[15px] truncate ${
                            currentId === note.id ? "text-[#1967b2]" : ""
                          }`}
                        >
                          {note.title || "Untitled"}
                        </span>
                        <span className="flex gap-1">
                          <button
                            className="opacity-50 hover:opacity-90 p-1 hover:bg-[#f9e0a7] rounded"
                            style={{ color: COLORS.accent }}
                            aria-label="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(note);
                            }}
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            className="opacity-40 hover:opacity-90 p-1 hover:bg-[#efefef] rounded"
                            style={{ color: COLORS.secondary }}
                            aria-label="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  `Delete note: "${note.title || "Untitled"}"?`
                                )
                              )
                                handleDelete(note.id);
                            }}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </span>
                      </div>
                      <span
                        className="text-xs mt-1 opacity-60"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {formatDate(note.lastEdited)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-sm text-[#a2a2a2] text-center">
                {notes.length
                  ? "No notes match your search."
                  : "No notes yet. Create a note!"}
              </div>
            )}
          </div>
        </nav>

        {/* Main Content Display */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="flex items-center justify-between px-8 py-7 border-b"
            style={{ borderColor: COLORS.border, borderBottomWidth: 1 }}>
            <div className="font-bold text-lg" style={{ color: COLORS.primary }}>
              {currNote?.title || (notes.length ? "Select a note" : "Notes App")}
            </div>
            <div>
              <button
                className="rounded px-4 py-2 font-semibold hover:shadow"
                style={{
                  background: COLORS.primary,
                  color: "#fff",
                  display: currNote ? undefined : "none",
                }}
                onClick={() => currNote && openEditModal(currNote)}
              >
                <FiEdit size={16} className="mr-1 inline" />
                Edit
              </button>
            </div>
          </header>
          {/* Note Content */}
          <section className="flex-1 overflow-y-auto">
            {currNote ? (
              <article className="max-w-2xl mx-auto py-16 px-8">
                <div style={{ whiteSpace: "pre-wrap", fontSize: 17 }}>
                  {currNote.content}
                </div>
                <div className="pt-8 flex items-center gap-3 text-[#888] text-xs">
                  <FiEdit className="inline" />
                  Last edited: {formatDate(currNote.lastEdited)}
                </div>
              </article>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#a1a1a1] pt-40">
                <div className="text-3xl mb-4" style={{ color: COLORS.secondary }}>
                  Notes App
                </div>
                <p className="text-sm mb-5">Select a note or create a new note to get started.</p>
                <button
                  className="rounded px-4 py-2 font-semibold"
                  style={{
                    background: COLORS.primary,
                    color: "#fff",
                  }}
                  onClick={openCreateModal}
                >
                  <FiPlus size={16} className="mr-1 inline" />
                  Create your first note
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
      {/* Modal for create/edit */}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <form
            className="bg-white p-8 rounded-xl shadow-lg w-[90vw] max-w-lg mx-auto flex flex-col gap-6"
            onSubmit={handleModalSubmit}
          >
            <header className="flex items-center justify-between mb-2">
              <div className="font-bold text-lg" style={{ color: COLORS.primary }}>
                {modalMode === "create" ? "Create Note" : "Edit Note"}
              </div>
              <button
                type="button"
                className="rounded p-1 hover:bg-gray-100"
                aria-label="Close"
                onClick={closeModal}
                style={{ color: COLORS.secondary }}
              >
                <FiX size={22} />
              </button>
            </header>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Title</span>
              <input
                value={modalData.title}
                placeholder="Your note title"
                className="rounded px-3 py-2 border text-base"
                style={{
                  borderColor: COLORS.border,
                  fontFamily: "inherit",
                  color: COLORS.secondary,
                }}
                autoFocus
                onChange={e =>
                  setModalData((d) => ({ ...d, title: e.target.value }))
                }
                maxLength={80}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Content</span>
              <textarea
                className="rounded px-3 py-2 border text-base min-h-[140px] max-h-[265px] resize-vertical"
                style={{
                  borderColor: COLORS.border,
                  fontFamily: "inherit",
                  color: COLORS.secondary,
                }}
                required
                value={modalData.content}
                placeholder="Write your note here..."
                onChange={e =>
                  setModalData((d) => ({ ...d, content: e.target.value }))
                }
              />
            </label>
            <footer className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded px-4 py-2 font-semibold border"
                style={{
                  borderColor: COLORS.border,
                  color: COLORS.secondary,
                  background: "#fff",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded px-4 py-2 font-semibold"
                style={{
                  background: COLORS.primary,
                  color: "#fff",
                  boxShadow: "0 1px 6px #1976d231",
                }}
                disabled={!modalData.content.trim()}
              >
                {modalMode === "create" ? "Create" : "Save"}
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}

/**
 * Modal Component with overlay, basic transitions, and focus trap support.
 */
function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Escape key closes Modal
  // Focus trap could be added for accessibility
  return (
    <div
      aria-modal
      tabIndex={-1}
      role="dialog"
      className="fixed z-[99999] inset-0 flex items-center justify-center"
      style={{
        background: "rgba(33,40,53,0.11)",
        backdropFilter: "blur(1.5px)",
      }}
      onClick={onClose}
    >
      <div
        className="relative"
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
        style={{ width: "100%" }}
      >
        {children}
      </div>
    </div>
  );
}
