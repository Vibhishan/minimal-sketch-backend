import db from "../models/index.js";

class WordService {
  static async getRandomWord() {
    try {
      // Get total count of words
      const count = await db.Word.count();

      // Generate random offset
      const randomOffset = Math.floor(Math.random() * count);

      // Get random word
      const word = await db.Word.findOne({
        offset: randomOffset,
        limit: 1,
      });

      return word;
    } catch (error) {
      console.error("Error getting random word:", error);
      throw error;
    }
  }

  static async addWord(word, category = "general") {
    try {
      const newWord = await db.Word.create({
        word,
        category,
      });

      return newWord;
    } catch (error) {
      console.error("Error adding word:", error);
      throw error;
    }
  }

  static async addWords(words) {
    try {
      const newWords = await db.Word.bulkCreate(
        words.map((word) => ({
          word: word.word,
          category: word.category || "general",
        }))
      );

      return newWords;
    } catch (error) {
      console.error("Error adding words:", error);
      throw error;
    }
  }

  static async getWordsByCategory(category) {
    try {
      const words = await db.Word.findAll({
        where: { category },
        attributes: ["id", "word"],
      });

      return words;
    } catch (error) {
      console.error("Error getting words by category:", error);
      throw error;
    }
  }
}

export default WordService;
