// src/models/index.js
import { Sequelize } from 'sequelize';
import sequelizeInstance from '../database/connection.js'; // Import your configured sequelize instance

// Import model definition functions
import UserModel from './User.js';
import WordModel from './Word.js';
import RoomModel from './Room.js';
import RoomPlayerModel from './RoomPlayer.js';
import TurnModel from './Turn.js';
import ChatMessageModel from './ChatMessage.js';

const db = {};

// Initialize models
db.User = UserModel(sequelizeInstance);
db.Word = WordModel(sequelizeInstance);
db.Room = RoomModel(sequelizeInstance);
db.RoomPlayer = RoomPlayerModel(sequelizeInstance);
db.Turn = TurnModel(sequelizeInstance);
db.ChatMessage = ChatMessageModel(sequelizeInstance);

// --- Define Associations ---

// User <-> Room (Many-to-Many through RoomPlayer)
db.User.belongsToMany(db.Room, {
  through: db.RoomPlayer,
  foreignKey: 'user_id', // Foreign key in RoomPlayers referencing User
  otherKey: 'room_id'     // Foreign key in RoomPlayers referencing Room
});
db.Room.belongsToMany(db.User, {
  through: db.RoomPlayer,
  foreignKey: 'room_id',   // Foreign key in RoomPlayers referencing Room
  otherKey: 'user_id'      // Foreign key in RoomPlayers referencing User
});
// Also define direct relationships to the join table for easier access/querying
db.User.hasMany(db.RoomPlayer, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.Room.hasMany(db.RoomPlayer, { foreignKey: 'room_id', onDelete: 'CASCADE' });
db.RoomPlayer.belongsTo(db.User, { foreignKey: 'user_id' });
db.RoomPlayer.belongsTo(db.Room, { foreignKey: 'room_id' });

// Room Creator (One User creates Many Rooms)
db.User.hasMany(db.Room, { foreignKey: 'creator_user_id', as: 'CreatedRooms', onDelete: 'SET NULL'});
db.Room.belongsTo(db.User, { foreignKey: 'creator_user_id', as: 'Creator'});

// Room Current Drawer (One User draws in One Room at a time - conceptually)
db.User.hasMany(db.Room, { foreignKey: 'current_turn_drawer_user_id', as: 'CurrentlyDrawingInRooms', onDelete: 'SET NULL'});
db.Room.belongsTo(db.User, { foreignKey: 'current_turn_drawer_user_id', as: 'CurrentDrawer'});

// Room Current Word (One Word selected for One Room at a time)
db.Word.hasMany(db.Room, { foreignKey: 'current_word_id', as: 'CurrentlySelectedInRooms', onDelete: 'SET NULL'});
db.Room.belongsTo(db.Word, { foreignKey: 'current_word_id', as: 'CurrentWord'});

// Room -> Turns (One Room has Many Turns)
db.Room.hasMany(db.Turn, { foreignKey: 'room_id', onDelete: 'CASCADE' });
db.Turn.belongsTo(db.Room, { foreignKey: 'room_id' });

// Turn -> Drawer (One User draws per Turn)
db.User.hasMany(db.Turn, { foreignKey: 'drawer_user_id', as: 'DrawnTurns', onDelete: 'CASCADE' });
db.Turn.belongsTo(db.User, { foreignKey: 'drawer_user_id', as: 'Drawer'});

// Turn -> Guesser (One User guesses correctly per Turn)
db.User.hasMany(db.Turn, { foreignKey: 'correct_guesser_user_id', as: 'GuessedTurns', onDelete: 'SET NULL'});
db.Turn.belongsTo(db.User, { foreignKey: 'correct_guesser_user_id', as: 'CorrectGuesser'});

// Turn -> Word (One Word drawn per Turn)
db.Word.hasMany(db.Turn, { foreignKey: 'word_id', onDelete: 'RESTRICT' }); // Prevent deleting used words
db.Turn.belongsTo(db.Word, { foreignKey: 'word_id' });

// Room -> ChatMessages (One Room has Many Messages)
db.Room.hasMany(db.ChatMessage, { foreignKey: 'room_id', onDelete: 'CASCADE' });
db.ChatMessage.belongsTo(db.Room, { foreignKey: 'room_id' });

// User -> ChatMessages (One User sends Many Messages)
db.User.hasMany(db.ChatMessage, { foreignKey: 'sender_user_id', onDelete: 'CASCADE' });
db.ChatMessage.belongsTo(db.User, { foreignKey: 'sender_user_id' });

// --- Finish Setup ---
db.sequelize = sequelizeInstance; // Export the instance
db.Sequelize = Sequelize;       // Export the Sequelize library class

export default db; // Export the db object containing models and instance
