import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Turn = sequelize.define(
    "Turn",
    {
      turn_id: {
        type: DataTypes.BIGINT, // Use BIGINT for potentially many turns
        autoIncrement: true,
        primaryKey: true,
      },
      // room_id, drawer_user_id, word_id, correct_guesser_user_id added via associations
      round_number: {
        type: DataTypes.SMALLINT,
        allowNull: false,
      },
      turn_number_in_round: {
        // Useful for ordering turns within a round
        type: DataTypes.SMALLINT,
        allowNull: false,
      },
      word_text: {
        // Store the actual word text for convenience
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      started_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      ended_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      was_word_guessed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      drawer_score_delta: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      guesser_score_delta: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // drawing_data: { type: DataTypes.JSONB } // If storing strokes (SQLite might need TEXT or BLOB)
    },
    {
      timestamps: false, // Use started_at/ended_at instead
      tableName: "Turns",
      // indexes: [ { fields: ['room_id', 'round_number'] } ] // Example index
    }
  );
  return Turn;
};
