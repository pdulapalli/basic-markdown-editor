import { expect, test } from 'vitest';
import { EditorState } from './editor-state';
import { MarkdownBoldCommand, MarkdownItalicCommand } from './markdown-commands';

test('MarkdownBoldCommand adds bold formatting to unformatted text', () => {
  const editorState = new EditorState();
  editorState.setContent('Hello world');
  
  // Select "Hello"
  const command = new MarkdownBoldCommand(editorState, 0, 5);
  command.execute();
  
  expect(editorState.getContent()).toBe('**Hello** world');
});

test('MarkdownBoldCommand removes bold formatting from formatted text', () => {
  const editorState = new EditorState();
  editorState.setContent('**Hello** world');
  
  // Select "**Hello**"
  const command = new MarkdownBoldCommand(editorState, 0, 9);
  command.execute();
  
  expect(editorState.getContent()).toBe('Hello world');
});

test('MarkdownBoldCommand undo works correctly', () => {
  const editorState = new EditorState();
  editorState.setContent('Hello world');
  
  // Select "Hello"
  const command = new MarkdownBoldCommand(editorState, 0, 5);
  command.execute();
  expect(editorState.getContent()).toBe('**Hello** world');
  
  command.undo();
  expect(editorState.getContent()).toBe('Hello world');
});

test('MarkdownItalicCommand adds italic formatting to unformatted text', () => {
  const editorState = new EditorState();
  editorState.setContent('Hello world');
  
  // Select "world"
  const command = new MarkdownItalicCommand(editorState, 6, 11);
  command.execute();
  
  expect(editorState.getContent()).toBe('Hello *world*');
});

test('MarkdownItalicCommand removes italic formatting from formatted text', () => {
  const editorState = new EditorState();
  editorState.setContent('Hello *world*');
  
  // Select "*world*"
  const command = new MarkdownItalicCommand(editorState, 6, 13);
  command.execute();
  
  expect(editorState.getContent()).toBe('Hello world');
});

test('MarkdownItalicCommand undo works correctly', () => {
  const editorState = new EditorState();
  editorState.setContent('Hello world');
  
  // Select "world"
  const command = new MarkdownItalicCommand(editorState, 6, 11);
  command.execute();
  expect(editorState.getContent()).toBe('Hello *world*');
  
  command.undo();
  expect(editorState.getContent()).toBe('Hello world');
});

test('MarkdownItalicCommand does not mistake bold for italic', () => {
  const editorState = new EditorState();
  editorState.setContent('**Bold text** normal');
  
  // Select "**Bold text**" - should not be detected as italic
  const command = new MarkdownItalicCommand(editorState, 0, 13);
  command.execute();
  
  expect(editorState.getContent()).toBe('***Bold text*** normal');
});

test('Commands work with mixed formatting', () => {
  const editorState = new EditorState();
  editorState.setContent('Normal text here');
  
  // Make "text" bold
  const boldCommand = new MarkdownBoldCommand(editorState, 7, 11);
  boldCommand.execute();
  expect(editorState.getContent()).toBe('Normal **text** here');
  
  // Make "**text**" italic (should wrap the whole thing)
  const italicCommand = new MarkdownItalicCommand(editorState, 7, 15);
  italicCommand.execute();
  expect(editorState.getContent()).toBe('Normal ***text*** here');
});