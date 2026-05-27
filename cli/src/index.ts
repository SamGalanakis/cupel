#!/usr/bin/env node
import { VERSION } from "../../engine/dist/index.js";
import { cmdCapital, cmdInit, cmdStamp, cmdWhere } from "./office.js";
import { cmdDoctor } from "./doctor.js";
import { cmdPortfolio } from "./portfolio.js";
import { cmdBoard } from "./board.js";
import { cmdShow } from "./show.js";
import { cmdTickers } from "./tickers.js";
import { runSkills } from "./skills.js";

function cmdHelp(): number {
  console.log(`cupel — your clanker as an investing analyst

Usage:
  Office
    cupel init                     Create your office (defaults to ~/cupel; set CUPEL_HOME to override)
    cupel where                    Print the office path
    cupel doctor                   Check for inconsistencies (schema, links, mandate, stale reviews/figures)
    cupel stamp <event>            Record that an event happened now (e.g. cupel stamp pulse)
  Review
    cupel show <ticker>            Print every office note for a ticker (where were we?)
    cupel board [A|B|C|PASS]       The whole watchlist, ranked by tier
    cupel portfolio                What you hold: core / satellite / cash, sizing + gain vs the mandate
    cupel capital [amount [ccy]]   Set/show total investable capital (lets portfolio show money)
    cupel tickers                  List every ticker the office knows (feeds scout dedupe)
  Setup
    cupel skills <subcommand>      Install or update the skill in your AI harness
    cupel version  ·  cupel help

Most of cupel lives inside your AI harness. After installing the skill, talk to
it with \`/cupel\` — it reads and writes your office (edges, sources, watchlist,
theses, positions, decision journal).

Install once globally:
  npm install -g @samgalanakis/cupel
  cupel init
  cd your-project && cupel skills install

cupel gives reasoned, mandate-grounded calls — likely scenarios, rough upside and
timeframe, and the risks named. It refuses false precision and bare tips with no
reasoning, and never places trades.
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
  case "board":
    exit = cmdBoard(rest);
    break;
  case "tickers":
    exit = cmdTickers();
    break;
  case "doctor":
    exit = cmdDoctor();
    break;
  case "stamp":
    exit = cmdStamp(rest);
    break;
  case "capital":
    exit = cmdCapital(rest);
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
