import { describe, it, expect, beforeEach } from 'vitest';
import { CompositeCommand } from './composite-command';
import type { Command } from './commands';

describe('CompositeCommand', () => {
  let executionLog: string[];
  let mockCommands: Command[];

  beforeEach(() => {
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
      },
      {
        execute: () => executionLog.push('cmd3-execute'),
        undo: () => executionLog.push('cmd3-undo'),
        getDescription: () => 'Command 3'
      }
    ];
  });

  it('should execute all sub-commands in order', () => {
    const composite = new CompositeCommand([mockCommands[0], mockCommands[1]]);
    composite.execute();
    
    expect(executionLog).toEqual(['cmd1-execute', 'cmd2-execute']);
  });

  it('should undo all sub-commands in reverse order', () => {
    const composite = new CompositeCommand([mockCommands[0], mockCommands[1]]);
    composite.execute();
    composite.undo();
    
    expect(executionLog).toEqual(['cmd1-execute', 'cmd2-execute', 'cmd2-undo', 'cmd1-undo']);
  });

  it('should handle empty command list', () => {
    const composite = new CompositeCommand([]);
    composite.execute();
    composite.undo();
    
    expect(executionLog).toEqual([]);
  });

  it('should handle single command', () => {
    const composite = new CompositeCommand([mockCommands[0]]);
    composite.execute();
    composite.undo();
    
    expect(executionLog).toEqual(['cmd1-execute', 'cmd1-undo']);
  });

  it('should provide composite description', () => {
    const composite = new CompositeCommand([mockCommands[0], mockCommands[1]]);
    
    expect(composite.getDescription()).toBe('Batch: Command 1, Command 2');
  });

  it('should handle long command lists in description', () => {
    const composite = new CompositeCommand(mockCommands);
    
    expect(composite.getDescription()).toBe('Batch: Command 1, Command 2, Command 3');
  });

  it('should provide meaningful description for empty batch', () => {
    const composite = new CompositeCommand([]);
    
    expect(composite.getDescription()).toBe('Empty batch');
  });

  it('should allow adding commands to existing composite', () => {
    const composite = new CompositeCommand([mockCommands[0]]);
    composite.addCommand(mockCommands[1]);
    composite.execute();
    
    expect(executionLog).toEqual(['cmd1-execute', 'cmd2-execute']);
  });

  it('should get command count', () => {
    const composite = new CompositeCommand([mockCommands[0], mockCommands[1]]);
    
    expect(composite.getCommandCount()).toBe(2);
  });

  it('should check if empty', () => {
    const emptyComposite = new CompositeCommand([]);
    const nonEmptyComposite = new CompositeCommand([mockCommands[0]]);
    
    expect(emptyComposite.isEmpty()).toBe(true);
    expect(nonEmptyComposite.isEmpty()).toBe(false);
  });
});