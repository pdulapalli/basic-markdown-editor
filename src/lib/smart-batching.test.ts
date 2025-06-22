import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SmartBatchingCommandManager, CommandType } from './smart-batching';
import { EditorState } from './editor-state';
import { InsertTextCommand, DeleteTextCommand } from './text-commands';

describe('SmartBatchingCommandManager', () => {
  let batchingManager: SmartBatchingCommandManager;
  let editorState: EditorState;
  let executionLog: string[];

  beforeEach(() => {
    executionLog = [];
    vi.useFakeTimers();
    editorState = new EditorState();
    
    batchingManager = new SmartBatchingCommandManager({
      batchTimeout: 700,
      maxBatchSize: 50
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should batch consecutive insert commands', () => {
    const cmd1 = new InsertTextCommand(editorState, 0, 'a');
    const cmd2 = new InsertTextCommand(editorState, 1, 'b');
    
    batchingManager.executeCommand(cmd1, CommandType.INSERT, 0);
    batchingManager.executeCommand(cmd2, CommandType.INSERT, 1);
    
    // Should be in same batch
    batchingManager.undo();
    expect(editorState.getContent()).toBe('');
  });

  it('should finalize batch when action type changes', () => {
    const insertCmd = new InsertTextCommand(editorState, 0, 'hello');
    
    batchingManager.executeCommand(insertCmd, CommandType.INSERT, 0);
    expect(editorState.getContent()).toBe('hello');
    
    const deleteCmd = new DeleteTextCommand(editorState, 0, 5);
    batchingManager.executeCommand(deleteCmd, CommandType.DELETE, 5);
    expect(editorState.getContent()).toBe('');
    
    // Should have created separate batches due to action type change
    batchingManager.undo(); // Undoes delete batch
    expect(editorState.getContent()).toBe('hello');
    
    batchingManager.undo(); // Undoes insert batch
    expect(editorState.getContent()).toBe('');
  });

  it('should finalize batch when cursor position jumps', () => {
    editorState.insertText(0, 'hello world');
    
    const cmd1 = new InsertTextCommand(editorState, 5, 'X');
    batchingManager.executeCommand(cmd1, CommandType.INSERT, 5);
    expect(editorState.getContent()).toBe('helloX world');
    
    const cmd2 = new InsertTextCommand(editorState, 0, 'Y'); // Position jump
    batchingManager.executeCommand(cmd2, CommandType.INSERT, 0);
    expect(editorState.getContent()).toBe('YhelloX world');
    
    // Should have separate batches due to position jump
    batchingManager.undo(); // Undoes second command
    expect(editorState.getContent()).toBe('helloX world');
    
    batchingManager.undo(); // Undoes first command
    expect(editorState.getContent()).toBe('hello world');
  });

  it('should batch consecutive positions for insert commands', () => {
    const cmd1 = new InsertTextCommand(editorState, 0, 'a');
    const cmd2 = new InsertTextCommand(editorState, 1, 'b');
    const cmd3 = new InsertTextCommand(editorState, 2, 'c');
    
    batchingManager.executeCommand(cmd1, CommandType.INSERT, 0);
    batchingManager.executeCommand(cmd2, CommandType.INSERT, 1);
    batchingManager.executeCommand(cmd3, CommandType.INSERT, 2);
    
    // All should be in same batch (consecutive positions)
    batchingManager.undo();
    expect(editorState.getContent()).toBe('');
  });

  it('should batch consecutive backspace deletions', () => {
    editorState.insertText(0, 'hello');
    
    const cmd1 = new DeleteTextCommand(editorState, 4, 5); // Delete 'o'
    const cmd2 = new DeleteTextCommand(editorState, 3, 4); // Delete 'l'
    const cmd3 = new DeleteTextCommand(editorState, 2, 3); // Delete 'l'
    
    batchingManager.executeCommand(cmd1, CommandType.DELETE, 5);
    batchingManager.executeCommand(cmd2, CommandType.DELETE, 4);
    batchingManager.executeCommand(cmd3, CommandType.DELETE, 3);
    
    // Should batch consecutive backspace operations
    batchingManager.undo();
    expect(editorState.getContent()).toBe('hello');
  });

  it('should finalize batch on explicit finalization', () => {
    const cmd1 = new InsertTextCommand(editorState, 0, 'a');
    const cmd2 = new InsertTextCommand(editorState, 1, 'b');
    
    batchingManager.executeCommand(cmd1, CommandType.INSERT, 0);
    batchingManager.finalizeBatch();
    batchingManager.executeCommand(cmd2, CommandType.INSERT, 1);
    
    // Should have separate batches
    batchingManager.undo(); // Undoes 'b'
    expect(editorState.getContent()).toBe('a');
    
    batchingManager.undo(); // Undoes 'a'
    expect(editorState.getContent()).toBe('');
  });

  it('should finalize batch after timeout', () => {
    const cmd1 = new InsertTextCommand(editorState, 0, 'a');
    const cmd2 = new InsertTextCommand(editorState, 1, 'b');
    
    batchingManager.executeCommand(cmd1, CommandType.INSERT, 0);
    
    // Fast forward past timeout
    vi.advanceTimersByTime(1000);
    
    batchingManager.executeCommand(cmd2, CommandType.INSERT, 1);
    
    // Should have separate batches due to timeout
    batchingManager.undo(); // Undoes 'b'
    expect(editorState.getContent()).toBe('a');
    
    batchingManager.undo(); // Undoes 'a'
    expect(editorState.getContent()).toBe('');
  });

  it('should handle format commands as separate batches', () => {
    const insertCmd = new InsertTextCommand(editorState, 0, 'hello');
    const formatCmd = {
      execute: () => {},
      undo: () => {},
      getDescription: () => 'Bold formatting'
    };
    
    batchingManager.executeCommand(insertCmd, CommandType.INSERT, 0);
    batchingManager.executeCommand(formatCmd, CommandType.FORMAT, 5);
    
    // Should have separate batches
    batchingManager.undo(); // Undoes format
    batchingManager.undo(); // Undoes insert
    expect(editorState.getContent()).toBe('');
  });
});