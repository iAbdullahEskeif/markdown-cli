import {
  listNotes,
  createNote,
  deleteNote,
  queryNotes,
  viewNote,
  editNote,
} from "./notes";

const args = process.argv.slice(2); // Get CLI arguments

const command = args[0];

switch (command) {
  case "list":
    listNotes();
    break;
  case "create":
    const title = args[1];
    if (!title) {
      console.error("Please provide a title for the note.");
      process.exit(1);
    }
    createNote(title);
    break;
  case "search":
    const query = args[1];
    if (!query) {
      console.error("Please provide a search query.");
      process.exit(1);
    }
    queryNotes(query);
    break;
  case "view":
    const noteToView = args[1];
    if (!noteToView) {
      console.error("Please provide a search query.");
      process.exit(1);
    }
    viewNote(noteToView);
    break;

  case "edit":
    const editTitle = args[1];
    const editorFlagIndex = args.indexOf("--editor");
    const specifiedEditor =
      editorFlagIndex !== -1 ? args[editorFlagIndex + 1] : undefined;
    if (!editTitle) {
      console.log("please provide the title of the note to edit.");
      process.exit(1);
    }
    if (specifiedEditor && specifiedEditor.startsWith("--")) {
      console.error("Invalid editor specified. Use: --editor <editor-name>");
      process.exit(1);
    }
    editNote(editTitle, specifiedEditor);
    break;
  case "delete":
    const deletedTitle = args[1];
    if (!deletedTitle) {
      console.error("Please provide a title for the note.");
      process.exit(1);
    }
    deleteNote(deletedTitle);
    break;
  default:
    console.log("Commands:");
    console.log("  list       List all notes");
    console.log("  create     Create a new note");
    console.log("  query      query your notes");
    console.log("  view       view your note");
    console.log("  delete     deletes a note");
    break;
}
