"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.editNote = exports.viewNote = exports.queryNotes = exports.createNote = exports.listNotes = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const childprocess = __importStar(require("child_process"));
const notesDir = path.resolve(__dirname, "../notes/");
if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir);
}
const isCommandAvailable = (cmd) => {
    try {
        childprocess.execSync(`command -v ${cmd}`, { stdio: "ignore" });
        return true;
    }
    catch (error) {
        return false;
    }
};
const fallBackSearch = (query) => {
    const files = fs.readdirSync(`${notesDir}`);
    let matchFound = false;
    files.forEach((file) => {
        if (path.extname(file) != ".md")
            return;
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
const listNotes = () => {
    const files = fs.readdirSync(notesDir);
    if (files.length === 0) {
        console.log("No notes found.");
    }
    else {
        console.log("Notes:");
        files.forEach((file, index) => console.log(`${index + 1}. ${path.basename(file, `.md`)}`));
    }
};
exports.listNotes = listNotes;
const createNote = (title) => {
    const filePath = path.join(notesDir, `${title}.md`);
    if (fs.existsSync(filePath)) {
        console.error("A note with this title alread exists.");
        return;
    }
    fs.writeFileSync(filePath, `# ${title}\n\n`, "utf8");
    console.log(`Note "${title}" created.`);
};
exports.createNote = createNote;
const queryNotes = (query) => {
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
        }
        catch (error) {
            console.error("No matching notes found.");
        }
    }
    else if (searchTool === "grep") {
        try {
            childprocess.execSync(`grep -rn "${query}" "${notesDir}"`, {
                stdio: "inherit",
            });
        }
        catch (error) {
            console.error("No matching notes found.");
        }
    }
    else {
        fallBackSearch(query);
    }
};
exports.queryNotes = queryNotes;
const viewNote = (title) => {
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
        }
        catch (error) {
            console.error(`Failed to view the note. Ensure ${viewer} is installed.`);
        }
    }
    console.log(`--- Content of "${title}.md" ---\n`);
    const content = fs.readFileSync(filePath, "utf-8");
    console.log(content);
    console.log(`\n--- End of "${title}.md" ---`);
};
exports.viewNote = viewNote;
const editNote = (title, editor) => {
    const filePath = path.join(notesDir, `${title}.md`);
    if (!fs.existsSync(filePath)) {
        console.error(`Note "${title}" does not exist. \nCreating a new note ... `);
        fs.writeFileSync(filePath, "");
    }
    const chosenEditor = editor || process.env.EDITOR || "nano";
    try {
        childprocess.spawnSync(chosenEditor, [filePath], { stdio: "inherit" });
        console.log(`Successfully edited "${title}.md"`);
    }
    catch (error) {
        console.error(`Failed to edit the note. Ensure your editor (${chosenEditor}) is installed`);
    }
};
exports.editNote = editNote;
const deleteNote = (title) => {
    const filePath = path.join(notesDir, `${title}.md`);
    if (!fs.existsSync(filePath)) {
        console.error(`Note ${title} does not exist`);
        return;
    }
    fs.unlinkSync(filePath);
    console.log(`Note ${title} has been deleted`);
};
exports.deleteNote = deleteNote;
