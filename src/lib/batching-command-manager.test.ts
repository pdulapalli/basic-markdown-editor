import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BatchingCommandManager } from './batching-command-manager';
import type { Command } from './commands';

describe('BatchingCommandManager', () => {
  let batchingManager: BatchingCommandManager;
  let executionLog: string[];
  let mockCommands: Command[];

  beforeEach(() => {
    executionLog = [];
    vi.useFakeTimers();
    
    mockCommands = [
      {
        execute: () => executionLog.push('cmd1-execute'),
        undo: () => executionLog.push('cmd1-undo'),
        getDescription: () => 'Insert "a"'
      },
      {
        execute: () => executionLog.push('cmd2-execute'),
        undo: () => executionLog.push('cmd2-undo'),
        getDescription: () => 'Insert "b"'
      },
      {
        execute: () => executionLog.push('cmd3-execute'),
        undo: () => executionLog.push('cmd3-undo'),
        getDescription: () => 'Delete "b"'
      }
    ];

    batchingManager = new BatchingCommandManager({
      batchTimeout: 700,
      maxBatchSize: 50
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute commands immediately', () => {
    batchingManager.executeCommand(mockCommands[0]);
    
    expect(executionLog).toEqual(['cmd1-execute']);
  });

  it('should batch consecutive commands within timeout', () => {
    batchingManager.executeCommand(mockCommands[0]);
    batchingManager.executeCommand(mockCommands[1]);
    
    // Both commands executed but only first batch created
    expect(executionLog).toEqual(['cmd1-execute', 'cmd2-execute']);
    expect(batchingManager.canUndo()).toBe(true);
    
    // Should undo both as a batch
    batchingManager.undo();
    expect(executionLog).toEqual(['cmd1-execute', 'cmd2-execute', 'cmd2-undo', 'cmd1-undo']);
  });

  it('should finalize batch after timeout', () => {
    batchingManager.executeCommand(mockCommands[0]);
    
    // Fast forward past timeout
    vi.advanceTimersByTime(1000);
    
    batchingManager.executeCommand(mockCommands[1]);
    
    // Should have created two separate batches
    batchingManager.undo(); // Undoes second command
    expect(executionLog).toEqual(['cmd1-execute', 'cmd2-execute', 'cmd2-undo']);
    
    batchingManager.undo(); // Undoes first command
    expect(executionLog).toEqual(['cmd1-execute', 'cmd2-execute', 'cmd2-undo', 'cmd1-undo']);
  });

  it('should support manual batch finalization', () => {
    batchingManager.executeCommand(mockCommands[0]);
    batchingManager.executeCommand(mockCommands[1]);
    
    batchingManager.finalizeBatch();
    
    batchingManager.executeCommand(mockCommands[2]);
    
    // Should have two separate undo operations
    batchingManager.undo(); // Undoes third command
    expect(executionLog).toEqual(['cmd1-execute', 'cmd2-execute', 'cmd3-execute', 'cmd3-undo']);
    
    batchingManager.undo(); // Undoes first batch
    expect(executionLog).toEqual(['cmd1-execute', 'cmd2-execute', 'cmd3-execute', 'cmd3-undo', 'cmd2-undo', 'cmd1-undo']);
  });

  it('should handle redo correctly with batches', () => {
    batchingManager.executeCommand(mockCommands[0]);
    batchingManager.executeCommand(mockCommands[1]);
    
    batchingManager.undo();
    batchingManager.redo();
    
    expect(executionLog).toEqual([
      'cmd1-execute', 'cmd2-execute', 
      'cmd2-undo', 'cmd1-undo',
      'cmd1-execute', 'cmd2-execute'
    ]);
  });

  it('should provide correct undo/redo state', () => {
    expect(batchingManager.canUndo()).toBe(false);
    expect(batchingManager.canRedo()).toBe(false);
    
    batchingManager.executeCommand(mockCommands[0]);
    expect(batchingManager.canUndo()).toBe(true);
    expect(batchingManager.canRedo()).toBe(false);
    
    batchingManager.undo();
    expect(batchingManager.canUndo()).toBe(false);
    expect(batchingManager.canRedo()).toBe(true);
  });

  it('should respect max batch size', () => {
    const smallBatchManager = new BatchingCommandManager({
      batchTimeout: 700,
      maxBatchSize: 2
    });
    
    // Add 3 commands - should create 2 batches
    smallBatchManager.executeCommand(mockCommands[0]);
    smallBatchManager.executeCommand(mockCommands[1]);
    smallBatchManager.executeCommand(mockCommands[2]); // Should trigger new batch
    
    // Undo should only undo the last command
    smallBatchManager.undo();
    expect(executionLog).toEqual(['cmd1-execute', 'cmd2-execute', 'cmd3-execute', 'cmd3-undo']);
  });

  it('should access underlying stores for reactivity', () => {
    expect(batchingManager.canUndoStore).toBeDefined();
    expect(batchingManager.canRedoStore).toBeDefined();
  });

  it('should clear all batches and history', () => {
    batchingManager.executeCommand(mockCommands[0]);
    batchingManager.executeCommand(mockCommands[1]);
    
    batchingManager.clear();
    
    expect(batchingManager.canUndo()).toBe(false);
    expect(batchingManager.canRedo()).toBe(false);
  });
});