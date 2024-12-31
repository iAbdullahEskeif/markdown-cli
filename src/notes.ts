import * as fs from "fs";
import * as path from "path";
import * as childprocess from "child_process";

const notesDir = path.resolve(__dirname, "../notes/");

if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir);
}

const isCommandAvailable = (cmd: string): boolean => {
  try {
    childprocess.execSync(`command -v ${cmd}`, { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
};
const fallBackSearch = (query: string) => {
  const files = fs.readdirSync(`${notesDir}`);
  let matchFound = false;
  files.forEach((file) => {
    if (path.extname(file) != ".md") return;

    const filePath = path.join(notesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      if (line.includes(query)) {
        if (!matchFound) {
          console.log("Match Found \n");
          matchFound = true;
        }
        console.log(`${file}:${index + 1}: ${line.trim()}`);
      }
    });
  });
  if (!matchFound) {
    console.log("No matching notes found.");
  }
};

export const listNotes = () => {
  const files = fs.readdirSync(notesDir);
  if (files.length === 0) {
    console.log("No notes found.");
  } else {
    console.log("Notes:");
    files.forEach((file, index) =>
      console.log(`${index + 1}. ${path.basename(file, `.md`)}`),
    );
  }
};
export const createNote = (title: string) => {
  const filePath = path.join(notesDir, `${title}.md`);
  if (fs.existsSync(filePath)) {
    console.error("A note with this title alread exists.");
    return;
  }
  fs.writeFileSync(filePath, `# ${title}\n\n`, "utf8");
  console.log(`Note "${title}" created.`);
};

export const queryNotes = (query: string) => {
  const searchTool = isCommandAvailable("rg")
    ? "rg"
    : isCommandAvailable("grep")
      ? "grep"
      : "builtin";
  if (searchTool === "rg") {
    try {
      childprocess.execSync(`rg "${query}" "${notesDir}"`, {
        stdio: "inherit",
      });
    } catch (error) {
      console.error("No matching notes found.");
    }
  } else if (searchTool === "grep") {
    try {
      childprocess.execSync(`grep -rn "${query}" "${notesDir}"`, {
        stdio: "inherit",
      });
    } catch (error) {
      console.error("No matching notes found.");
    }
  } else {
    fallBackSearch(query);
  }
};

export const viewNote = (title: string) => {
  const filePath = path.join(notesDir, `${title}.md`);

  if (!fs.existsSync(filePath)) {
    console.error(`Note "${title}" does not exist.`);
    return;
  }
  const viewer = isCommandAvailable("bat")
    ? "bat"
    : isCommandAvailable("cat")
      ? "cat"
      : null;
  if (viewer) {
    try {
      childprocess.execSync(`${viewer} "${filePath}"`, { stdio: "inherit" });
      return;
    } catch (error) {
      console.error(`Failed to view the note. Ensure ${viewer} is installed.`);
    }
  }
  console.log(`--- Content of "${title}.md" ---\n`);
  const content = fs.readFileSync(filePath, "utf-8");
  console.log(content);
  console.log(`\n--- End of "${title}.md" ---`);
};

export const editNote = (title: string, editor?: string) => {
  const filePath = path.join(notesDir, `${title}.md`);

  if (!fs.existsSync(filePath)) {
    console.error(`Note "${title}" does not exist. \nCreating a new note ... `);
    fs.writeFileSync(filePath, "");
  }
  const chosenEditor = editor || process.env.EDITOR || "nano";
  try {
    childprocess.spawnSync(chosenEditor, [filePath], { stdio: "inherit" });
    console.log(`Successfully edited "${title}.md"`);
  } catch (error) {
    console.error(
      `Failed to edit the note. Ensure your editor (${chosenEditor}) is installed`,
    );
  }
};

export const deleteNote = (title: string) => {
  const filePath = path.join(notesDir, `${title}.md`);
  if (!fs.existsSync(filePath)) {
    console.error(`Note ${title} does not exist`);
    return;
  }
  fs.unlinkSync(filePath);
  console.log(`Note ${title} has been deleted`);
};
