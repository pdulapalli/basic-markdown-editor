export interface TextFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize?: number;
}

export interface FormattedChar {
  char: string;
  format: TextFormat;
}

export const DEFAULT_FORMAT: TextFormat = {
  bold: false,
  italic: false,
  underline: false,
  fontSize: 14
};

export class FormattedText {
  private chars: FormattedChar[] = [];

  constructor(text: string = '', format: TextFormat = DEFAULT_FORMAT) {
    this.chars = text.split('').map(char => ({
      char,
      format: { ...format }
    }));
  }

  get length(): number {
    return this.chars.length;
  }

  toString(): string {
    return this.chars.map(c => c.char).join('');
  }

  insertText(position: number, text: string, format: TextFormat = DEFAULT_FORMAT): void {
    const newChars = text.split('').map(char => ({
      char,
      format: { ...format }
    }));
    
    this.chars.splice(position, 0, ...newChars);
  }

  deleteText(startPosition: number, endPosition: number): FormattedChar[] {
    return this.chars.splice(startPosition, endPosition - startPosition);
  }

  getFormatting(startPosition: number, endPosition: number): TextFormat[] {
    return this.chars
      .slice(startPosition, endPosition)
      .map(c => ({ ...c.format }));
  }

  applyFormatting(startPosition: number, endPosition: number, format: Partial<TextFormat>): TextFormat[] {
    const oldFormats: TextFormat[] = [];
    
    for (let i = startPosition; i < endPosition && i < this.chars.length; i++) {
      oldFormats.push({ ...this.chars[i].format });
      this.chars[i].format = { ...this.chars[i].format, ...format };
    }
    
    return oldFormats;
  }

  restoreFormatting(startPosition: number, formats: TextFormat[]): void {
    for (let i = 0; i < formats.length && startPosition + i < this.chars.length; i++) {
      this.chars[startPosition + i].format = { ...formats[i] };
    }
  }

  getChar(position: number): FormattedChar | undefined {
    return this.chars[position] ? { ...this.chars[position] } : undefined;
  }

  slice(start: number, end?: number): FormattedChar[] {
    return this.chars.slice(start, end).map(c => ({ ...c }));
  }
}