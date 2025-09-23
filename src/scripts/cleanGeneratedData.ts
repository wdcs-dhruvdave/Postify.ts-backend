import sequelize from '../config/database';
import { 
  User, 
  Post, 
  Category, 
  Like, 
  Dislike, 
  Comment, 
  Follow, 
  Conversation, 
  Participant, 
  Message 
} from '../models';

const cleanGeneratedData = async () => {
  console.log('--- Starting to clean generated data ---');

  try {
    const [results]: [any[], any] = await sequelize.query('SELECT current_database()');
    console.log(`✅ Script is connected to database: "${results[0].current_database}"`);
    if (results[0].current_database !== process.env.DB_DATABASE) {
      console.error(`❌ DANGER: Script is connected to "${results[0].current_database}", but your .env file specifies "${process.env.DB_DATABASE}". Aborting clean.`);
      process.exit(1);
    }

    await sequelize.transaction(async (t) => {
      console.log('🔄 Deleting interaction data (Likes, Dislikes, Comments, Follows)...');
      await Like.destroy({ where: {}, truncate: true, cascade: true, transaction: t });
      await Dislike.destroy({ where: {}, truncate: true, cascade: true, transaction: t });
      await Comment.destroy({ where: {}, truncate: true, cascade: true, transaction: t });
      await Follow.destroy({ where: {}, truncate: true, cascade: true, transaction: t });

      console.log('🔄 Deleting chat data (Message Read Receipts, Messages, Participants, Conversations)...');
      // Make sure to delete dependent tables first to avoid FK issues
      await sequelize.query('TRUNCATE "message_read_receipts" CASCADE', { transaction: t });
      await Message.destroy({ where: {}, truncate: true, cascade: true, transaction: t });
      await Participant.destroy({ where: {}, truncate: true, cascade: true, transaction: t });
      await Conversation.destroy({ where: {}, truncate: true, cascade: true, transaction: t });

      console.log('🔄 Deleting core content data (Posts)...');
      await Post.destroy({ where: {}, truncate: true, cascade: true, transaction: t });

      console.log('🔄 Deleting user data (Users)...');
      await User.destroy({ where: {}, truncate: true, cascade: true, transaction: t });
    });

    console.log('✅ All user-generated data has been successfully removed.');
    console.log('ℹ️ Categories have been preserved.');

  } catch (error) {
    console.error('❌ An error occurred during the cleaning process:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
};

cleanGeneratedData();
