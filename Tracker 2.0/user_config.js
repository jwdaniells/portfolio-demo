// user_config.js - Default configuration for new users
// Edit these values or use the Config Editor (config.html) to set up your tracker

window.USER_CONFIG = {
  "github": {
    "owner": "",
    "repo": ""
  },
  "people": {
    "person1": {
      "name": "",
      "dob": ""
    },
    "person2": {
      "name": "",
      "dob": ""
    },
    "hasPerson2": false
  },
  "accounts": [],
  "holdings": [],
  "goal": {
    "target": 0,
    "baseline": 0,
    "baselineDate": "",
    "monthlyContrib": 0,
    "rateRequired": 0.07,
    "rateProjected": 0.10,
    "rateBear": 0.05,
    "rateBull": 0.15
  },
  "retirement": {
    "retireYear": 2035,
    "person1": { "sipp": 0, "isa": 0, "workplace": 0, "spAge": 67 },
    "person2": { "sipp": 0, "isa": 0, "workplace": 0, "spAge": 67, "partTimeIncome": 0 },
    "lsegPension": 0,
    "monthlyContrib": 0,
    "contribGrowth": 0.05,
    "dbPensions": [],
    "statePension": 11502,
    "mortgageBalance": 0,
    "mortgageClearAge": 67,
    "mortgageAnnualCost": 0,
    "usePclsForMortgage": false,
    "targetNetIncome": 0,
    "inflationRate": 0.025,
    "scenarioBear": 0.03,
    "scenarioCentral": 0.05,
    "scenarioBull": 0.07,
    "planToAge": 95,
    "houseValue": 0,
    "houseGrowthRate": 0.03,
    "ihtNrb": 325000,
    "ihtRnrb": 175000,
    "ihtRate": 0.40,
    "ihtRnrbTaperStart": 2000000
  }
};
