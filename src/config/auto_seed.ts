import { UserModel } from '../models/user.model';
import { VocabularyWordModel } from '../models/vocabulary.model';
import { GrammarUnitModel, GrammarQuestionModel } from '../models/grammar.model';
import { DailyChallengeModel } from '../models/daily_challenge.model';
import { hashPassword } from '../utils/password.utils';

export async function autoSeedDatabase(): Promise<void> {
  try {
    // 1. Ensure Default User (Alex Carter)
    const alex = await UserModel.findOne({ email: 'alex.carter@example.com' });
    if (!alex) {
      const passwordHash = await hashPassword('password123');
      await UserModel.create({
        name: 'Alex Carter',
        email: 'alex.carter@example.com',
        passwordHash,
        role: 'admin',
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
      console.log('[AutoSeed] Created default user Alex Carter (alex.carter@example.com / password123)');
    }

    // 2. Ensure Vocabulary Words
    const vocabCount = await VocabularyWordModel.countDocuments();
    if (vocabCount === 0) {
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
      console.log('[AutoSeed] Seeded core vocabulary deck.');
    }

    // 3. Ensure Grammar Units & Questions
    const grammarCount = await GrammarUnitModel.countDocuments();
    if (grammarCount === 0) {
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
          questionText: 'Fill in the blank with the appropriate transition:',
          prompt: '“I was extremely tired; ______, I finished my presentation before the deadline.”',
          options: ['Nevertheless', 'Since', 'Unless', 'Whereas'],
          correctOptionIndex: 0,
          explanation: '“Nevertheless” contrasts an extreme condition with an accomplished goal.',
        },
      ]);
      console.log('[AutoSeed] Seeded Grammar Unit 4 & Questions.');
    }

    // 4. Ensure Today\'s Daily Challenge
    const today = new Date().toISOString().split('T')[0];
    const todayChallenge = await DailyChallengeModel.findOne({ dateString: today });
    if (!todayChallenge) {
      await DailyChallengeModel.create({
        dateString: today,
        title: 'Daily Fluency Sprint',
        prompt: 'Which idiom means to face an inevitable, difficult situation with courage and fortitude?',
        options: [
          'Bite the bullet',
          'Spill the beans',
          'Break the ice',
          'Hit the sack',
        ],
        correctOptionIndex: 0,
        xpReward: 50,
        timeLimitSeconds: 60,
      });
      console.log(`[AutoSeed] Seeded daily challenge for ${today}.`);
    }
  } catch (err) {
    console.warn('[AutoSeed] Auto-seed warning:', err);
  }
}
