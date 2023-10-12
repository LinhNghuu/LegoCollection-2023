const setData = require('../data/setData');
const themeData = require('../data/themeData');

let sets = [];

function initialize() {
  return new Promise((resolve, reject) => {
    try {
      setData.forEach((set) => {
        let themeObj = themeData.find((theme) => theme.id === set.theme_id);
        if (themeObj) {
          set.theme = themeObj.name;
          sets.push(set);
        }
      });
      resolve();
    } catch (error) {
      reject('Initialization failed');
    }
  });
}

function getAllSets() {
  return new Promise((resolve) => {
    resolve(sets);
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    const set = sets.find((set) => set.set_num === setNum);
    if (set) {
      resolve(set);
    } else {
      reject(`Unable to find requested set: ${setNum}`);
    }
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    const filteredSets = sets.filter((set) =>
      set.theme.toLowerCase().includes(theme.toLowerCase())
    );
    if (filteredSets.length > 0) {
      resolve(filteredSets);
    } else {
      reject(`Unable to find requested sets with theme: ${theme}`);
    }
  });
}

// Export the functions
module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
};

// Testing the functions
initialize()
  .then(() => {
    // console.log('Initialization successful');
    return getAllSets();
  })
  .then((allSets) => {
    // console.log('All Sets:', allSets);
    return getSetByNum('001-1');
  })
  .then((set) => {
    // console.log('Set by Num:', set);
    return getSetsByTheme('Technic');
  })
  .then((setsByTheme) => {
    // console.log('Sets by Theme:', setsByTheme);
  })
  .catch((error) => {
    console.error(error);
  });
