import { get } from 'svelte/store';
import { expect, test } from 'vitest';
import { EditorState } from './editor-state';
import { SmartBatchingCommandManager, CommandType } from './smart-batching';
import { InsertTextCommand } from './text-commands';

test('editor state changes are reflected in content store on undo/redo', () => {
  const editorState = new EditorState();
  const commandManager = new SmartBatchingCommandManager();
  
  // Get the content store
  const { content: contentStore } = editorState;
  
  // Set initial content
  editorState.setContent('# Initial content');
  expect(get(contentStore)).toBe('# Initial content');
  
  // Execute a command to add text
  const insertCommand = new InsertTextCommand(editorState, 17, '\n\nNew paragraph');
  commandManager.executeCommand(insertCommand, CommandType.INSERT, 17);
  
  expect(get(contentStore)).toBe('# Initial content\n\nNew paragraph');
  
  // Finalize the batch
  commandManager.finalizeBatch();
  
  // Undo should revert to original content
  commandManager.undo();
  expect(get(contentStore)).toBe('# Initial content');
  
  // Redo should restore the added content
  commandManager.redo();
  expect(get(contentStore)).toBe('# Initial content\n\nNew paragraph');
});

test('content store is reactive to direct editor state changes', () => {
  const editorState = new EditorState();
  const { content: contentStore } = editorState;
  
  // Set content directly on editor state
  editorState.setContent('## Header 2');
  expect(get(contentStore)).toBe('## Header 2');
  
  // Insert text directly
  editorState.insertText(9, ' Added');
  expect(get(contentStore)).toBe('## Header Added 2');
  
  // Delete text directly  
  editorState.deleteText(9, 15);
  expect(get(contentStore)).toBe('## Header 2');
});