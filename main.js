import "xterm/css/xterm.css";
import "./style.css";

import { WebContainer } from "@webcontainer/api";
import { Terminal } from "xterm";
import { SerializeAddon } from "./serialize-addon";

async function startShell() {
  const shellProcess = await webcontainerInstance.spawn("jsh");

  document.querySelector("#app").style.opacity = 1;

  shellProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    })
  );

  const input = shellProcess.input.getWriter();
  terminal.onData((data) => {
    input.write(data);
  });

  terminal.onSelectionChange(() => {
    updateButtonText();
  });

  return shellProcess;
}

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;

/** @type {HTMLTextAreaElement | null} */
const terminalEl = document.querySelector(".terminal");

/** @type {SerializeAddon} */
let serializeAddon;

/** @type {Terminal} */
let terminal;

const copyButton = document.querySelector("button");

window.addEventListener("load", async () => {
  terminal = new Terminal({
    convertEol: true,
    cols: 80,
    cursorBlink: true,
    allowProposedApi: true,
    fontFamily: "Fira Code, monospace",
    theme: {
      background: "#0d1117",
      foreground: "#c9d1d9",
      white: "#b1bac4",
      green: "#3fb950",
      yellow: "#d29922",
      blue: "#58a6ff",
      magenta: "#bc8cff",
      cyan: "#39c5cf",
      red: "#ff7b72",
      black: "#484f58",
      brightWhite: "#f0f6fc",
      brightBlack: "#6e7681",
      brightRed: "#ffa198",
      brightGreen: "#56d364",
      brightYellow: "#e3b341",
      brightBlue: "#79c0ff",
      brightMagenta: "#d2a8ff",
      brightCyan: "#56d4dd",
      cursor: "#abb2bf",
      cursorAccent: "#abb2bf",
    },
  });
  serializeAddon = new SerializeAddon();
  terminal.loadAddon(serializeAddon);
  terminal.open(terminalEl);

  // Call only once
  webcontainerInstance = await WebContainer.boot();

  startShell();

  copyButton.addEventListener("click", handleButtonClick);
});

function handleButtonClick() {
  const content = serializeAddon.serialize();
  navigator.clipboard.writeText(content);
  copyButton.textContent = "Copied!";
  setTimeout(() => {
    updateButtonText();
  }, 1000);
}

function updateButtonText() {
  const position = terminal.getSelectionPosition();
  copyButton.textContent = position ? "Copy selection" : "Copy all";
}
