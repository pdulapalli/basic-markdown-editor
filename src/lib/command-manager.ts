import { writable, type Writable } from 'svelte/store';
import type { Command } from './commands';

export interface CommandHistoryEntry {
  command: Command;
  description: string;
  timestamp: Date;
}

export class CommandManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private history: CommandHistoryEntry[] = [];
  
  public canUndoStore: Writable<boolean> = writable(false);
  public canRedoStore: Writable<boolean> = writable(false);

  executeCommand(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
    
    this.history.push({
      command,
      description: command.getDescription(),
      timestamp: new Date()
    });
    
    this.updateStores();
  }

  undo(): void {
    if (this.canUndo()) {
      const command = this.undoStack.pop()!;
      command.undo();
      this.redoStack.push(command);
      this.updateStores();
    }
  }

  redo(): void {
    if (this.canRedo()) {
      const command = this.redoStack.pop()!;
      command.execute();
      this.undoStack.push(command);
      this.updateStores();
    }
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  getHistory(): CommandHistoryEntry[] {
    return [...this.history];
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.history = [];
    this.updateStores();
  }
  
  private updateStores(): void {
    this.canUndoStore.set(this.canUndo());
    this.canRedoStore.set(this.canRedo());
  }
}