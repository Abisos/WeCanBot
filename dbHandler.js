/**
* SQLit3 database handler
*/
module.exports = {
  /**
  * Creates all tables that are missing in database.
  * @param db The database where the tables are initialized
  */
  initTables: function(db) {
    db.run("CREATE TABLE IF NOT EXISTS xp (userID TEXT, score INTEGER, thx INTEGER)");
    return;
  },

  /**
  * Updates the score for the particular member in guild database.
  * @param db The database where the tables are initialized
  * @param userID The id of the member to update
  * @param score The score that will be added to the overall score
  */
  updateScore: function(db, userID, score) {
    db.get(`SELECT * FROM xp WHERE userID LIKE ${userID}`, (err, row) => {
      if (err) throw err;

      if (!row) {
        db.run(`INSERT INTO xp (userID, score) VALUES (${userID}, ${score})`);
      } else {
        let scoreBefore = row.score;
        db.run(`UPDATE xp SET score = ${scoreBefore + score} WHERE userID LIKE ${userID}`);
      }
    });
  },

  /**
  * Increase the thank you count by 1 for the member
  * @param db The database of the guild
  * @param userID The id of the member to update
  */
  updateThankyou: function(db, userID) {
    db.get(`SELECT * FROM xp WHERE userID LIKE ${userID}`, (err, row) => {
      if (err) throw err;

      if (!row) {
        db.run(`INSERT INTO xp (userID, thx) VALUES (${userID}, 1)`);
      } else {
        let thxBefore = row.thx;
        db.run(`UPDATE xp SET thx = ${thxBefore + 1} WHERE userID LIKE ${userID}`);
      }
    });
  },

  /**
  * Request the top ten members by score
  * @param db The database of the guild
  * @returns [rows]
  */
  getTopTen: function(db) {
    return new Promise(function (resolve, reject) {
      // db.all(`SELECT * FROM xp ORDER BY score DESC LIMIT 10`, (err, rows) => {
      db.all(`SELECT userID, score, (
                SELECT COUNT(DISTINCT score) + 1
                FROM xp
                WHERE score > outertable.score
                ORDER BY score ASC
              ) AS rank
              FROM xp as outertable
              ORDER BY score DESC
              LIMIT 10;`, (err, rows) => {
        if (err) reject(err);
        
        resolve(rows);
      });
    });
  },

  /**
  * Request the xp stats for the guild member
  * @param db The database of the guild
  * @param userID The id of the member
  * @returns Promise rankinfo [rank, maxrank, thx, score]
  */
  getRankInfo: function(db, userID) {
    return new Promise(function (resolve, reject) {
      var rankinfo = {};

      const promises = [
        // request score and thx for the userID
        new Promise(function(resolve, reject) {
          db.get(`SELECT * FROM xp WHERE userID LIKE ${userID}`, (err, row) => {
          if (err) reject(err);
          if (row == null) return resolve(false);

          rankinfo['thx'] = row.thx ? row.thx : 0;
          rankinfo['score'] = row.score;
          resolve(rankinfo);
        })}),

        new Promise(function(resolve, reject) {
          db.get(`SELECT COUNT(DISTINCT score) AS maxrank FROM xp`, (err, row) => {
          if (err) reject(err);
          if (!row) reject(false);

          rankinfo['maxrank'] = row.maxrank;
          resolve(rankinfo);
        })}),

        new Promise(function(resolve, reject) {
          db.get(`SELECT score, (
                    SELECT COUNT(DISTINCT score) + 1
                    FROM xp
                    WHERE score > outertable.score
                    ORDER BY score ASC
                  ) AS rank
                  FROM xp as outertable
                  WHERE userID LIKE ${userID};`, (err, row) => {

          if (err) reject(err);
          if (row == null) return resolve(false);

          rankinfo['rank'] = row.rank;
          resolve(rankinfo);
        })})
      ];

      Promise.all(promises).then(() => resolve(rankinfo)).catch(err => reject(err));
    });
  },
}
