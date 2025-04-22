import { DataTypes } from "sequelize";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Generate UUIDs
        primaryKey: true,
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING(50), // Max length 50
        allowNull: false,
        // Add unique: true if nicknames must be globally unique
      },
      // createdAt & updatedAt are added by default by Sequelize if timestamps: true (default)
    },
    {
      // Model options
      timestamps: true, // Use Sequelize's createdAt and updatedAt fields
      tableName: "Users", // Optional: Explicitly set table name
    }
  );
  return User;
};
