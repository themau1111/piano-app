export type ExerciseKind =
  | "keyboard_note"
  | "staff_note"
  | "ear_interval"
  | "melodic_direction"
  | "rhythm_pulse"
  | "scale_construction"
  | "chord_identification";

export type RunStatus = "active" | "solved" | "revealed" | "exhausted";

export type MasteryRule = {
  minAttempts: number;
  minAccuracy: number;
  minStreak: number;
};

export type TemplatePresentation = {
  instructions?: string;
  clef?: "treble";
  keyboardRange?: [number, number];
  showStaff?: boolean;
  autoReplay?: boolean;
  allowReplay?: boolean;
  attemptsAllowed?: number;
};

export type ExerciseTemplateConfig =
  | {
      skillCode: string;
      levelIndex: number;
      generator: "keyboard_note";
      constraints: {
        notes: string[];
        octaves: number[];
        accidentals: ("natural" | "sharp" | "flat")[];
        inputMode: "single-note";
      };
      presentation: TemplatePresentation;
      mastery: MasteryRule;
    }
  | { skillCode: string; levelIndex: number; generator: "rhythm_pulse"; constraints: { beats: 4; silencePositions: number[] }; presentation: TemplatePresentation; mastery: MasteryRule }
  | {
      skillCode: string;
      levelIndex: number;
      generator: "staff_note";
      constraints: {
        clef: "treble";
        range: { minMidi: number; maxMidi: number };
        accidentals: ("natural" | "sharp" | "flat")[];
        ledgerLines: boolean;
      };
      presentation: TemplatePresentation;
      mastery: MasteryRule;
    }
  | {
      skillCode: string;
      levelIndex: number;
      generator: "ear_interval";
      constraints: {
        intervalSet: string[];
        direction: "ascending" | "descending" | "both";
        playMode: "melodic" | "harmonic";
        range: { minMidi: number; maxMidi: number };
      };
      presentation: TemplatePresentation;
      mastery: MasteryRule;
    }
  | {
      skillCode: string;
      levelIndex: number;
      generator: "melodic_direction";
      constraints: {
        direction: "ascending" | "descending" | "both";
        semitones: number[];
        range: { minMidi: number; maxMidi: number };
      };
      presentation: TemplatePresentation;
      mastery: MasteryRule;
    }
  | {
      skillCode: string;
      levelIndex: number;
      generator: "scale_construction";
      constraints: {
        roots: string[];
        mode: "major" | "ionian";
        octave: number;
        answerStyle: "keyboard" | "pitch-classes";
      };
      presentation: TemplatePresentation;
      mastery: MasteryRule;
    }
  | {
      skillCode: string;
      levelIndex: number;
      generator: "chord_identification";
      constraints: {
        qualities: string[];
        inversions: number[];
        voicing: "close" | "open" | "mixed";
        range: { minMidi: number; maxMidi: number };
        requireName: boolean;
        requireInversion: boolean;
      };
      presentation: TemplatePresentation;
      mastery: MasteryRule;
    };

export type PlaybackEvent = {
  midi: number;
  atMs: number;
  durationMs: number;
};

export type StaffRenderNote = {
  midi: number;
  label?: string;
  revealed?: boolean;
};

export type ExercisePrompt =
  | {
      kind: "keyboard_note";
      text: string;
      targetLabel: string;
      keyboardRange: [number, number];
    }
  | {
      kind: "staff_note";
      text: string;
      keyboardRange: [number, number];
    }
  | {
      kind: "ear_interval";
      text: string;
      options: string[];
    }
  | {
      kind: "melodic_direction";
      text: string;
      options: Array<"ascending" | "descending">;
    }
  | { kind: "rhythm_pulse"; text: string; beats: number; options: number[]; silencePosition: number }
  | {
      kind: "scale_construction";
      text: string;
      keyboardRange: [number, number];
      expectedCount: number;
    }
  | {
      kind: "chord_identification";
      text: string;
      keyboardRange: [number, number];
      requireName: boolean;
      requireInversion: boolean;
    };

export type ExerciseInputSpec =
  | {
      mode: "single-piano";
      minSelections: 1;
      maxSelections: 1;
    }
  | {
      mode: "multi-piano";
      minSelections: number;
      maxSelections: number;
    }
  | {
      mode: "interval-options";
      options: string[];
    }
  | {
      mode: "choice-options";
      options: Array<"ascending" | "descending">;
    }
  | { mode: "rhythm-options"; options: number[] }
  | {
      mode: "chord-builder";
      minSelections: number;
      maxSelections: number;
      requireName: boolean;
      requireInversion: boolean;
    };

export type ExercisePresentation = {
  instructions: string;
  clef?: "treble";
  staffNotes?: StaffRenderNote[];
  playback?: PlaybackEvent[];
  allowReplay: boolean;
  autoReplay: boolean;
  keyboardRange?: [number, number];
};

export type RunFeedback = {
  status: RunStatus;
  correct: boolean;
  message: string;
  nextStep?: string;
  weakTags: string[];
  answerSummary?: Record<string, unknown>;
  reveal?: {
    label: string;
    noteLabels?: string[];
    inversion?: number;
  };
};

export type ExerciseRunSnapshot = {
  runId: string;
  exercise: {
    id: number;
    kind: ExerciseKind;
    title: string;
    skillCode: string;
    levelIndex: number;
    topicId: number | null;
    topicCode?: string;
    sectionCode?: string;
  };
  status: RunStatus;
  attemptsLeft: number;
  seed: number;
  prompt: ExercisePrompt;
  input: ExerciseInputSpec;
  presentation: ExercisePresentation;
  feedback: RunFeedback | null;
};

export type ExerciseAttemptAnswer = {
  selectedMidis?: number[];
  interval?: string;
  direction?: "ascending" | "descending";
  pulsePosition?: number;
  chordName?: string;
  inversion?: number | null;
};

export type Section = {
  id: number;
  code: string;
  title: string;
  description?: string;
};

export type Topic = {
  id: number;
  section_id: number;
  code: string;
  title: string;
  description?: string;
};

export type ExerciseCatalogItem = {
  id: number;
  section_id: number;
  topic_id: number | null;
  kind: ExerciseKind;
  title: string;
  description?: string;
  config: ExerciseTemplateConfig;
  is_active?: boolean;
};

export type ExerciseDetail = {
  id: number;
  kind: ExerciseKind;
  title: string;
  description?: string;
  topicId: number | null;
  topicCode?: string;
  sectionCode?: string;
  config: ExerciseTemplateConfig;
};

export type LessonSummary = {
  id: number;
  topicId: number;
  code: string;
  title: string;
  summary: string;
  objective: string;
  prerequisites: string[];
  completion: Record<string, unknown>;
  nextLessonCode: string | null;
};

export type LessonBlock = {
  id: number;
  position: number;
  kind: "explanation" | "exercise" | "reflection" | "recap";
  content: Record<string, unknown>;
  exercise: { id: number; title: string; kind: ExerciseKind } | null;
};

export type LessonDetail = LessonSummary & { blocks: LessonBlock[] };

export type ProgressStats = {
  attempts: number;
  correct: number;
  streak: number;
  lastResult: {
    correct: boolean;
    at: string;
    runId: string;
  } | null;
  mastered: boolean;
  masteredAt: string | null;
  nextDueAt: string | null;
  weakTags: string[];
};

export type ProgressResponse = {
  items: Array<{
    exerciseId: number;
    title: string;
    kind: ExerciseKind;
    skillCode: string;
    levelIndex: number;
    topicCode: string;
    topicTitle: string;
    sectionCode: string;
    stats: ProgressStats | null;
    learningState: "practiced" | "in_progress" | "mastered";
  }>;
  summary: {
    attempted: number;
    mastered: number;
    accuracy: number;
  };
};

export type PracticeQueueItem = {
  exerciseId: number;
  title: string;
  kind: ExerciseKind;
  skillCode: string;
  levelIndex: number;
  sectionCode: string;
  topicCode: string;
  topicTitle: string;
  reason: "due" | "current" | "new";
  explanation?: string;
  stats: ProgressStats | null;
};

export type PracticeQueueResponse = {
  dailyGoalMinutes: number;
  currentTopic: {
    code: string;
    title: string;
    sectionCode: string;
  } | null;
  items: PracticeQueueItem[];
  summary: {
    due: number;
    current: number;
    new: number;
  };
};

export type AdminCatalogData = {
  sections: Section[];
  topics: Topic[];
  exercises: ExerciseCatalogItem[];
  lessons: Array<{
    id: number;
    topic_id: number;
    code: string;
    title: string;
    summary: string | null;
    objective: string;
    prerequisites: string[];
    completion: Record<string, unknown>;
    next_lesson_code: string | null;
    is_active: boolean;
  }>;
  lessonBlocks: Array<{
    id: number;
    lesson_id: number;
    position: number;
    kind: "explanation" | "exercise" | "reflection" | "recap";
    content: Record<string, unknown>;
    exercise_id: number | null;
  }>;
};
