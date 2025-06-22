import { describe, it, expect, beforeEach } from 'vitest';
import { BoldFormatCommand, ItalicFormatCommand, UnderlineFormatCommand } from './formatting-commands';
import { EditorState } from './editor-state';
import { get } from 'svelte/store';

describe('BoldFormatCommand', () => {
  let editorState: EditorState;

  beforeEach(() => {
    editorState = new EditorState();
  });

  it('should apply bold formatting to selected text', () => {
    editorState.insertText(0, 'Hello World');
    const command = new BoldFormatCommand(editorState, 0, 5); // "Hello"
    
    command.execute();
    
    const formatting = editorState.getFormatting(0, 5);
    expect(formatting.every(f => f.bold)).toBe(true);
  });

  it('should remove bold formatting from already bold text', () => {
    editorState.insertText(0, 'Hello World');
    
    // Apply bold first
    const applyCommand = new BoldFormatCommand(editorState, 0, 5);
    applyCommand.execute();
    
    // Apply bold again to toggle off
    const removeCommand = new BoldFormatCommand(editorState, 0, 5);
    removeCommand.execute();
    
    const formatting = editorState.getFormatting(0, 5);
    expect(formatting.every(f => !f.bold)).toBe(true);
  });

  it('should undo bold formatting correctly', () => {
    editorState.insertText(0, 'Hello World');
    const command = new BoldFormatCommand(editorState, 0, 5);
    
    command.execute();
    command.undo();
    
    const formatting = editorState.getFormatting(0, 5);
    expect(formatting.every(f => !f.bold)).toBe(true);
  });

  it('should provide correct description', () => {
    const command = new BoldFormatCommand(editorState, 0, 5);
    expect(command.getDescription()).toBe('Toggle bold (0-5)');
  });

  it('should handle mixed bold/non-bold selection by applying bold to all', () => {
    editorState.insertText(0, 'Hello World');
    
    // Make "Hello" bold
    const partialCommand = new BoldFormatCommand(editorState, 0, 5);
    partialCommand.execute();
    
    // Apply bold to entire text (should make "World" bold too)
    const fullCommand = new BoldFormatCommand(editorState, 0, 11);
    fullCommand.execute();
    
    const formatting = editorState.getFormatting(0, 11);
    expect(formatting.every(f => f.bold)).toBe(true);
  });
});

describe('ItalicFormatCommand', () => {
  let editorState: EditorState;

  beforeEach(() => {
    editorState = new EditorState();
  });

  it('should apply italic formatting to selected text', () => {
    editorState.insertText(0, 'Hello World');
    const command = new ItalicFormatCommand(editorState, 0, 5);
    
    command.execute();
    
    const formatting = editorState.getFormatting(0, 5);
    expect(formatting.every(f => f.italic)).toBe(true);
  });

  it('should remove italic formatting from already italic text', () => {
    editorState.insertText(0, 'Hello World');
    
    const applyCommand = new ItalicFormatCommand(editorState, 0, 5);
    applyCommand.execute();
    
    const removeCommand = new ItalicFormatCommand(editorState, 0, 5);
    removeCommand.execute();
    
    const formatting = editorState.getFormatting(0, 5);
    expect(formatting.every(f => !f.italic)).toBe(true);
  });

  it('should provide correct description', () => {
    const command = new ItalicFormatCommand(editorState, 0, 5);
    expect(command.getDescription()).toBe('Toggle italic (0-5)');
  });
});

describe('UnderlineFormatCommand', () => {
  let editorState: EditorState;

  beforeEach(() => {
    editorState = new EditorState();
  });

  it('should apply underline formatting to selected text', () => {
    editorState.insertText(0, 'Hello World');
    const command = new UnderlineFormatCommand(editorState, 0, 5);
    
    command.execute();
    
    const formatting = editorState.getFormatting(0, 5);
    expect(formatting.every(f => f.underline)).toBe(true);
  });

  it('should remove underline formatting from already underlined text', () => {
    editorState.insertText(0, 'Hello World');
    
    const applyCommand = new UnderlineFormatCommand(editorState, 0, 5);
    applyCommand.execute();
    
    const removeCommand = new UnderlineFormatCommand(editorState, 0, 5);
    removeCommand.execute();
    
    const formatting = editorState.getFormatting(0, 5);
    expect(formatting.every(f => !f.underline)).toBe(true);
  });

  it('should provide correct description', () => {
    const command = new UnderlineFormatCommand(editorState, 0, 5);
    expect(command.getDescription()).toBe('Toggle underline (0-5)');
  });

  it('should work with combined formatting', () => {
    editorState.insertText(0, 'Hello World');
    
    // Apply bold first
    const boldCommand = new BoldFormatCommand(editorState, 0, 5);
    boldCommand.execute();
    
    // Then apply underline
    const underlineCommand = new UnderlineFormatCommand(editorState, 0, 5);
    underlineCommand.execute();
    
    const formatting = editorState.getFormatting(0, 5);
    expect(formatting.every(f => f.bold && f.underline)).toBe(true);
  });
});