// Room Management Events
export const CREATE_ROOM = "create_room";
export const ROOM_CREATED = "room_created";
export const JOIN_ROOM = "join_room";
export const ROOM_JOINED = "room_joined";
export const LEAVE_ROOM = "leave_room";
export const ROOM_LEFT = "room_left";
export const PLAYER_JOINED = "player_joined";
export const PLAYER_LEFT = "player_left";
export const ROOM_STATE_UPDATE = "room_state_update";

// Game Flow Events
export const START_GAME = "start_game";
export const GAME_STARTED = "game_started";
export const ROUND_START = "round_start";
export const ROUND_END = "round_end";
export const TURN_START = "turn_start";
export const TURN_END = "turn_end";
export const GAME_END = "game_end";
export const SCORE_UPDATE = "score_update";

// Drawing Events
export const DRAW_EVENT = "draw_event";
export const CLEAR_CANVAS = "clear_canvas";

// Word Events
export const WORD_SELECTED = "word_selected";
export const GUESS_WORD = "guess_word";
export const WORD_GUESSED = "word_guessed";

// Chat Events
export const SEND_MESSAGE = "send_message";
export const RECEIVE_MESSAGE = "receive_message";

// Error Events
export const ERROR = "error";
