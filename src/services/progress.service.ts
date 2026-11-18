import mongoose from 'mongoose';
import { ProgressLogModel } from '../models/progress_log.model';
import { UserModel } from '../models/user.model';

export class ProgressService {
  private static async resolveUser(userId: string) {
    if (mongoose.isValidObjectId(userId)) {
      const user = await UserModel.findById(userId);
      if (user) return user;
    }
    throw new Error('User not found');
  }

  static async getSummary(userId: string) {
    const user = await this.resolveUser(userId);

    return {
      cefrLevel: user.cefrLevel,
      cefrBenchmark: `Intermediate ${user.cefrLevel}`,
      overallFluencyScore: 84,
      monthlyDelta: '+8% this month',
      streakDays: user.streakDays,
      longestStreakDays: 21,
      studyTimeMinutesToday: user.studyTimeMinutesToday || 28,
      weeklyGoalPercent: user.weeklyGoalPercent,
      totalXp: user.totalXp,
      overview: {
        totalLearningHours: 14.5,
        totalLearningMinutes: 870,
        lessonsCompleted: 38,
        quizzesMastered: 24,
        wordsLearned: 142,
        speakingSessionsCount: 19,
      },
      skillBreakdown: {
        pronunciation: {
          score: 88,
          progress: 0.88,
          label: '88%',
          delta: '+4%',
          level: 'Proficient',
          subskills: ['Word Stress', 'Linking Sounds', 'Vowel Clarity'],
          tip: 'Practice relaxed jaw movement on long diphthongs.',
        },
        vocabulary: {
          score: 82,
          progress: 0.82,
          label: '82%',
          delta: '+6%',
          level: 'Upper-Intermediate',
          subskills: ['Idiomatic Usage', 'Collocations', 'Synonym Precision'],
          tip: 'Review high-frequency B2 adjective-noun pairings.',
        },
        grammar: {
          score: 86,
          progress: 0.86,
          label: '86%',
          delta: '+3%',
          level: 'Advanced',
          subskills: ['Subordinate Clauses', 'Tense Consistency', 'Prepositions'],
          tip: 'Continue practicing conditional structures in spontaneous speech.',
        },
        listening: {
          score: 80,
          progress: 0.80,
          label: '80%',
          delta: '+5%',
          level: 'Intermediate',
          subskills: ['Fast Cadence', 'Accent Variations', 'Contextual Deduction'],
          tip: 'Listen to native dialogues at 1.25x speed to sharpen reflex comprehension.',
        },
        speaking: {
          score: 85,
          progress: 0.85,
          label: '85%',
          delta: '+7%',
          level: 'Fluent',
          subskills: ['Conversational Flow', 'Filler Reductions', 'Pitch Cadence'],
          tip: 'Incorporate natural conversational connectors like "To be honest" or "On the other hand".',
        },
        reading: {
          score: 89,
          progress: 0.89,
          label: '89%',
          delta: '+2%',
          level: 'Mastery',
          subskills: ['Skimming & Scanning', 'Inference', 'Technical Vocabulary'],
          tip: 'Read short analytical articles to reinforce sentence structure.',
        },
        writing: {
          score: 78,
          progress: 0.78,
          label: '78%',
          delta: '+4%',
          level: 'Developing',
          subskills: ['Paragraph Cohesion', 'Formal Register', 'Punctuation'],
          tip: 'Practice writing 3-sentence daily reflections summarizing your speaking topics.',
        },
      },
      weeklyActivity: [
        { day: 'Mon', minutes: 25, completed: 3 },
        { day: 'Tue', minutes: 18, completed: 2 },
        { day: 'Wed', minutes: 30, completed: 4 },
        { day: 'Thu', minutes: 22, completed: 3 },
        { day: 'Fri', minutes: 35, completed: 5 },
        { day: 'Sat', minutes: 40, completed: 6 },
        { day: 'Sun', minutes: 28, completed: 4 },
      ],
      achievements: [
        {
          id: 'streak_7',
          title: '7-Day Champion',
          desc: 'Completed 7 consecutive daily practice sessions',
          icon: '🛡️',
          xp: 50,
          unlocked: true,
          unlockedDate: 'Unlocked Nov 2',
        },
        {
          id: 'pronounce_90',
          title: 'Pronunciation Pro',
          desc: 'Achieved 90%+ pronunciation score in 5 speaking turns',
          icon: '🎙️',
          xp: 75,
          unlocked: true,
          unlockedDate: 'Unlocked Nov 3',
        },
        {
          id: 'vocab_100',
          title: 'Vocab Virtuoso',
          desc: 'Learned and mastered 100+ CEFR vocabulary words',
          icon: '📚',
          xp: 100,
          unlocked: true,
          unlockedDate: 'Unlocked Nov 4',
        },
        {
          id: 'grammar_guru',
          title: 'Grammar Guru',
          desc: 'Scored 100% on Sentence Flow & Connectors Quiz',
          icon: '✍️',
          xp: 80,
          unlocked: true,
          unlockedDate: 'Unlocked Yesterday',
        },
        {
          id: 'century_speaker',
          title: 'Century Club',
          desc: 'Accumulate 100 total speaking practice minutes',
          icon: '💯',
          xp: 150,
          unlocked: false,
          progress: '74/100 Mins',
        },
      ],
      recentActivity: [
        {
          id: '1',
          type: 'speaking',
          title: 'Ordering at a Cafe',
          score: '96%',
          date: '2 hours ago',
          icon: 'mic',
          route: '/ai-speaking',
        },
        {
          id: '2',
          type: 'vocabulary',
          title: 'Confident & Resilient (B1)',
          score: '94%',
          date: 'Today, 10:15 AM',
          icon: 'book',
          route: '/vocabulary',
        },
        {
          id: '3',
          type: 'grammar',
          title: 'Sentence Connectors Quiz',
          score: '100%',
          date: 'Yesterday',
          icon: 'edit',
          route: '/grammar',
        },
        {
          id: '4',
          type: 'challenge',
          title: 'Daily Speed Quest #14',
          score: '92%',
          date: '2 days ago',
          icon: 'bolt',
          route: '/daily-challenge',
        },
      ],
      recommendations: [
        {
          id: 'r1',
          skill: 'Pronunciation',
          title: 'Refine Syllable Stress & Linking',
          reason: 'Unstressed vowel linking had a minor variance in your last session.',
          actionLabel: 'Practice Speaking',
          route: '/ai-speaking',
        },
        {
          id: 'r2',
          skill: 'Vocabulary',
          title: 'Master 5 Modern B2 Colloquial Idioms',
          reason: 'Boost conversational naturalness when expressing emotions.',
          actionLabel: 'Study Vocab',
          route: '/vocabulary',
        },
        {
          id: 'r3',
          skill: 'Grammar',
          title: 'Polish Complex Transitional Connectors',
          reason: 'Strengthen multi-sentence cohesion in professional dialogues.',
          actionLabel: 'Start Lesson',
          route: '/grammar',
        },
      ],
    };
  }

  static async getStreakCalendar(userId: string) {
    const user = await this.resolveUser(userId);

    // Days of the week status
    const weekDays = [
      { day: 'M', active: true },
      { day: 'T', active: true },
      { day: 'W', active: true },
      { day: 'T', active: true },
      { day: 'F', active: true },
      { day: 'S', active: true },
      { day: 'S', active: true },
    ];

    return {
      currentStreakDays: user.streakDays,
      goalDays: '18/25 Days Goal',
      targetPercent: 72,
      weekDays,
    };
  }

  static async logHeartbeat(userId: string, minutes: number) {
    const user = await this.resolveUser(userId);

    user.studyTimeMinutesToday += minutes;
    // Cap weekly goal at 100%
    user.weeklyGoalPercent = Math.min(100, user.weeklyGoalPercent + Math.round(minutes * 0.4));
    user.lastActiveDate = new Date();
    await user.save();

    return {
      studyTimeMinutesToday: user.studyTimeMinutesToday,
      weeklyGoalPercent: user.weeklyGoalPercent,
    };
  }
}
