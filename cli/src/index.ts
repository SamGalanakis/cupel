#!/usr/bin/env node
import { VERSION } from "../../engine/dist/index.js";
import { cmdInit, cmdStamp, cmdWhere } from "./office.js";
import { cmdDoctor } from "./doctor.js";
import { cmdPortfolio } from "./portfolio.js";
import { cmdShow } from "./show.js";
import { runSkills } from "./skills.js";

function cmdHelp(): number {
  console.log(`cupel — your clanker as an investing analyst

Usage:
  cupel init                       Create your office (defaults to ~/cupel; set CUPEL_HOME to override)
  cupel where                      Print the office path
  cupel show <ticker>              Print every office note for a ticker (where were we?)
  cupel portfolio                  Sum positions: sizing vs mandate cap, total vs satellite target
  cupel doctor                     Check the office for inconsistencies (schema, links, mandate, staleness)
  cupel stamp <event>              Record that an event happened now (e.g. cupel stamp pulse)
  cupel skills <subcommand>        Install or update the skill in your AI harness
  cupel version
  cupel help

Most of cupel lives inside your AI harness. After installing the skill, talk to
it with \`/cupel\` — it reads and writes your office (edges, sources, watchlist,
theses, positions, decision journal).

Install once globally:
  npm install -g cupel
  cupel init
  cd your-project && cupel skills install

Discipline only: cupel sharpens your own reasoning. It does not predict prices,
place trades, or give buy/sell calls.
`);
  return 0;
}

const [, , command = "help", ...rest] = process.argv;
let exit = 0;
switch (command) {
  case "init":
    exit = cmdInit();
    break;
  case "where":
    exit = cmdWhere();
    break;
  case "show":
    exit = cmdShow(rest);
    break;
  case "portfolio":
    exit = cmdPortfolio();
    break;
  case "doctor":
    exit = cmdDoctor();
    break;
  case "stamp":
    exit = cmdStamp(rest);
    break;
  case "skills":
    exit = await runSkills(rest);
    break;
  case "version":
  case "-v":
  case "--version":
    console.log(VERSION);
    break;
  case "help":
  case "-h":
  case "--help":
    exit = cmdHelp();
    break;
  default:
    console.error(`unknown command: ${command}`);
    cmdHelp();
    exit = 2;
}
process.exit(exit);
