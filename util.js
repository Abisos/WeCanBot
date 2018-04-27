module.exports = {
  // returns the display name of the given user from given guild
  getDisplayName: function(guild, user) {
    return new Promise(function (resolve,  reject) {
      guild.fetchMember(user)
        .then((m) => {
          return resolve(m.displayName);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },
}
