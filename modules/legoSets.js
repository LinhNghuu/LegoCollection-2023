/*
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
 */
require('dotenv').config();
const Sequelize = require('sequelize');

// Create a new Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
);

// Define the Theme model
const Theme = sequelize.define(
  'Theme',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);

// Define the Set model
const Set = sequelize.define(
  'Set',
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);

// Associate the models
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
  return sequelize.sync().catch((err) => {
    throw err;
  });
}

function getAllSets() {
  return Set.findAll({ include: [Theme] });
}

function getSetByNum(setNum) {
  return Set.findAll({
    include: [Theme],
    where: { set_num: setNum },
  }).then((sets) => {
    if (sets.length > 0) return sets[0];
    else throw new Error('Unable to find requested set');
  });
}

function getSetsByTheme(theme) {
  return Set.findAll({
    include: [Theme],
    where: {
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`,
      },
    },
  }).then((sets) => {
    if (sets.length > 0) return sets;
    else throw new Error('Unable to find requested sets');
  });
}

// Add a new set
function addSet(setData) {
  return Set.create(setData).catch((err) => {
    throw new Error(err.errors[0].message);
  });
}
//Add the editSet
function editSet(set_num, setData) {
  return new Promise((resolve, reject) => {
    Set.update(setData, { where: { set_num } })
      .then(() => resolve())
      .catch((err) => reject(err.errors[0].message));
  });
}
// Get all themes
function getAllThemes() {
  return Theme.findAll();
}
module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  editSet,
  getAllThemes
};

/*
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

  */
