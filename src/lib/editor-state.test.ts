import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { EditorState } from './editor-state';

describe('EditorState', () => {
  let editorState: EditorState;

  beforeEach(() => {
    editorState = new EditorState();
  });

  it('should initialize with empty content', () => {
    const state = get(editorState.content);
    expect(state).toBe('');
  });

  it('should initialize with cursor at position 0', () => {
    const cursor = get(editorState.cursorPosition);
    expect(cursor).toBe(0);
  });

  it('should insert text at cursor position', () => {
    editorState.insertText(0, 'Hello');
    expect(get(editorState.content)).toBe('Hello');
    expect(get(editorState.cursorPosition)).toBe(5);
  });

  it('should insert text in middle of existing content', () => {
    editorState.insertText(0, 'Hello World');
    editorState.insertText(5, ', Beautiful');
    
    expect(get(editorState.content)).toBe('Hello, Beautiful World');
    expect(get(editorState.cursorPosition)).toBe(16);
  });

  it('should delete text from specified range', () => {
    editorState.insertText(0, 'Hello World');
    editorState.deleteText(5, 11);
    
    expect(get(editorState.content)).toBe('Hello');
    expect(get(editorState.cursorPosition)).toBe(5);
  });

  it('should handle cursor position updates', () => {
    editorState.insertText(0, 'Hello');
    editorState.setCursorPosition(2);
    
    expect(get(editorState.cursorPosition)).toBe(2);
  });

  it('should get text content as string', () => {
    editorState.insertText(0, 'Test content');
    expect(editorState.getContent()).toBe('Test content');
  });

  it('should get cursor position as number', () => {
    editorState.insertText(0, 'Test');
    editorState.setCursorPosition(2);
    expect(editorState.getCursorPosition()).toBe(2);
  });
});