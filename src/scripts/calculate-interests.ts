import sequelize from "../config/database";
import { entryLogger, errorLogger } from "../utils/logger";

export const calculateInterestScores = async () => {
  entryLogger("[Analysis Job] Starting interest score calculation...");

  const transaction = await sequelize.transaction();

  try {
    const insertQuery = `
      INSERT INTO user_interest_scores (user_id, category_id, score)
      SELECT
          user_id,
          target_category_id,
          SUM(CASE
              WHEN activity_type = 'post_like' THEN 1
              WHEN activity_type = 'comment' THEN 3
              WHEN activity_type = 'post_view' THEN 0.5
              WHEN activity_type = 'follow' THEN 5
              ELSE 0
          END) as calculated_score
      FROM user_activity_logs
      WHERE target_category_id IS NOT NULL
        AND processed = false
      GROUP BY user_id, target_category_id
      ON CONFLICT (user_id, category_id) DO UPDATE
      SET score = user_interest_scores.score + EXCLUDED.score;
    `;

    await sequelize.query(insertQuery, { transaction });

    const updateQuery = `
      UPDATE user_activity_logs
      SET processed = true
      WHERE processed = false
        AND target_category_id IS NOT NULL;
    `;

    await sequelize.query(updateQuery, { transaction });

    await transaction.commit();

    entryLogger("[Analysis Job] Interest score calculation completed.");
  } catch (error) {
    await transaction.rollback();
    errorLogger(error as Error, "[Analysis Job] Error calculating interest scores:");
  }
};
