import { DataTypes } from "sequelize";

export default (sequelize) => {
  const RoomPlayer = sequelize.define(
    "RoomPlayer",
    {
      // Composite primary key is defined by the combination of foreign keys below
      // user_id and room_id are added via associations
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_ready: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      // is_host: { type: DataTypes.BOOLEAN, defaultValue: false }, // Optional
    },
    {
      timestamps: false, // Often don't need separate timestamps for join table itself
      tableName: "RoomPlayers",
      // Define composite primary key (handled by associations, but explicit if needed)
      // primaryKey: true, // Not needed directly like this for composite via associations
    }
  );
  return RoomPlayer;
};
