import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ChatMessage = sequelize.define(
    "ChatMessage",
    {
      message_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      // room_id, sender_user_id added via associations
      message_text: {
        type: DataTypes.TEXT, // Use TEXT for potentially long messages
        allowNull: false,
      },
      is_guess: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true, // Use Sequelize's createdAt/updatedAt
      updatedAt: false, // Often don't need updatedAt for chat messages
      tableName: "ChatMessages",
      // indexes: [ { fields: ['room_id', 'createdAt'] } ] // Index for fetching history
    }
  );
  return ChatMessage;
};
