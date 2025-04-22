import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Word = sequelize.define(
    "Word",
    {
      word_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      word: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      difficulty: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "Words",
    }
  );
  return Word;
};
