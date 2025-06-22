import { describe, it, expect, beforeEach } from 'vitest';
import { InsertTextCommand, DeleteTextCommand } from './text-commands';
import { EditorState } from './editor-state';
import { get } from 'svelte/store';

describe('InsertTextCommand', () => {
  let editorState: EditorState;

  beforeEach(() => {
    editorState = new EditorState();
  });

  it('should insert text at specified position', () => {
    const command = new InsertTextCommand(editorState, 0, 'Hello');
    command.execute();

    expect(get(editorState.content)).toBe('Hello');
    expect(get(editorState.cursorPosition)).toBe(5);
  });

  it('should undo text insertion', () => {
    const command = new InsertTextCommand(editorState, 0, 'Hello');
    command.execute();
    command.undo();

    expect(get(editorState.content)).toBe('');
    expect(get(editorState.cursorPosition)).toBe(0);
  });

  it('should provide correct description', () => {
    const command = new InsertTextCommand(editorState, 0, 'Hello');
    expect(command.getDescription()).toBe('Insert "Hello"');
  });

  it('should handle insertion in middle of text', () => {
    editorState.insertText(0, 'Hello World');
    const command = new InsertTextCommand(editorState, 5, ', Beautiful');
    command.execute();

    expect(get(editorState.content)).toBe('Hello, Beautiful World');
    expect(get(editorState.cursorPosition)).toBe(16);
  });
});

describe('DeleteTextCommand', () => {
  let editorState: EditorState;

  beforeEach(() => {
    editorState = new EditorState();
    editorState.insertText(0, 'Hello World');
  });

  it('should delete text at specified range', () => {
    const command = new DeleteTextCommand(editorState, 5, 11);
    command.execute();

    expect(get(editorState.content)).toBe('Hello');
    expect(get(editorState.cursorPosition)).toBe(5);
  });

  it('should undo text deletion', () => {
    const command = new DeleteTextCommand(editorState, 5, 11);
    command.execute();
    command.undo();

    expect(get(editorState.content)).toBe('Hello World');
    expect(get(editorState.cursorPosition)).toBe(11);
  });

  it('should provide correct description', () => {
    const command = new DeleteTextCommand(editorState, 5, 11);
    expect(command.getDescription()).toBe('Delete " World"');
  });

  it('should handle deletion at beginning of text', () => {
    const command = new DeleteTextCommand(editorState, 0, 6);
    command.execute();

    expect(get(editorState.content)).toBe('World');
    expect(get(editorState.cursorPosition)).toBe(0);
  });
});