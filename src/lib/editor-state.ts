import { writable, type Writable } from 'svelte/store';
import { FormattedText, type TextFormat, DEFAULT_FORMAT } from './text-formatting';

export class EditorState {
  public content: Writable<string>;
  public cursorPosition: Writable<number>;
  private formattedText: FormattedText;

  constructor() {
    this.formattedText = new FormattedText();
    this.content = writable('');
    this.cursorPosition = writable(0);
  }

  insertText(position: number, text: string, format: TextFormat = DEFAULT_FORMAT): void {
    this.formattedText.insertText(position, text, format);
    this.content.set(this.formattedText.toString());
    this.cursorPosition.set(position + text.length);
  }

  deleteText(startPosition: number, endPosition: number): void {
    this.formattedText.deleteText(startPosition, endPosition);
    this.content.set(this.formattedText.toString());
    this.cursorPosition.set(startPosition);
  }

  setCursorPosition(position: number): void {
    this.cursorPosition.set(position);
  }

  getContent(): string {
    return this.formattedText.toString();
  }

  getCursorPosition(): number {
    let position = 0;
    this.cursorPosition.subscribe(value => position = value)();
    return position;
  }

  getFormatting(startPosition: number, endPosition: number): TextFormat[] {
    return this.formattedText.getFormatting(startPosition, endPosition);
  }

  applyFormatting(startPosition: number, endPosition: number, format: Partial<TextFormat>): TextFormat[] {
    const oldFormats = this.formattedText.applyFormatting(startPosition, endPosition, format);
    this.content.set(this.formattedText.toString());
    return oldFormats;
  }

  restoreFormatting(startPosition: number, formats: TextFormat[]): void {
    this.formattedText.restoreFormatting(startPosition, formats);
    this.content.set(this.formattedText.toString());
  }

  getFormattedText(): FormattedText {
    return this.formattedText;
  }

  setContent(content: string): void {
    this.formattedText = new FormattedText();
    this.formattedText.insertText(0, content);
    this.content.set(content);
    this.cursorPosition.set(0);
  }
}