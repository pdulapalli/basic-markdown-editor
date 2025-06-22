import type { Command } from './commands';
import type { EditorState } from './editor-state';
import type { TextFormat } from './text-formatting';

export class BoldFormatCommand implements Command {
  private oldFormats: TextFormat[] = [];
  private wasBold: boolean = false;

  constructor(
    private editorState: EditorState,
    private startPosition: number,
    private endPosition: number
  ) {}

  execute(): void {
    // Check if the selection is already bold
    const currentFormats = this.editorState.getFormatting(this.startPosition, this.endPosition);
    this.wasBold = currentFormats.length > 0 && currentFormats.every(f => f.bold);
    
    // Toggle bold: if all text is bold, remove bold; otherwise, apply bold
    const newBoldState = !this.wasBold;
    this.oldFormats = this.editorState.applyFormatting(
      this.startPosition, 
      this.endPosition, 
      { bold: newBoldState }
    );
  }

  undo(): void {
    this.editorState.restoreFormatting(this.startPosition, this.oldFormats);
  }

  getDescription(): string {
    return `Toggle bold (${this.startPosition}-${this.endPosition})`;
  }
}

export class ItalicFormatCommand implements Command {
  private oldFormats: TextFormat[] = [];
  private wasItalic: boolean = false;

  constructor(
    private editorState: EditorState,
    private startPosition: number,
    private endPosition: number
  ) {}

  execute(): void {
    const currentFormats = this.editorState.getFormatting(this.startPosition, this.endPosition);
    this.wasItalic = currentFormats.length > 0 && currentFormats.every(f => f.italic);
    
    const newItalicState = !this.wasItalic;
    this.oldFormats = this.editorState.applyFormatting(
      this.startPosition, 
      this.endPosition, 
      { italic: newItalicState }
    );
  }

  undo(): void {
    this.editorState.restoreFormatting(this.startPosition, this.oldFormats);
  }

  getDescription(): string {
    return `Toggle italic (${this.startPosition}-${this.endPosition})`;
  }
}

export class UnderlineFormatCommand implements Command {
  private oldFormats: TextFormat[] = [];
  private wasUnderlined: boolean = false;

  constructor(
    private editorState: EditorState,
    private startPosition: number,
    private endPosition: number
  ) {}

  execute(): void {
    const currentFormats = this.editorState.getFormatting(this.startPosition, this.endPosition);
    this.wasUnderlined = currentFormats.length > 0 && currentFormats.every(f => f.underline);
    
    const newUnderlineState = !this.wasUnderlined;
    this.oldFormats = this.editorState.applyFormatting(
      this.startPosition, 
      this.endPosition, 
      { underline: newUnderlineState }
    );
  }

  undo(): void {
    this.editorState.restoreFormatting(this.startPosition, this.oldFormats);
  }

  getDescription(): string {
    return `Toggle underline (${this.startPosition}-${this.endPosition})`;
  }
}

export class FontSizeFormatCommand implements Command {
  private oldFormats: TextFormat[] = [];

  constructor(
    private editorState: EditorState,
    private startPosition: number,
    private endPosition: number,
    private fontSize: number
  ) {}

  execute(): void {
    this.oldFormats = this.editorState.applyFormatting(
      this.startPosition, 
      this.endPosition, 
      { fontSize: this.fontSize }
    );
  }

  undo(): void {
    this.editorState.restoreFormatting(this.startPosition, this.oldFormats);
  }

  getDescription(): string {
    return `Set font size to ${this.fontSize}px (${this.startPosition}-${this.endPosition})`;
  }
}