import type { Command } from './commands';
import type { EditorState } from './editor-state';

export class InsertTextCommand implements Command {
  private originalCursorPosition: number;

  constructor(
    private editorState: EditorState,
    private position: number,
    private text: string
  ) {
    this.originalCursorPosition = editorState.getCursorPosition();
  }

  execute(): void {
    this.editorState.insertText(this.position, this.text);
  }

  undo(): void {
    this.editorState.deleteText(this.position, this.position + this.text.length);
    this.editorState.setCursorPosition(this.originalCursorPosition);
  }

  getDescription(): string {
    return `Insert "${this.text}"`;
  }
}

export class DeleteTextCommand implements Command {
  private deletedText: string;
  private originalCursorPosition: number;

  constructor(
    private editorState: EditorState,
    private startPosition: number,
    private endPosition: number
  ) {
    this.originalCursorPosition = editorState.getCursorPosition();
    this.deletedText = editorState.getContent().slice(startPosition, endPosition);
  }

  execute(): void {
    this.editorState.deleteText(this.startPosition, this.endPosition);
  }

  undo(): void {
    this.editorState.insertText(this.startPosition, this.deletedText);
    this.editorState.setCursorPosition(this.originalCursorPosition);
  }

  getDescription(): string {
    return `Delete "${this.deletedText}"`;
  }
}