import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { User, Post, Category, Like, Comment, Follow } from '../models';
import { CONFIG } from '../constants/constants';

// --- CONFIGURATION ---

const seedDatabase = async () => {
  console.log('--- Starting database seed ---');

  try {
    // 1. Connect to the database and wipe all existing data
    console.log('🔄 Synchronizing database schema (this will delete all existing data)...');
    await sequelize.sync({ force: true });
    console.log('✅ Schema synchronized.');

    // 2. Create Categories
    console.log('🌱 Seeding categories...');
    const categoriesData = [
      { name: 'Technology', slug: 'technology' },
      { name: 'Travel', slug: 'travel' },
      { name: 'Food', slug: 'food' },
      { name: 'Books', slug: 'books' },
      { name: 'Fitness', slug: 'fitness' },
      { name: 'Art & Design', slug: 'art-design' },
      { name: 'General', slug: 'general' },
    ];
    const categories = await Category.bulkCreate(categoriesData);
    console.log(`✅ Created ${categories.length} categories.`);

    // 3. Create Users
    console.log(`🌱 Seeding ${CONFIG.SEED.NUM_USERS} users...`);
    const usersData = [];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt); // All users get the same simple password

    for (let i = 0; i < CONFIG.SEED.NUM_USERS; i++) {
      usersData.push({
        username: faker.internet.userName().toLowerCase(),
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        bio: faker.lorem.sentence(),
        avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${faker.person.firstName()}`
      });
    }
    const users = await User.bulkCreate(usersData);
    console.log(`✅ Created ${users.length} users.`);

    // 4. Create Posts
    console.log(`🌱 Seeding posts for each user...`);
    const postsData = [];
    for (const user of users) {
      for (let i = 0; i < CONFIG.SEED.POSTS_PER_USER; i++) {
        postsData.push({
          user_id: user.id,
          category_id: categories[Math.floor(Math.random() * categories.length)].id,
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          content_text: faker.lorem.paragraphs(2),
          is_published: true,
        });
      }
    }
    const posts = await Post.bulkCreate(postsData);
    console.log(`✅ Created ${posts.length} posts.`);

    // 5. Create Follows
    console.log('🌱 Seeding follow relationships...');
    const followsData = [];
    for (const user of users) {
      const usersToFollow = users
        .filter(u => u.id !== user.id) // Can't follow yourself
        .sort(() => 0.5 - Math.random()) // Shuffle users
        .slice(0, CONFIG.SEED.FOLLOWS_PER_USER); // Select a random number of users to follow

      for (const userToFollow of usersToFollow) {
        followsData.push({
          follower_id: user.id,
          following_id: userToFollow.id,
        });
      }
    }
    await Follow.bulkCreate(followsData);
    console.log(`✅ Created ${followsData.length} follow relationships.`);

    // 6. Create Likes and Comments
    console.log('🌱 Seeding likes and comments...');
    const likesData = [];
    const commentsData = [];
    for (const post of posts) {
      // Each post gets a random number of likes
      const likers = users
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * (CONFIG.SEED.NUM_USERS / 2)));
      for (const liker of likers) {
        likesData.push({
          user_id: liker.id,
          post_id: post.id,
        });
      }

      // Each post gets a few random comments
      const commenters = users
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 5));
      for (const commenter of commenters) {
        commentsData.push({
          user_id: commenter.id,
          post_id: post.id,
          content_text: faker.lorem.sentence(),
        });
      }
    }
    await Like.bulkCreate(likesData);
    await Comment.bulkCreate(commentsData);
    console.log(`✅ Created ${likesData.length} likes and ${commentsData.length} comments.`);

    console.log('--- 🎉 Database seed complete! ---');

  } catch (error) {
    console.error('❌ An error occurred during the seeding process:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
};

seedDatabase();
