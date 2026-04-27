// seed.js
// =============================================================================
//  Seed the database with realistic test data.
//  Run with: npm run seed
//
//  Required minimum:
//    - 2 users
//    - 4 projects (split across the users)
//    - 5 tasks (with embedded subtasks and tags arrays)
//    - 5 notes (some attached to projects, some standalone)
//
//  Use the bcrypt module to hash passwords before inserting users.
//  Use ObjectId references for relationships (projectId, ownerId).
// =============================================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect } = require('./db/connection');
const { ObjectId } = require('mongodb');

(async () => {
  const db = await connect();

  console.log('Cleaning up existing data...');
  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('notes').deleteMany({});

  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await db.collection('users').insertOne({
    email: 'hasnat@itu.edu.pk',
    passwordHash,
    name: 'Hasnat',
    createdAt: new Date()
  });

  const user2 = await db.collection('users').insertOne({
    email: 'ali@itu.edu.pk',
    passwordHash,
    name: 'Ali',
    createdAt: new Date()
  });

  const u1Id = user1.insertedId;
  const u2Id = user2.insertedId;

  console.log('Seeding projects...');
  const projects = [
    { ownerId: u1Id, name: 'Final Year Project', description: 'Main university project', archived: false, createdAt: new Date() },
    { ownerId: u1Id, name: 'Open Source', description: 'Contributions to GitHub', archived: false, createdAt: new Date() },
    { ownerId: u2Id, name: 'Personal Blog', description: 'Tech blog setup', archived: false, createdAt: new Date() },
    { ownerId: u2Id, name: 'Fitness App', description: 'Workout tracker', archived: false, createdAt: new Date() }
  ];

  const projDocs = await db.collection('projects').insertMany(projects);
  const pIds = Object.values(projDocs.insertedIds);

  console.log('Seeding tasks...');
  const tasks = [];
  const tags = ['coding', 'writing', 'research', 'design', 'bug'];

  for (let i = 0; i < 20; i++) {
    const ownerId = i < 10 ? u1Id : u2Id;
    const projectId = pIds[i % 4];

    tasks.push({
      ownerId,
      projectId,
      title: `Task ${i + 1}: ${['Fix bug', 'Write docs', 'Design UI', 'Test API'][i % 4]}`,
      status: ['todo', 'in-progress', 'done'][i % 3],
      priority: (i % 3) + 1,
      tags: [tags[i % 5], tags[(i + 1) % 5]],
      subtasks: [
        { title: 'Subtask A', done: i % 2 === 0 },
        { title: 'Subtask B', done: i % 3 === 0 }
      ],
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60) // Spaced out by hours
    });
  }

  // Demonstrate schema flexibility by adding a dueDate to some tasks
  tasks[0].dueDate = new Date(Date.now() + 86400000);
  tasks[5].dueDate = new Date(Date.now() + 172800000);

  await db.collection('tasks').insertMany(tasks);

  console.log('Seeding notes...');
  const notes = [];
  for (let i = 0; i < 10; i++) {
    const ownerId = i < 5 ? u1Id : u2Id;
    const projectId = i % 2 === 0 ? pIds[i % 4] : null; // Some standalone notes

    notes.push({
      ownerId,
      projectId,
      content: `Note ${i + 1} content: Important findings about ${['performance', 'security', 'usability'][i % 3]}.`,
      tags: [tags[i % 5]],
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 2)
    });
  }

  await db.collection('notes').insertMany(notes);

  console.log('Database seeded successfully!');
  process.exit(0);
})();
