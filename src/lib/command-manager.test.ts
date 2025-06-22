import { describe, it, expect, beforeEach } from 'vitest';
import { CommandManager } from './command-manager';
import type { Command } from './commands';

describe('CommandManager', () => {
  let commandManager: CommandManager;
  let mockCommands: Command[];
  let executionLog: string[];

  beforeEach(() => {
    commandManager = new CommandManager();
    executionLog = [];
    
    mockCommands = [
      {
        execute: () => executionLog.push('cmd1-execute'),
        undo: () => executionLog.push('cmd1-undo'),
        getDescription: () => 'Command 1'
      },
      {
        execute: () => executionLog.push('cmd2-execute'),
        undo: () => executionLog.push('cmd2-undo'),
        getDescription: () => 'Command 2'
      }
    ];
  });

  it('should execute and store commands', () => {
    commandManager.executeCommand(mockCommands[0]);
    
    expect(executionLog).toEqual(['cmd1-execute']);
    expect(commandManager.canUndo()).toBe(true);
    expect(commandManager.canRedo()).toBe(false);
  });

  it('should undo commands', () => {
    commandManager.executeCommand(mockCommands[0]);
    commandManager.undo();
    
    expect(executionLog).toEqual(['cmd1-execute', 'cmd1-undo']);
    expect(commandManager.canUndo()).toBe(false);
    expect(commandManager.canRedo()).toBe(true);
  });

  it('should redo commands', () => {
    commandManager.executeCommand(mockCommands[0]);
    commandManager.undo();
    commandManager.redo();
    
    expect(executionLog).toEqual(['cmd1-execute', 'cmd1-undo', 'cmd1-execute']);
    expect(commandManager.canUndo()).toBe(true);
    expect(commandManager.canRedo()).toBe(false);
  });

  it('should clear redo stack when new command is executed after undo', () => {
    commandManager.executeCommand(mockCommands[0]);
    commandManager.executeCommand(mockCommands[1]);
    commandManager.undo();
    
    expect(commandManager.canRedo()).toBe(true);
    
    commandManager.executeCommand(mockCommands[0]);
    
    expect(commandManager.canRedo()).toBe(false);
    expect(executionLog).toEqual(['cmd1-execute', 'cmd2-execute', 'cmd2-undo', 'cmd1-execute']);
  });

  it('should return command history', () => {
    commandManager.executeCommand(mockCommands[0]);
    commandManager.executeCommand(mockCommands[1]);
    
    const history = commandManager.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].description).toBe('Command 1');
    expect(history[1].description).toBe('Command 2');
  });

  it('should handle undo/redo when no commands exist', () => {
    expect(commandManager.canUndo()).toBe(false);
    expect(commandManager.canRedo()).toBe(false);
    
    commandManager.undo();
    commandManager.redo();
    
    expect(executionLog).toEqual([]);
  });
});