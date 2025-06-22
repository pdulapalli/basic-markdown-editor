import type { Command } from './commands';
import type { EditorState } from './editor-state';

export class MarkdownBoldCommand implements Command {
  private originalText: string;
  private wasFormatted: boolean = false;
  private originalCursorPosition: number;

  constructor(
    private editorState: EditorState,
    private startPosition: number,
    private endPosition: number
  ) {
    this.originalText = editorState.getContent().slice(startPosition, endPosition);
    this.originalCursorPosition = editorState.getCursorPosition();
  }

  execute(): void {
    const content = this.editorState.getContent();
    const selectedText = content.slice(this.startPosition, this.endPosition);
    
    // Check if text is already bold (wrapped with **)
    this.wasFormatted = selectedText.startsWith('**') && selectedText.endsWith('**') && selectedText.length > 4;
    
    if (this.wasFormatted) {
      // Remove bold formatting
      const unwrappedText = selectedText.slice(2, -2);
      this.editorState.deleteText(this.startPosition, this.endPosition);
      this.editorState.insertText(this.startPosition, unwrappedText);
      this.editorState.setCursorPosition(this.startPosition + unwrappedText.length);
    } else {
      // Add bold formatting
      const wrappedText = `**${selectedText}**`;
      this.editorState.deleteText(this.startPosition, this.endPosition);
      this.editorState.insertText(this.startPosition, wrappedText);
      this.editorState.setCursorPosition(this.startPosition + wrappedText.length);
    }
  }

  undo(): void {
    // Restore original text
    const currentContent = this.editorState.getContent();
    const currentText = this.wasFormatted 
      ? this.originalText.slice(2, -2)  // Was formatted, now unformatted
      : `**${this.originalText}**`;     // Was unformatted, now formatted
    
    const currentLength = currentText.length;
    this.editorState.deleteText(this.startPosition, this.startPosition + currentLength);
    this.editorState.insertText(this.startPosition, this.originalText);
    this.editorState.setCursorPosition(this.originalCursorPosition);
  }

  getDescription(): string {
    return this.wasFormatted ? 'Remove bold formatting' : 'Add bold formatting';
  }
}

export class MarkdownItalicCommand implements Command {
  private originalText: string;
  private wasFormatted: boolean = false;
  private originalCursorPosition: number;

  constructor(
    private editorState: EditorState,
    private startPosition: number,
    private endPosition: number
  ) {
    this.originalText = editorState.getContent().slice(startPosition, endPosition);
    this.originalCursorPosition = editorState.getCursorPosition();
  }

  execute(): void {
    const content = this.editorState.getContent();
    const selectedText = content.slice(this.startPosition, this.endPosition);
    
    // Check if text is already italic (wrapped with single *)
    // But avoid matching bold (**text**)
    this.wasFormatted = selectedText.startsWith('*') && selectedText.endsWith('*') && 
                      selectedText.length > 2 && 
                      !selectedText.startsWith('**');
    
    if (this.wasFormatted) {
      // Remove italic formatting
      const unwrappedText = selectedText.slice(1, -1);
      this.editorState.deleteText(this.startPosition, this.endPosition);
      this.editorState.insertText(this.startPosition, unwrappedText);
      this.editorState.setCursorPosition(this.startPosition + unwrappedText.length);
    } else {
      // Add italic formatting
      const wrappedText = `*${selectedText}*`;
      this.editorState.deleteText(this.startPosition, this.endPosition);
      this.editorState.insertText(this.startPosition, wrappedText);
      this.editorState.setCursorPosition(this.startPosition + wrappedText.length);
    }
  }

  undo(): void {
    // Restore original text
    const currentContent = this.editorState.getContent();
    const currentText = this.wasFormatted 
      ? this.originalText.slice(1, -1)  // Was formatted, now unformatted
      : `*${this.originalText}*`;       // Was unformatted, now formatted
    
    const currentLength = currentText.length;
    this.editorState.deleteText(this.startPosition, this.startPosition + currentLength);
    this.editorState.insertText(this.startPosition, this.originalText);
    this.editorState.setCursorPosition(this.originalCursorPosition);
  }

  getDescription(): string {
    return this.wasFormatted ? 'Remove italic formatting' : 'Add italic formatting';
  }
}