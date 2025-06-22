import type { Writable } from 'svelte/store';
import { CommandManager } from './command-manager';
import { CompositeCommand } from './composite-command';
import type { Command } from './commands';

export interface BatchingOptions {
  batchTimeout: number;  // ms to wait before finalizing batch
  maxBatchSize: number;  // max commands per batch
}

export class BatchingCommandManager {
  private commandManager: CommandManager;
  private currentBatch: CompositeCommand;
  private batchTimer: number | null = null;
  private options: BatchingOptions;

  constructor(options: BatchingOptions = { batchTimeout: 700, maxBatchSize: 50 }) {
    this.commandManager = new CommandManager();
    this.currentBatch = new CompositeCommand();
    this.options = options;
  }

  executeCommand(command: Command): void {
    // Execute the command immediately for responsiveness
    command.execute();
    
    // Add to current batch
    this.currentBatch.addCommand(command);
    
    // Check if we need to finalize due to size limit
    if (this.currentBatch.getCommandCount() >= this.options.maxBatchSize) {
      this.finalizeBatch();
      return;
    }
    
    // Reset/start batch timer
    this.resetBatchTimer();
  }

  undo(): void {
    this.finalizeBatch(); // Ensure current batch is finalized
    this.commandManager.undo();
  }

  redo(): void {
    this.commandManager.redo();
  }

  canUndo(): boolean {
    // Can undo if there's a current batch with commands OR if command manager can undo
    return !this.currentBatch.isEmpty() || this.commandManager.canUndo();
  }

  canRedo(): boolean {
    return this.commandManager.canRedo();
  }

  finalizeBatch(): void {
    if (!this.currentBatch.isEmpty()) {
      // Create a new composite command that knows it's already executed
      const executedBatch = new CompositeCommand(this.currentBatch.getCommands(), true);
      this.commandManager.executeCommand(executedBatch);
      this.currentBatch = new CompositeCommand();
    }
    
    this.clearBatchTimer();
  }

  clear(): void {
    this.currentBatch = new CompositeCommand();
    this.clearBatchTimer();
    this.commandManager.clear();
  }

  get canUndoStore(): Writable<boolean> {
    return this.commandManager.canUndoStore;
  }

  get canRedoStore(): Writable<boolean> {
    return this.commandManager.canRedoStore;
  }

  getHistory() {
    return this.commandManager.getHistory();
  }

  private resetBatchTimer(): void {
    this.clearBatchTimer();
    this.batchTimer = window.setTimeout(() => {
      this.finalizeBatch();
    }, this.options.batchTimeout);
  }

  private clearBatchTimer(): void {
    if (this.batchTimer !== null) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }
}