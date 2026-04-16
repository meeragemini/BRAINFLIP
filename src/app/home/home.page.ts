import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  createdAt: number;
  editedAt: number;
  favorite: boolean;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  noteId?: string;
  color?: string;
}

interface Folder {
  name: string;
}

interface FCGroup {
  noteId: string;
  label: string;
  fcs: Flashcard[];
}

interface Design {
  id: string;
  label: string;
  gradient: string;
}

interface GamePlayer {
  name: string;
  avatar: string;
  editing: boolean;
  score: number;
}

interface ConfettiPiece {
  x: number;
  color: string;
  delay: number;
}

interface MatchPair {
  term: string;
  def: string;
}

type RPSChoice = 'rock' | 'paper' | 'scissors';
type RPSPhase = 'idle' | 'animating' | 'result';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class HomePage implements OnInit, OnDestroy {

  // ── NAVIGATION ────────────────────────────────────────────
  currentSection:
    | 'home' | 'notes' | 'noteEditor' | 'flashcardSets' | 'flashcards'
    | 'folders' | 'folderDetail' | 'premium' | 'premiumActive'
    | 'gameFeatures' | 'gameSetSelect' | 'gamePlayerSetup'
    | 'gameRPS' | 'gameQuestion' | 'gameEnd' | 'favorites' = 'home';

  noteEditorOrigin: 'home' | 'notes' | 'favorites' | 'folderDetail' = 'notes';

  // ── HOME ─────────────────────────────────────────────────
  homeSearch = '';

  // ── NOTES ────────────────────────────────────────────────
  notes: Note[] = [];
  notesSearch = '';
  swipedNoteId: string | null = null;

  showMoveNoteModal = false;
  moveNoteTarget: Note | null = null;

  // ── NOTE EDITOR ───────────────────────────────────────────
  editingNoteId: string | null = null;
  editorTitle = '';
  editorContent = '';
  editorFolder = 'General';
  editorFavorite = false;
  showDotMenu = false;
  showNewFolderInMenu = false;
  newFolderInMenu = '';

  // ── FOLDERS ───────────────────────────────────────────────
  folders: Folder[] = [];
  newFolderName = '';
  activeFolderName = '';
  editingFolderName = '';
  folderEditValue = '';

  // ── FLASHCARDS ────────────────────────────────────────────
  allFlashcards: Flashcard[] = [];
  activeGroupNoteId: string | null = null;
  groupCardIndex = 0;
  groupCardFlipped = false;

  showFlashcardModal = false;
  editingFlashcardId = '';
  fcModalQuestion = '';
  fcModalAnswer = '';
  fcModalColor = '#ffffff';

  fcPastelColors = [
    '#FDE8FF', '#E0F2FE', '#D1FAE5', '#FEF9C3',
    '#FCE7F3', '#FFE4D6', '#EDE9FE',
  ];

  showTimerPicker = false;
  timerActive = false;
  timerDisplay = '0:00';
  selectedTimerSeconds = 5;
  timerProgressPercent = 100;
  private timerInterval: any;
  private timerCountdown = 0;

  // ── DESIGN ───────────────────────────────────────────────
  selectedDesign = 'default';
  flashcardDesigns: Design[] = [
    { id: 'default', label: 'Purple', gradient: 'linear-gradient(135deg,#9B27AF,#5DB4F9)' },
    { id: 'ocean',   label: 'Ocean',  gradient: 'linear-gradient(135deg,#0EA5E9,#0284C7)' },
    { id: 'sunset',  label: 'Sunset', gradient: 'linear-gradient(135deg,#F97316,#EF4444)' },
    { id: 'forest',  label: 'Forest', gradient: 'linear-gradient(135deg,#22C55E,#15803D)' },
    { id: 'rose',    label: 'Rose',   gradient: 'linear-gradient(135deg,#EC4899,#DB2777)' },
    { id: 'gold',    label: 'Gold',   gradient: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  ];

  // ── PREMIUM ───────────────────────────────────────────────
  isPremium = false;

  premiumActiveFeatures = [
    'Unlimited flashcards',
    'Custom flashcard designs (color & style)',
    'Multiplayer study sessions (up to 7 players)',
    'Multiple Choice & Matching game modes',
    'Timed Quiz mode',
    'Player rankings & crown winner',
  ];

  gameFeatures = [
    { icon: 'grid-outline',    title: 'Matching Game',    desc: 'Match terms with definitions in a fast-paced game.', color: 'linear-gradient(135deg,#B86AFF,#9C27FB)', mode: 'matching' },
    { icon: 'radio-button-on', title: 'Multiple Choice',  desc: 'Test yourself with multiple choice questions.',        color: 'linear-gradient(135deg,#4495FF,#1A64FD)', mode: 'multipleChoice' },
    { icon: 'people-outline',  title: 'Multiplayer Mode', desc: 'Study with friends — up to 7 players.',               color: 'linear-gradient(135deg,#FB923C,#EA580C)', mode: 'multiplayer' },
    { icon: 'timer-outline',   title: 'Timed Quiz',       desc: 'Beat the clock with each question.',                  color: 'linear-gradient(135deg,#FB5557,#E80016)', mode: 'timedQuiz' },
  ];

  // ── GAME STATE ────────────────────────────────────────────
  currentGameMode: 'matching' | 'multipleChoice' | 'multiplayer' | 'timedQuiz' = 'matching';
  currentGameTitle = '';
  selectedGameSetNoteId = '';
  gameQuestions: Flashcard[] = [];
  currentQuestionIndex = 0;

  showAnswer = false;
  gameCorrectCount = 0;
  gameWrongCount = 0;

  // ── SESSION TIMER ─────────────────────────────────────────
  sessionTimerSeconds = 15;
  sessionTimerOptions = [15, 20, 30];
  showGameTimerPicker = false;
  sessionTimeLeft = 15;
  sessionTimerProgressPercent = 100;
  private sessionTimerInterval: any;

  // ── PER-QUESTION TIMER (timedQuiz only) ───────────────────
  gameTimerSeconds = 15;
  gameTimerOptions = [15, 20, 30];
  gameTimeLeft = 15;
  private gameTimerInterval: any;

  currentQuestionPlayer: GamePlayer | null = null;
  private playerQueueIndex = 0;

  currentMCOptions: string[] = [];
  selectedMCAnswer: string | null = null;

  // ── MATCHING GAME STATE (full-session) ────────────────────
  matchingTerms: string[] = [];
  matchingDefs: string[] = [];
  selectedMatchTerm: string | null = null;
  selectedMatchDef: string | null = null;

  /** Pairs the user has committed (term → def) */
  userMatchPairs: MatchPair[] = [];

  /** Set after submission to show feedback */
  matchSubmitted = false;
  submittedCorrectTerms: Set<string> = new Set();
  submittedWrongTerms: Set<string> = new Set();
  submittedCorrectDefs: Set<string> = new Set();
  submittedWrongDefs: Set<string> = new Set();

  // ── ROCK PAPER SCISSORS ───────────────────────────────────
  rpsPhase: RPSPhase = 'idle';
  rpsCurrentPicker: GamePlayer | null = null;
  rpsOpponent: GamePlayer | null = null;
  rpsPlayerChoice: RPSChoice | null = null;
  rpsComputerChoice: RPSChoice | null = null;
  rpsWinner: GamePlayer | null = null;
  rpsOutcomeText = '';
  rpsOutcomeClass = '';
  rpsCountdownText = '';
  rpsCountdownEmoji = '🪨';
  rpsRoundNumber = 1;
  private rpsAnimInterval: any;

  gamePlayers: GamePlayer[] = [
    { name: 'Player 1', avatar: '🦊', editing: false, score: 0 },
    { name: 'Player 2', avatar: '🐼', editing: false, score: 0 },
  ];
  animalAvatars = ['🦊', '🐼', '🐯', '🦁', '🐸', '🐨', '🦄'];

  confettiPieces: ConfettiPiece[] = [];
  confettiColors = ['#A855F7', '#28CAC7', '#F59E0B', '#EF4444', '#22C55E', '#3B82F6'];

  // ── SWIPE ─────────────────────────────────────────────────
  private swipeStartX = 0;

  // ── TOAST ─────────────────────────────────────────────────
  toastMessage = '';
  private toastTimer: any;

  ngOnInit() { this.loadFromStorage(); }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
    clearInterval(this.gameTimerInterval);
    clearInterval(this.sessionTimerInterval);
    clearInterval(this.rpsAnimInterval);
  }

  // ── COMPUTED ──────────────────────────────────────────────

  get filteredNotes(): Note[] {
    const q = this.notesSearch.toLowerCase();
    return [...this.notes]
      .filter(n => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .sort((a, b) => b.editedAt - a.editedAt);
  }

  get recentNotes(): Note[] {
    return [...this.notes].sort((a, b) => b.editedAt - a.editedAt).slice(0, 3);
  }

  get folderNotes(): Note[] {
    return this.notes
      .filter(n => n.folder === this.activeFolderName)
      .sort((a, b) => b.editedAt - a.editedAt);
  }

  get favoriteNotes(): Note[] {
    return this.notes.filter(n => n.favorite).sort((a, b) => b.editedAt - a.editedAt);
  }

  get allFolderNames(): string[] {
    return ['General', ...this.folders.map(f => f.name)];
  }

  get homeFilteredNotes(): Note[] {
    const q = this.homeSearch.toLowerCase().trim();
    if (!q) return [];
    return [...this.notes]
      .filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .sort((a, b) => b.editedAt - a.editedAt)
      .slice(0, 10);
  }

  get fcGroups(): FCGroup[] {
    const map: { [key: string]: Flashcard[] } = {};
    for (const fc of this.allFlashcards) {
      const key = fc.noteId || 'manual';
      if (!map[key]) map[key] = [];
      map[key].push(fc);
    }
    return Object.entries(map).map(([noteId, fcs]) => {
      const note = this.notes.find(n => n.id === noteId);
      return { noteId, label: note ? note.title : 'Manual Cards', fcs };
    });
  }

  get activeGroup(): FCGroup | null {
    if (!this.activeGroupNoteId) return this.fcGroups[0] || null;
    return this.fcGroups.find(g => g.noteId === this.activeGroupNoteId) || this.fcGroups[0] || null;
  }

  get activeGroupFCs(): Flashcard[] {
    return this.activeGroup?.fcs || [];
  }

  get rankedPlayers(): GamePlayer[] {
    return [...this.gamePlayers].sort((a, b) => b.score - a.score);
  }

  getNotesInFolder(name: string): Note[] {
    return this.notes.filter(n => n.folder === name);
  }

  get showFAB(): boolean {
    return ['home', 'notes', 'folderDetail'].includes(this.currentSection);
  }

  get showBottomNav(): boolean {
    return !['noteEditor', 'gameFeatures', 'gameSetSelect', 'gamePlayerSetup',
      'gameRPS', 'gameQuestion', 'gameEnd'].includes(this.currentSection);
  }

  // ── SESSION TIMER UTILITIES ───────────────────────────────

  formatSessionTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  private _startSessionTimer() {
    clearInterval(this.sessionTimerInterval);
    this.sessionTimeLeft = this.sessionTimerSeconds;
    this.sessionTimerProgressPercent = 100;

    this.sessionTimerInterval = setInterval(() => {
      this.sessionTimeLeft--;
      this.sessionTimerProgressPercent = (this.sessionTimeLeft / this.sessionTimerSeconds) * 100;

      if (this.sessionTimeLeft <= 0) {
        clearInterval(this.sessionTimerInterval);
        this.showToast("Time's up! Session ended.");
        this.endGame();
      }
    }, 1000);
  }

  private _stopSessionTimer() {
    clearInterval(this.sessionTimerInterval);
  }

  // ── NAVIGATION ────────────────────────────────────────────

  goHome() {
    this.currentSection = 'home';
    this.showDotMenu = false;
    this.swipedNoteId = null;
  }

  goNotes() {
    this.currentSection = 'notes';
    this.swipedNoteId = null;
    this.showDotMenu = false;
  }

  goFlashcards() { this.currentSection = 'flashcards'; }
  goFlashcardSets() { this.currentSection = 'flashcardSets'; }
  backToFlashcardSets() { this.currentSection = 'flashcardSets'; }
  goFolders() { this.currentSection = 'folders'; }
  goFavorites() { this.currentSection = 'favorites'; }
  goPremium() { this.currentSection = this.isPremium ? 'premiumActive' : 'premium'; }
  goGameFeatures() { this.currentSection = 'gameFeatures'; }

  isNavActive(key: string): boolean {
    if (key === 'home') return ['home', 'favorites'].includes(this.currentSection);
    if (key === 'notes') return ['notes', 'noteEditor'].includes(this.currentSection);
    if (key === 'flashcards') return ['flashcardSets', 'flashcards'].includes(this.currentSection);
    if (key === 'folders') return ['folders', 'folderDetail'].includes(this.currentSection);
    return false;
  }

  // ── NOTES ─────────────────────────────────────────────────

  openNewNote(folder = 'General') {
    this.editingNoteId = null;
    this.editorTitle = '';
    this.editorContent = '';
    this.editorFolder = folder;
    this.editorFavorite = false;
    this.showDotMenu = false;
    this.swipedNoteId = null;
    this.noteEditorOrigin = this.currentSection === 'folderDetail' ? 'folderDetail'
      : this.currentSection === 'favorites' ? 'favorites'
      : this.currentSection === 'home' ? 'home'
      : 'notes';
    this.currentSection = 'noteEditor';
  }

  editNote(note: Note, origin: 'home' | 'notes' | 'favorites' | 'folderDetail' = 'notes') {
    this.editingNoteId = note.id;
    this.editorTitle = note.title;
    this.editorContent = note.content;
    this.editorFolder = note.folder;
    this.editorFavorite = note.favorite;
    this.noteEditorOrigin = origin;
    this.swipedNoteId = null;
    this.currentSection = 'noteEditor';
  }

  saveNote() {
    this._persistEditorNote();
    this.showToast('Note saved!');
    const origin = this.noteEditorOrigin;
    this.editingNoteId = null;
    this._returnFromEditor(origin);
  }

  autoSaveAndBack() {
    const hasContent = this.editorTitle.trim() || this.editorContent.trim();
    if (hasContent) this._persistEditorNote();
    this.editingNoteId = null;
    this._returnFromEditor(this.noteEditorOrigin);
  }

  private _returnFromEditor(origin: string) {
    switch (origin) {
      case 'folderDetail': this.currentSection = 'folderDetail'; break;
      case 'favorites':    this.currentSection = 'favorites';    break;
      case 'home':         this.currentSection = 'home';         break;
      default:             this.currentSection = 'notes';
    }
  }

  private _persistEditorNote() {
    const title = this.editorTitle.trim() || 'Untitled Note';
    const now = Date.now();
    if (this.editingNoteId) {
      const idx = this.notes.findIndex(n => n.id === this.editingNoteId);
      if (idx !== -1) {
        this.notes[idx] = {
          ...this.notes[idx],
          title,
          content: this.editorContent,
          folder: this.editorFolder,
          favorite: this.editorFavorite,
          editedAt: now,
        };
      }
    } else {
      const note: Note = {
        id: now.toString(),
        title,
        content: this.editorContent,
        folder: this.editorFolder,
        createdAt: now,
        editedAt: now,
        favorite: this.editorFavorite,
      };
      this.notes.unshift(note);
      this.editingNoteId = note.id;
    }
    this.saveToStorage();
  }

  deleteNote(id: string) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.allFlashcards = this.allFlashcards.filter(fc => fc.noteId !== id);
    this.swipedNoteId = null;
    this.saveToStorage();
    this.showToast('Note deleted.');
  }

  toggleFavorite(note: Note) {
    const idx = this.notes.findIndex(n => n.id === note.id);
    if (idx !== -1) {
      this.notes[idx].favorite = !this.notes[idx].favorite;
      this.saveToStorage();
      this.swipedNoteId = null;
      this.showToast(this.notes[idx].favorite ? 'Added to favorites!' : 'Removed from favorites.');
    }
  }

  toggleEditorFav() {
    this.editorFavorite = !this.editorFavorite;
    if (this.editingNoteId) {
      const idx = this.notes.findIndex(n => n.id === this.editingNoteId);
      if (idx !== -1) {
        this.notes[idx].favorite = this.editorFavorite;
        this.saveToStorage();
      }
    }
  }

  openMoveNoteMenu(note: Note) {
    this.moveNoteTarget = note;
    this.showMoveNoteModal = true;
    this.swipedNoteId = null;
  }

  moveNote(folderName: string) {
    if (!this.moveNoteTarget) return;
    const idx = this.notes.findIndex(n => n.id === this.moveNoteTarget!.id);
    if (idx !== -1) {
      this.notes[idx].folder = folderName;
      this.saveToStorage();
      this.showToast(`Moved to "${folderName}"`);
    }
    this.showMoveNoteModal = false;
    this.moveNoteTarget = null;
  }

  toggleDotMenu() { this.showDotMenu = !this.showDotMenu; }

  setEditorFolder(name: string) {
    this.editorFolder = name;
    this.showDotMenu = false;
    this.showToast(`Folder: ${name}`);
  }

  addFolderFromMenu() {
    const name = this.newFolderInMenu.trim();
    if (this.createFolder(name)) {
      this.editorFolder = name;
      this.newFolderInMenu = '';
      this.showNewFolderInMenu = false;
    }
  }

  // ── SWIPE ─────────────────────────────────────────────────

  onSwipeStart(e: TouchEvent | MouseEvent) {
    this.swipeStartX = e instanceof TouchEvent
      ? e.touches[0].clientX
      : (e as MouseEvent).clientX;
  }

  onSwipeEnd(noteId: string, e: TouchEvent | MouseEvent) {
    const endX = e instanceof TouchEvent
      ? e.changedTouches[0].clientX
      : (e as MouseEvent).clientX;
    const diff = this.swipeStartX - endX;
    if (diff > 40) {
      this.swipedNoteId = noteId;
    } else if (diff < -20) {
      this.swipedNoteId = null;
    }
  }

  isSwiped(id: string): boolean { return this.swipedNoteId === id; }

  clearSwipe() { this.swipedNoteId = null; }

  // ── FOLDERS ───────────────────────────────────────────────

  createFolder(name: string): boolean {
    const n = name.trim();
    if (!n || this.folders.some(f => f.name === n) || n === 'General') return false;
    this.folders.push({ name: n });
    this.newFolderName = '';
    this.saveToStorage();
    this.showToast('Folder created!');
    return true;
  }

  openFolder(name: string) {
    this.activeFolderName = name;
    this.swipedNoteId = null;
    this.currentSection = 'folderDetail';
  }

  startEditFolder(name: string) {
    this.editingFolderName = name;
    this.folderEditValue = name;
  }

  saveEditFolder(oldName: string) {
    const newName = this.folderEditValue.trim();
    if (!newName || newName === oldName) { this.editingFolderName = ''; return; }
    if (this.folders.some(f => f.name === newName)) {
      this.showToast('Name already exists.');
      return;
    }
    const idx = this.folders.findIndex(f => f.name === oldName);
    if (idx !== -1) {
      this.folders[idx].name = newName;
      this.notes.forEach(n => { if (n.folder === oldName) n.folder = newName; });
      if (this.activeFolderName === oldName) this.activeFolderName = newName;
    }
    this.editingFolderName = '';
    this.saveToStorage();
    this.showToast('Folder renamed!');
  }

  deleteFolder(name: string) {
    this.folders = this.folders.filter(f => f.name !== name);
    const ids = this.notes.filter(n => n.folder === name).map(n => n.id);
    this.notes = this.notes.filter(n => n.folder !== name);
    this.allFlashcards = this.allFlashcards.filter(fc => !ids.includes(fc.noteId || ''));
    this.saveToStorage();
    this.showToast('Folder deleted.');
  }

  // ── FLASHCARDS ────────────────────────────────────────────

  private parseNoteToFlashcards(note: Note): { question: string; answer: string }[] {
    const cards: { question: string; answer: string }[] = [];
    const text = note.content;

    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines) {
      for (const sep of [' – ', ' - ', ' — ', ': ']) {
        const idx = line.indexOf(sep);
        if (idx > 0 && idx < line.length - sep.length) {
          const term = line.substring(0, idx).trim();
          const def  = line.substring(idx + sep.length).trim();
          if (term && def && term.length < 80 && term.split(' ').length <= 8) {
            cards.push({ question: `What is ${term}?`, answer: def });
            break;
          }
        }
      }
    }
    if (cards.length > 0) return cards.slice(0, 20);

    const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
    for (const sentence of sentences) {
      const s = sentence.trim();
      if (s.length < 10) continue;
      const isMatch = s.match(/^(.{3,40}?)\s+(?:is|was|are|were)\s+(.{5,})$/i);
      if (isMatch) {
        const subj = isMatch[1].trim();
        const def  = isMatch[2].replace(/[.!?]$/, '').trim();
        if (subj.split(' ').length <= 5 && def.length > 4) {
          cards.push({ question: `What is ${subj}?`, answer: def });
        }
      }
    }

    const seen = new Set<string>();
    return cards
      .filter(c => { if (seen.has(c.question)) return false; seen.add(c.question); return true; })
      .slice(0, 20);
  }

  sparkNote(note: Note) {
    const generated = this.parseNoteToFlashcards(note);
    if (generated.length === 0) {
      this.showToast("Could not detect facts. Try 'Term – Definition' format.");
      return;
    }
    let added = 0;
    for (const g of generated) {
      if (!this.allFlashcards.some(fc => fc.question === g.question && fc.noteId === note.id)) {
        this.allFlashcards.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          question: g.question,
          answer: g.answer,
          noteId: note.id,
        });
        added++;
      }
    }
    this.groupCardIndex = 0;
    this.groupCardFlipped = false;
    this.saveToStorage();
    if (added > 0) {
      this.showToast(`${added} flashcard(s) generated!`);
    } else {
      this.showToast('Already up to date.');
    }
    this.activeGroupNoteId = note.id;
    this.currentSection = 'flashcardSets';
  }

  sparkCurrentNote() {
    const title = this.editorTitle.trim() || 'Untitled Note';
    const now = Date.now();
    let noteId = this.editingNoteId;

    if (this.editingNoteId) {
      const idx = this.notes.findIndex(n => n.id === this.editingNoteId);
      if (idx !== -1) {
        this.notes[idx] = { ...this.notes[idx], title, content: this.editorContent, editedAt: now };
      }
    } else {
      noteId = now.toString();
      this.notes.unshift({
        id: noteId!,
        title,
        content: this.editorContent,
        folder: this.editorFolder,
        createdAt: now,
        editedAt: now,
        favorite: this.editorFavorite,
      });
      this.editingNoteId = noteId;
    }
    this.saveToStorage();
    this.sparkNote({
      id: noteId!,
      title,
      content: this.editorContent,
      folder: this.editorFolder,
      createdAt: now,
      editedAt: now,
      favorite: this.editorFavorite,
    });
  }

  openFlashcardSet(noteId: string) {
    this.activeGroupNoteId = noteId;
    this.groupCardIndex = 0;
    this.groupCardFlipped = false;
    this.currentSection = 'flashcards';
  }

  flipGroupCard() { this.groupCardFlipped = !this.groupCardFlipped; }

  nextGroupCard() {
    if (this.groupCardIndex < this.activeGroupFCs.length - 1) {
      this.groupCardFlipped = false;
      setTimeout(() => this.groupCardIndex++, 60);
    }
    if (this.timerActive) this._restartCountdown();
  }

  prevGroupCard() {
    if (this.groupCardIndex > 0) {
      this.groupCardFlipped = false;
      setTimeout(() => this.groupCardIndex--, 60);
    }
    if (this.timerActive) this._restartCountdown();
  }

  openTimerPicker() { this.showTimerPicker = !this.showTimerPicker; }

  setTimerDuration(seconds: number) {
    this.selectedTimerSeconds = seconds;
    this.showTimerPicker = false;
    this._startCountdown();
  }

  cancelTimer() {
    clearInterval(this.timerInterval);
    this.timerActive = false;
    this.showTimerPicker = false;
    this.timerProgressPercent = 100;
  }

  private _startCountdown() {
    clearInterval(this.timerInterval);
    this.timerActive = true;
    this._restartCountdown();
  }

  private _restartCountdown() {
    clearInterval(this.timerInterval);
    this.timerCountdown = this.selectedTimerSeconds;
    this.timerProgressPercent = 100;
    const m = Math.floor(this.timerCountdown / 60);
    const s = this.timerCountdown % 60;
    this.timerDisplay = `${m}:${s.toString().padStart(2, '0')}`;

    this.timerInterval = setInterval(() => {
      this.timerCountdown--;
      const cm = Math.floor(this.timerCountdown / 60);
      const cs = this.timerCountdown % 60;
      this.timerDisplay = `${cm}:${cs.toString().padStart(2, '0')}`;
      this.timerProgressPercent = (this.timerCountdown / this.selectedTimerSeconds) * 100;

      if (this.timerCountdown <= 0) {
        clearInterval(this.timerInterval);
        this.nextGroupCard();
      }
    }, 1000);
  }

  openAddFlashcardManual() {
    this.editingFlashcardId = '';
    this.fcModalQuestion = '';
    this.fcModalAnswer = '';
    this.fcModalColor = '#ffffff';
    this.showFlashcardModal = true;
  }

  openEditFC() {
    const fc = this.activeGroupFCs[this.groupCardIndex];
    if (!fc) return;
    this.editingFlashcardId = fc.id;
    this.fcModalQuestion = fc.question;
    this.fcModalAnswer = fc.answer;
    this.fcModalColor = fc.color || '#ffffff';
    this.showFlashcardModal = true;
  }

  saveFlashcard() {
    const q = this.fcModalQuestion.trim();
    const a = this.fcModalAnswer.trim();
    if (!q || !a) { this.showToast('Please fill in both fields.'); return; }

    if (this.editingFlashcardId) {
      const idx = this.allFlashcards.findIndex(fc => fc.id === this.editingFlashcardId);
      if (idx !== -1) {
        this.allFlashcards[idx] = {
          ...this.allFlashcards[idx],
          question: q,
          answer: a,
          color: this.fcModalColor,
        };
      }
      this.showToast('Flashcard updated!');
    } else {
      const manualGroup = this.activeGroupNoteId || 'manual';
      this.allFlashcards.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        question: q,
        answer: a,
        noteId: manualGroup === 'manual' ? undefined : manualGroup,
        color: this.fcModalColor,
      });
      this.showToast('Flashcard added!');
    }

    this.showFlashcardModal = false;
    this.saveToStorage();
  }

  deleteCurrentFC() {
    const fc = this.activeGroupFCs[this.groupCardIndex];
    if (!fc) return;
    this.allFlashcards = this.allFlashcards.filter(f => f.id !== fc.id);
    if (this.groupCardIndex >= this.activeGroupFCs.length) {
      this.groupCardIndex = Math.max(0, this.activeGroupFCs.length - 1);
    }
    this.saveToStorage();
    this.showToast('Flashcard deleted.');
  }

  closeFlashcardModal() {
    this.showFlashcardModal = false;
    this.editingFlashcardId = '';
    this.fcModalQuestion = '';
    this.fcModalAnswer = '';
  }

  // ── GAME ─────────────────────────────────────────────────

  startGame(mode: string) {
    if (!this.isPremium) { this.goPremium(); return; }
    this.currentGameMode = mode as any;
    const found = this.gameFeatures.find(g => g.mode === mode);
    this.currentGameTitle = found ? found.title : 'Game';

    this.sessionTimerSeconds = 15;
    this.showGameTimerPicker = false;

    this.currentSection = 'gameSetSelect';
  }

  selectGameSet(noteId: string) {
    this.selectedGameSetNoteId = noteId;

    if (this.currentGameMode === 'multiplayer') {
      if (this.gamePlayers.length < 1) {
        this.gamePlayers = [
          { name: 'Player 1', avatar: '🦊', editing: false, score: 0 },
          { name: 'Player 2', avatar: '🐼', editing: false, score: 0 },
        ];
      }
      this.currentSection = 'gamePlayerSetup';
    } else {
      this.gamePlayers = [{ name: 'Player 1', avatar: '🦊', editing: false, score: 0 }];
      this.startGameRound();
    }
  }

  addPlayer() {
    if (this.gamePlayers.length >= 7) return;
    const idx = this.gamePlayers.length % this.animalAvatars.length;
    this.gamePlayers.push({
      name: `Player ${this.gamePlayers.length + 1}`,
      avatar: this.animalAvatars[idx],
      editing: false,
      score: 0,
    });
  }

  removePlayer(i: number) {
    if (this.gamePlayers.length <= 1) return;
    this.gamePlayers.splice(i, 1);
  }

  // ── RPS FLOW ──────────────────────────────────────────────

  /**
   * Called when user taps "Start Play" on player setup screen.
   * Picks a random player to go first via RPS.
   */
  initiateRPS() {
  this.rpsPhase = 'idle';
  this.rpsPlayerChoice = null;
  this.rpsComputerChoice = null;
  this.rpsWinner = null;
  this.rpsRoundNumber = 1;

  // STEP 1: pick first player
  const pickerIndex = Math.floor(Math.random() * this.gamePlayers.length);
  this.rpsCurrentPicker = this.gamePlayers[pickerIndex];

  // STEP 2: remove EXACT SAME OBJECT + same name safety
  const others = this.gamePlayers.filter(
    p => p.name !== this.rpsCurrentPicker!.name
  );

  // STEP 3: pick opponent ONLY from others
  this.rpsOpponent =
    others.length > 0
      ? others[Math.floor(Math.random() * others.length)]
      : null;

  // EXTRA SAFETY (optional pero recommended)
  if (this.rpsOpponent?.name === this.rpsCurrentPicker?.name) {
    this.rpsOpponent = others.find(p => p.name !== this.rpsCurrentPicker!.name) || null;
  }

  this.currentSection = 'gameRPS';
}

  selectRPSChoice(choice: RPSChoice) {
    this.rpsPlayerChoice = choice;
  }

  confirmRPSChoice() {
    if (!this.rpsPlayerChoice) return;
    this._playRPSAnimation();
  }

  private _playRPSAnimation() {
    this.rpsPhase = 'animating';
    const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
    const emojis: Record<RPSChoice, string> = { rock: '✊', paper: '✋', scissors: '✌️' };
    const countdownTexts = ['3', '2', '1', 'GO!'];

    let step = 0;
    clearInterval(this.rpsAnimInterval);

    this.rpsAnimInterval = setInterval(() => {
      if (step < 3) {
        // Shuffle the opponent emoji randomly during countdown
        const randChoice = choices[Math.floor(Math.random() * 3)];
        this.rpsCountdownEmoji = emojis[randChoice];
        this.rpsCountdownText = countdownTexts[step];
      } else if (step === 3) {
        this.rpsCountdownText = 'GO!';
        // Final opponent choice
        const compChoice = choices[Math.floor(Math.random() * 3)];
        this.rpsComputerChoice = compChoice;
        this.rpsCountdownEmoji = emojis[compChoice];
      } else {
        clearInterval(this.rpsAnimInterval);
        this._resolveRPS();
      }
      step++;
    }, 600);
  }

  private _resolveRPS() {
    const p = this.rpsPlayerChoice!;
    const c = this.rpsComputerChoice!;

    const wins: Record<RPSChoice, RPSChoice> = {
      rock: 'scissors',
      scissors: 'paper',
      paper: 'rock',
    };

    if (p === c) {
      // Tie
      this.rpsWinner = null;
      this.rpsOutcomeText = 'TIE';
      this.rpsOutcomeClass = 'outcome-tie';
    } else if (wins[p] === c) {
      // Player wins RPS → this picker goes first
      this.rpsWinner = this.rpsCurrentPicker;
      this.rpsOutcomeText = 'WIN';
      this.rpsOutcomeClass = 'outcome-win';
    } else {
  // Computer wins → opponent wins (FIXED)
  this.rpsWinner = this.rpsOpponent;
  this.rpsOutcomeText = 'LOSE';
  this.rpsOutcomeClass = 'outcome-lose';
}

    this.rpsPhase = 'result';
  }

  proceedAfterRPS() {
    if (!this.rpsWinner) {
      // Tie: retry with next player picking
      this.rpsRoundNumber++;
      this.rpsPhase = 'idle';
      this.rpsPlayerChoice = null;
      this.rpsComputerChoice = null;
      // Cycle to next player
      const currentIndex = this.gamePlayers.indexOf(this.rpsCurrentPicker!);
      const nextIndex = (currentIndex + 1) % this.gamePlayers.length;
      this.rpsCurrentPicker = this.gamePlayers[nextIndex];
      return;
    }

    // Set the winner as the first player in queue
    const winnerIndex = this.gamePlayers.indexOf(this.rpsWinner);
    if (winnerIndex > 0) {
      // Reorder players so winner is first
      const reordered = [
        ...this.gamePlayers.slice(winnerIndex),
        ...this.gamePlayers.slice(0, winnerIndex),
      ];
      this.gamePlayers = reordered;
    }

    this.startGameRound();
  }

  getRPSEmoji(choice: RPSChoice | null): string {
    if (!choice) return '❓';
    const map: Record<RPSChoice, string> = { rock: '✊', paper: '✋', scissors: '✌️' };
    return map[choice];
  }
  // ── GAME ROUND ────────────────────────────────────────────
  startGameRound() {
    this.gamePlayers.forEach(p => { p.score = 0; });
    this.gameCorrectCount = 0;
    this.gameWrongCount = 0;

    this.playerQueueIndex = 0;
    this.currentQuestionPlayer = this.gamePlayers[0];

    const group = this.fcGroups.find(g => g.noteId === this.selectedGameSetNoteId);
    if (!group || group.fcs.length === 0) {
      this.showToast('No flashcards in this set.');
      return;
    }
    this.gameQuestions = [...group.fcs].sort(() => Math.random() - 0.5);
    this.currentQuestionIndex = 0;
    this.showAnswer = false;
    this.selectedMCAnswer = null;

    this._setupCurrentQuestion();

    if (this.currentGameMode === 'timedQuiz') {
      this._startGameTimer();
    }

    this._startSessionTimer();
    this.currentSection = 'gameQuestion';
  }

  private _setupCurrentQuestion() {
    this.showAnswer = false;
    this.selectedMCAnswer = null;
    const q = this.gameQuestions[this.currentQuestionIndex];
    if (!q) return;

    if (this.currentGameMode === 'multipleChoice' || this.currentGameMode === 'timedQuiz') {
      this._buildMCOptions(q);
    } else if (this.currentGameMode === 'matching') {
      this._buildMatchingData();
    }
  }

  private _buildMCOptions(fc: Flashcard) {
    const allAnswers = this.gameQuestions
      .map(q => q.answer)
      .filter((a, i, arr) => arr.indexOf(a) === i);
    const wrongAnswers = allAnswers
      .filter(a => a !== fc.answer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const opts = [fc.answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    this.currentMCOptions = opts;
  }
  // ── MATCHING GAME (full-session) ──────────────────────────
  private _buildMatchingData() {
    const pairs = this.gameQuestions.slice(0, Math.min(5, this.gameQuestions.length));
    this.matchingTerms = pairs.map(p => p.question).sort(() => Math.random() - 0.5);
    this.matchingDefs = pairs.map(p => p.answer).sort(() => Math.random() - 0.5);
    this.selectedMatchTerm = null;
    this.selectedMatchDef = null;
    this.userMatchPairs = [];
    this.matchSubmitted = false;
    this.submittedCorrectTerms = new Set();
    this.submittedWrongTerms = new Set();
    this.submittedCorrectDefs = new Set();
    this.submittedWrongDefs = new Set();
  }

  selectMatchTerm(term: string) {
    if (this.matchSubmitted) return;

    // If already paired, remove the pair first (deselect)
    const existingPairIndex = this.userMatchPairs.findIndex(p => p.term === term);
    if (existingPairIndex !== -1) {
      this.userMatchPairs.splice(existingPairIndex, 1);
      if (this.selectedMatchTerm === term) {
        this.selectedMatchTerm = null;
      } else {
        this.selectedMatchTerm = term;
      }
      return;
    }

    // Toggle selection
    if (this.selectedMatchTerm === term) {
      this.selectedMatchTerm = null;
    } else {
      this.selectedMatchTerm = term;
      // Try to pair if a def is already selected
      if (this.selectedMatchDef) {
        this._commitPair(term, this.selectedMatchDef);
      }
    }
  }

  selectMatchDef(def: string) {
    if (this.matchSubmitted) return;

    // If already paired, remove the pair (deselect)
    const existingPairIndex = this.userMatchPairs.findIndex(p => p.def === def);
    if (existingPairIndex !== -1) {
      this.userMatchPairs.splice(existingPairIndex, 1);
      if (this.selectedMatchDef === def) {
        this.selectedMatchDef = null;
      } else {
        this.selectedMatchDef = def;
      }
      return;
    }

    // Toggle selection
    if (this.selectedMatchDef === def) {
      this.selectedMatchDef = null;
    } else {
      this.selectedMatchDef = def;
      // Try to pair if a term is already selected
      if (this.selectedMatchTerm) {
        this._commitPair(this.selectedMatchTerm, def);
      }
    }
  }

  private _commitPair(term: string, def: string) {
    // Remove any existing pair using either this term or def
    this.userMatchPairs = this.userMatchPairs.filter(p => p.term !== term && p.def !== def);
    this.userMatchPairs.push({ term, def });
    this.selectedMatchTerm = null;
    this.selectedMatchDef = null;
  }

  /**
   * Returns the index of a term in userMatchPairs, or -1.
   */
  getPairIndex(term: string): number {
    return this.userMatchPairs.findIndex(p => p.term === term);
  }

  /**
   * Returns the paired def for a term, or null.
   */
  getPairForTerm(term: string): string | null {
    const pair = this.userMatchPairs.find(p => p.term === term);
    return pair ? pair.def : null;
  }

  /**
   * Returns the paired term for a def, or null.
   */
  getPairTermForDef(def: string): string {
    const pair = this.userMatchPairs.find(p => p.def === def);
    return pair ? pair.term : '';
  }

  /**
   * Returns the paired term for a def, or null.
   */
  getPairForDef(def: string): string | null {
    const pair = this.userMatchPairs.find(p => p.def === def);
    return pair ? pair.term : null;
  }

  isPairCorrect(pair: MatchPair): boolean {
    return this.gameQuestions.some(q => q.question === pair.term && q.answer === pair.def);
  }

  submitMatches() {
    this.matchSubmitted = true;

    for (const pair of this.userMatchPairs) {
      const correct = this.isPairCorrect(pair);
      if (correct) {
        this.submittedCorrectTerms.add(pair.term);
        this.submittedCorrectDefs.add(pair.def);
        this.gameCorrectCount++;
        if (this.currentQuestionPlayer) this.currentQuestionPlayer.score += 10;
      } else {
        this.submittedWrongTerms.add(pair.term);
        this.submittedWrongDefs.add(pair.def);
        this.gameWrongCount++;
      }
    }
  }
  // ── PER-QUESTION TIMER (timedQuiz only) ───────────────────
  private _startGameTimer() {
    clearInterval(this.gameTimerInterval);
    this.gameTimeLeft = this.gameTimerSeconds;

    this.gameTimerInterval = setInterval(() => {
      this.gameTimeLeft--;
      if (this.gameTimeLeft <= 0) {
        clearInterval(this.gameTimerInterval);
        this.nextQuestion();
      }
    }, 1000);
  }

  selectMCAnswer(opt: string) {
    if (this.showAnswer) return;
    this.selectedMCAnswer = opt;
    this.showAnswer = true;
    clearInterval(this.gameTimerInterval);

    const correct = opt === this.gameQuestions[this.currentQuestionIndex]?.answer;
    if (correct) {
      this.gameCorrectCount++;
      if (this.currentQuestionPlayer) this.currentQuestionPlayer.score += 10;
    } else {
      this.gameWrongCount++;
    }
  }

  revealAnswer() {
    this.showAnswer = true;
    clearInterval(this.gameTimerInterval);
  }

  markAnswer(correct: boolean) {
    if (correct) {
      this.gameCorrectCount++;
      if (this.currentQuestionPlayer) this.currentQuestionPlayer.score += 10;
    } else {
      this.gameWrongCount++;
    }
    this.nextQuestion();
  }

  nextQuestion() {
    clearInterval(this.gameTimerInterval);

    if (this.currentGameMode === 'matching') {
      // For matching: advance to next batch of questions
      const nextStart = (this.currentQuestionIndex + 1) * this.matchingTerms.length;
      if (nextStart >= this.gameQuestions.length) {
        this.endGame();
        return;
      }
      this.currentQuestionIndex = nextStart;
      // Rebuild matching data from the next slice
      const pairs = this.gameQuestions.slice(this.currentQuestionIndex, this.currentQuestionIndex + 5);
      if (pairs.length === 0) {
        this.endGame();
        return;
      }
      this.matchingTerms = pairs.map(p => p.question).sort(() => Math.random() - 0.5);
      this.matchingDefs = pairs.map(p => p.answer).sort(() => Math.random() - 0.5);
      this.selectedMatchTerm = null;
      this.selectedMatchDef = null;
      this.userMatchPairs = [];
      this.matchSubmitted = false;
      this.submittedCorrectTerms = new Set();
      this.submittedWrongTerms = new Set();
      this.submittedCorrectDefs = new Set();
      this.submittedWrongDefs = new Set();
      return;
    }

    if (this.currentQuestionIndex >= this.gameQuestions.length - 1) {
      this.endGame();
      return;
    }
    this.currentQuestionIndex++;

    this.playerQueueIndex = (this.playerQueueIndex + 1) % this.gamePlayers.length;
    this.currentQuestionPlayer = this.gamePlayers[this.playerQueueIndex];

    this._setupCurrentQuestion();

    if (this.currentGameMode === 'timedQuiz') {
      this._startGameTimer();
    }
  }

  endGame() {
    clearInterval(this.gameTimerInterval);
    this._stopSessionTimer();
    this._spawnConfetti();
    this.currentSection = 'gameEnd';
  }

  private _spawnConfetti() {
    this.confettiPieces = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      color: this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)],
      delay: Math.random() * 800,
    }));
  }
  // ── PREMIUM ───────────────────────────────────────────────
  activatePremium() {
    this.isPremium = true;
    this.saveToStorage();
    this.currentSection = 'home';
    this.showToast('Welcome to Premium! 🎉');
  }

  deactivatePremium() {
    this.isPremium = false;
    this.saveToStorage();
    this.showToast('Premium deactivated.');
    this.currentSection = 'home';
  }
  // ── STORAGE ───────────────────────────────────────────────
  saveToStorage() {
    try {
      localStorage.setItem('bf_notes',      JSON.stringify(this.notes));
      localStorage.setItem('bf_folders',    JSON.stringify(this.folders));
      localStorage.setItem('bf_flashcards', JSON.stringify(this.allFlashcards));
      localStorage.setItem('bf_design',     this.selectedDesign);
      localStorage.setItem('bf_premium',    JSON.stringify(this.isPremium));
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
  }

  loadFromStorage() {
    try { const n = localStorage.getItem('bf_notes');       if (n)  this.notes          = JSON.parse(n); }  catch { this.notes = []; }
    try { const f = localStorage.getItem('bf_folders');     if (f)  this.folders         = JSON.parse(f); } catch { this.folders = []; }
    try { const fc = localStorage.getItem('bf_flashcards'); if (fc) this.allFlashcards   = JSON.parse(fc); } catch { this.allFlashcards = []; }
    try { const d = localStorage.getItem('bf_design');      if (d)  this.selectedDesign  = d; }            catch {}
    try { const p = localStorage.getItem('bf_premium');     if (p)  this.isPremium       = JSON.parse(p); } catch {}
  }
  // ── UTILITIES ─────────────────────────────────────────────
  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  showToast(msg: string) {
    clearTimeout(this.toastTimer);
    this.toastMessage = msg;
    this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 2600);
  }

  clearSwipeOnOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.note-swipe-wrapper') && !target.closest('.swipe-actions')) {
      this.swipedNoteId = null;
    }
    if (!target.closest('.dot-menu-wrapper') && !target.closest('.dot-menu-backdrop')) {
      this.showDotMenu = false;
    }
  }

  trackById(_: number, item: any) { return item.id || item.name; }
  trackByNoteId(_: number, item: FCGroup) { return item.noteId; }
  trackByIndex(index: number) { return index; }
}