import { connectDatabase, disconnectDatabase } from '../config/database';
import { UserModel } from '../models/user.model';
import { VocabularyWordModel } from '../models/vocabulary.model';
import { GrammarUnitModel, GrammarQuestionModel } from '../models/grammar.model';
import { DailyChallengeModel } from '../models/daily_challenge.model';
import { hashPassword } from '../utils/password.utils';

async function seed() {
  await connectDatabase();
  console.log('[Seed] Starting database seed...');

  // 1. Seed Default User (Alex Carter)
  const defaultEmail = 'alex.carter@example.com';
  let alex = await UserModel.findOne({ email: defaultEmail });
  if (!alex) {
    const passwordHash = await hashPassword('password123');
    alex = await UserModel.create({
      name: 'Alex Carter',
      email: defaultEmail,
      passwordHash,
      role: 'learner',
      cefrLevel: 'B1',
      streakDays: 14,
      studyTimeMinutesToday: 45,
      weeklyGoalPercent: 82,
      totalXp: 1450,
      avatarUrl: '/uploads/character_solo.jpg',
      preferences: {
        nativeLanguage: 'Spanish (Español)',
        tutorPersona: 'Maya (US Native)',
        voiceSpeed: '1.0x (Normal)',
        dailyReminders: true,
        acousticFeedback: true,
      },
    });
    console.log('[Seed] Default user Alex Carter created: alex.carter@example.com / password123');
  }

  // 2. Seed Vocabulary Words (including Word of the Day "Confident")
  await VocabularyWordModel.deleteMany({});
  await VocabularyWordModel.create([
    {
      word: 'Confident',
      phonetic: '/ˈkɒnfɪdənt/',
      partOfSpeech: 'Adjective',
      cefrLevel: 'B1',
      definition: 'Feeling or showing certainty about something or an appreciation of one’s own abilities.',
      exampleSentence: '“She walked into the job interview feeling confident and articulate.”',
      memoryAnchor: 'Anchor: Trust yourself, speak boldly.',
      isWordOfTheDay: true,
      imageUrl: '/uploads/illustration_1.png',
    },
    {
      word: 'Articulate',
      phonetic: '/ɑːˈtɪkjələt/',
      partOfSpeech: 'Adjective',
      cefrLevel: 'B2',
      definition: 'Having or showing the ability to speak fluently and coherently.',
      exampleSentence: '“An articulate speaker can convey complex ideas with utmost simplicity.”',
      memoryAnchor: 'Anchor: Jointed clarity in speech.',
      isWordOfTheDay: false,
    },
    {
      word: 'Eloquent',
      phonetic: '/ˈɛləkwənt/',
      partOfSpeech: 'Adjective',
      cefrLevel: 'C1',
      definition: 'Fluent or persuasive in speaking or writing.',
      exampleSentence: '“His eloquent speech inspired the entire audience at the conference.”',
      memoryAnchor: 'Anchor: Flowing elegance in words.',
      isWordOfTheDay: false,
    },
    {
      word: 'Resilient',
      phonetic: '/rɪˈzɪlɪənt/',
      partOfSpeech: 'Adjective',
      cefrLevel: 'B2',
      definition: 'Able to withstand or recover quickly from difficult conditions.',
      exampleSentence: '“Learning a new language requires patience and a resilient attitude.”',
      memoryAnchor: 'Anchor: Bouncing back stronger.',
      isWordOfTheDay: false,
    },
  ]);
  console.log('[Seed] Vocabulary words seeded.');

  // 3. Seed Grammar Unit 4 & Questions
  await GrammarUnitModel.deleteMany({});
  await GrammarQuestionModel.deleteMany({});

  const unit4 = await GrammarUnitModel.create({
    unitNumber: 4,
    title: 'Mastering Sentence Flow',
    description: 'Learn when and how to naturally connect contrasting statements in spoken conversations.',
    cefrLevel: 'B1',
  });

  await GrammarQuestionModel.create([
    {
      unitId: unit4._id,
      questionText: 'Choose the natural connector to link these contrasting statements:',
      prompt: '“The weather forecast predicted heavy rain; ______, we decided to proceed with our guided outdoor walking tour.”',
      options: ['However', 'Although', 'Therefore', 'Because'],
      correctOptionIndex: 0,
      explanation: '“However” introduces a contrasting result following a semicolon and comma in compound sentences.',
    },
    {
      unitId: unit4._id,
      questionText: 'Select the concessive clause connector:',
      prompt: '“______ she was feeling exhausted after the flight, she attended the welcoming dinner.”',
      options: ['Although', 'However', 'Therefore', 'Since'],
      correctOptionIndex: 0,
      explanation: '“Although” is a subordinating conjunction used at the start of a subordinate clause of concession.',
    },
  ]);
  console.log('[Seed] Grammar units and questions seeded.');

  // 4. Seed Daily Challenge (Idiom Sprint)
  await DailyChallengeModel.deleteMany({});
  const todayString = new Date().toISOString().split('T')[0];

  await DailyChallengeModel.create({
    dateString: todayString,
    title: 'Daily Fluency Sprint',
    prompt: 'Which idiom means to face an inevitable, difficult situation with courage and fortitude?',
    options: ['Bite the bullet', 'Spill the beans', 'Break the ice', 'Hit the sack'],
    correctOptionIndex: 0,
    xpReward: 50,
    timeLimitSeconds: 60,
  });
  console.log('[Seed] Daily challenge seeded for today:', todayString);

  console.log('[Seed] Database seeding completed successfully! ✨');
  await disconnectDatabase();
}

seed().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
