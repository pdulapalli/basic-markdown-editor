import { describe, it, expect } from 'vitest';
import type { Command } from './commands';

describe('Command Interface', () => {
  it('should define a command with execute and undo methods', () => {
    const mockCommand: Command = {
      execute: () => {},
      undo: () => {},
      getDescription: () => 'Test command'
    };

    expect(mockCommand.execute).toBeDefined();
    expect(mockCommand.undo).toBeDefined();
    expect(mockCommand.getDescription).toBeDefined();
    expect(mockCommand.getDescription()).toBe('Test command');
  });
});