import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";

import config from "./config";
import { createFiles, installDependencies } from "./start";

function init() {
  console.log(
    chalk.green(
      figlet.textSync("MERN Web3 Setup", {
        font: "slant",
        horizontalLayout: "default",
        veritcalLayout: "default",
      })
    )
  );
}

function askQuestions() {
  const questions = [
    {
      name: "projectName",
      type: "input",
      message: `Name of new project? (default: ${config.package.projectName})`,
      filter: function (val) {
        return val || config.package.projectName;
      }
    },
    {
      name: "includeFront",
      type: "list",
      message: "Include frontend (React) components?",
      choices: ["yes", "no"],
      filter: function (val) {
        return val === "yes";
      }
    },
    {
      name: "includeBack",
      type: "list",
      message: "Include backend (Node/Express) components?",
      choices: ["yes", "no"],
      filter: function (val) {
        return val === "yes";
      }
    },
  ];

  return inquirer.prompt(questions);
}

function frontPortQuestion() {
  const questions = [
    {
      name: "frontPort",
      type: "input",
      message: `Port for frontend Webpack server? (default: ${config.webpack.port})`,
      filter: function (val) {
        return val ? Number(val) : config.webpack.port;
      },
    },
  ];

  return inquirer.prompt(questions);
}

function backPortQuestion() {
  const questions = [
    {
      name: "backPort",
      type: "input",
      message: `Port for backend Express server? (default: ${config.express.port})`,
      filter: function (val) {
        return val ? Number(val) : config.express.port;
      },
    },
  ];

  return inquirer.prompt(questions);
}

async function run() {
  init();

  const firstAnswers = await askQuestions();
  const { projectName, includeFront, includeBack } = firstAnswers;
  const both = includeFront && includeBack;
  let frontPort = config.webpack.port;
  let backPort = config.express.port;

  if (!includeFront && !includeBack) {
    return;
  }

  if (includeFront) {
    const frontPortAnswer = await frontPortQuestion();
    frontPort = frontPortAnswer.frontPort;
  }
  if (includeBack) {
    const backPortAnswer = await backPortQuestion();
    backPort = backPortAnswer.backPort;
  }

  const inputs = {
    name: projectName || config.package.projectName,
    both,
    includeFront,
    includeBack,
    frontPort: frontPort || config.webpack.port,
    backPort: backPort || config.express.port,
  };

  console.log(chalk.white.bgGreen.bold("Starting MERN Setup\n"));

  createFiles(inputs);
  installDependencies(inputs);
}

run();
