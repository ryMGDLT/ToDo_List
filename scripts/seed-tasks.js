/**
 * Seed script to generate test tasks for infinite scrolling testing
 * Run with: node scripts/seed-tasks.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const TASKS_TO_GENERATE = 50; // Number of tasks to generate
const CATEGORIES = ['Work', 'Personal', 'Health', 'Shopping', 'Education', 'Travel', 'Finance'];
const PRIORITIES = ['high', 'medium', 'low'];

// Define Todo schema inline (to avoid module resolution issues)
const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  completed: { type: Boolean, default: false },
  ongoing: { type: Boolean, default: false },
  priority: { type: String, default: 'medium' },
  category: { type: String, default: 'Personal' },
  startDate: { type: String },
  endDate: { type: String },
  startTime: { type: String },
  endTime: { type: String },
  completedAt: { type: Date },
}, { timestamps: true });

const Todo = mongoose.models.Todo || mongoose.model('Todo', TodoSchema);

// Sample task titles
const TASK_TITLES = [
  'Complete project proposal',
  'Review quarterly report',
  'Update client documentation',
  'Prepare presentation slides',
  'Schedule team meeting',
  'Analyze market trends',
  'Write performance review',
  'Organize workspace',
  'Back up important files',
  'Research new tools',
  'Update calendar reminders',
  'Send follow-up emails',
  'Review budget allocation',
  'Complete training module',
  'Draft new policy document',
  'Set up development environment',
  'Test new feature deployment',
  'Document API endpoints',
  'Create user guide',
  'Review security protocols',
  'Update software licenses',
  'Conduct code review',
  'Optimize database queries',
  'Refactor legacy code',
  'Write unit tests',
  'Create backup strategy',
  'Monitor system performance',
  'Investigate bug reports',
  'Implement new functionality',
  'Update dependencies',
  'Configure CI/CD pipeline',
  'Review pull requests',
  'Plan sprint goals',
  'Estimate task effort',
  'Coordinate with stakeholders',
  'Validate data integrity',
  'Deploy to staging environment',
  'Gather user feedback',
  'Analyze competitors',
  'Develop marketing strategy',
  'Create social media content',
  'Write blog post',
  'Design landing page',
  'Implement analytics tracking',
  'Test cross-browser compatibility',
  'Optimize images',
  'Improve page load speed',
  'Update error handling',
  'Add logging mechanisms',
  'Review access permissions',
  'Clean up old data',
];

// Sample descriptions
const DESCRIPTIONS = [
  'This is a high priority task that requires immediate attention.',
  'Quick task that should only take a few minutes.',
  'Medium priority task with no specific deadline.',
  'Important project milestone that needs to be completed.',
  'Regular maintenance task to keep things running smoothly.',
  'Administrative task that needs to be done this week.',
  'Strategic initiative with long-term impact.',
  'Operational task for day-to-day workflow.',
  'Compliance requirement that must be addressed.',
  'Improvement task to enhance current processes.',
];

// Helper to generate random date within a range
function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

// Helper to generate random time
function randomTime() {
  const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
  const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo_app';

async function generateTasks() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing tasks
    console.log('Clearing existing tasks...');
    await Todo.deleteMany({});
    console.log('Cleared existing tasks');

    // Generate new tasks
    console.log(`Generating ${TASKS_TO_GENERATE} test tasks...`);
    const tasks = [];
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < TASKS_TO_GENERATE; i++) {
      const startDate = randomDate(threeMonthsAgo, now);
      const endDate = randomDate(new Date(startDate), threeMonthsLater);
      
      tasks.push({
        title: `${TASK_TITLES[i % TASK_TITLES.length]} #${i + 1}`,
        description: DESCRIPTIONS[i % DESCRIPTIONS.length] + ` This is task #${i + 1} of ${TASKS_TO_GENERATE}.`,
        completed: Math.random() > 0.7, // 30% completed
        ongoing: Math.random() > 0.85, // 15% ongoing
        priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        startDate,
        endDate,
        startTime: randomTime(),
        endTime: randomTime(),
      });
    }

    // Sort by createdAt (newest first)
    tasks.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    await Todo.insertMany(tasks);
    console.log(`Successfully generated ${TASKS_TO_GENERATE} test tasks!`);

    // Display summary
    const count = await Todo.countDocuments();
    console.log(`\nDatabase now contains ${count} tasks`);
    
    const byCategory = await Todo.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    console.log('\nTasks by category:');
    byCategory.forEach(cat => console.log(`  ${cat._id}: ${cat.count}`));

    const byPriority = await Todo.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    console.log('\nTasks by priority:');
    byPriority.forEach(pri => console.log(`  ${pri._id}: ${pri.count}`));

  } catch (error) {
    console.error('Error generating tasks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed script
generateTasks();
