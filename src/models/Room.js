import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Room = sequelize.define(
    "Room",
    {
      room_id: {
        type: DataTypes.STRING(16), // Match length if needed
        primaryKey: true,
        allowNull: false,
      },
      // Foreign keys for creator_user_id, current_turn_drawer_user_id, current_word_id
      // will be added automatically by associations defined in models/index.js
      status: {
        type: DataTypes.STRING(20), // 'waiting', 'playing', etc.
        allowNull: false,
        defaultValue: "waiting",
      },
      current_round: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
      },
      max_rounds: {
        type: DataTypes.SMALLINT,
        defaultValue: 3,
      },
      draw_time_limit_seconds: {
        type: DataTypes.SMALLINT,
        defaultValue: 90,
      },
      current_turn_start_time: {
        type: DataTypes.DATE, // Stores timestamp
        allowNull: true,
      },
      last_activity_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      // creator_user_id, current_turn_drawer_user_id, current_word_id added via associations
    },
    {
      timestamps: true,
      tableName: "Rooms",
      // Add indexes if needed via options or migrations
      // indexes: [ { fields: ['status'] } ]
    }
  );
  return Room;
};
