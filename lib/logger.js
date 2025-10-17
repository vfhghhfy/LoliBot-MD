import chalk from "chalk";

const LogLevel = {
  ERROR: 0,
  COMMAND: 1,
  MESSAGE: 2
};

const CURRENT_LOG_LEVEL = LogLevel.COMMAND;

function formatBotLabel(conn) {
  const jidRaw = conn?.user?.id || "";
  const jidClean = jidRaw.replace(/:\d+/, "").split("@")[0];
  const name = conn?.user?.name?.trim() || jidClean;
  const isSubbot = globalThis.conns?.some(c => c.user?.id === conn?.user?.id);
  const label = `${chalk.yellowBright("+" + jidClean)} ${chalk.cyanBright("-")} ${chalk.bold(name)}${isSubbot ? chalk.magenta(" (بوت فرعي)") : ""}`;
  return label;
}

function logCommand({ conn, timestamp, sender, chatId, isGroup, command }) {
  if (CURRENT_LOG_LEVEL < LogLevel.COMMAND) return;
  const ts = new Date(timestamp || Date.now()).toLocaleString("es-AR");
  const botLabel = formatBotLabel(conn);

  console.log(
    chalk.bgBlue.white.bold(" [ أمر ] ") + " " + chalk.gray(botLabel) + "\n" +
  //chalk.green("التاريخ: ") + ts + "\n" +
    chalk.green("من: ") + sender + "\n" +
    chalk.green("الدردشة: ") + `${isGroup ? "مجموعة" : "خاص"}` + "\n" +
    chalk.green("الأمر: ") + `${chalk.whiteBright(command)}\n`
  );
}

function logMessage({ conn, timestamp, sender, chatId, isGroup, text }) {
  if (CURRENT_LOG_LEVEL < LogLevel.MESSAGE) return;
  const ts = new Date(timestamp || Date.now()).toLocaleString("es-AR");
  const botLabel = formatBotLabel(conn);

  console.log(
    chalk.bgGray.white.bold(" [ رسالة ] ") + " " + chalk.gray(botLabel) + "\n" +
  // chalk.green("التاريخ: ") + ts + "\n" +
    chalk.green("من: ") + sender + "\n" +
    chalk.green("الدردشة: ") + `${isGroup ? "مجموعة" : "خاص"}` + "\n" +
    chalk.green("الرسالة: ") + `${chalk.white(text)}\n`
  );
}

function logError(error) {
  console.error(chalk.bgRed.white.bold(" خطأ ") + " " + chalk.red(new Date().toISOString()), "\n", chalk.redBright(error));
}

export {
  LogLevel,
  CURRENT_LOG_LEVEL,
  logCommand,
  logMessage,
  logError
};
