import type { Writable } from 'svelte/store';
import { CommandManager } from './command-manager';
import { CompositeCommand } from './composite-command';
import type { Command } from './commands';

export enum CommandType {
  INSERT = 'insert',
  DELETE = 'delete',
  FORMAT = 'format',
  MARKDOWN = 'markdown',
  OTHER = 'other'
}

export interface SmartBatchingOptions {
  batchTimeout: number;     // ms to wait before finalizing batch
  maxBatchSize: number;     // max commands per batch
  maxPositionJump: number;  // max cursor position jump to stay in batch
}

interface BatchState {
  lastCommandType: CommandType | null;
  lastPosition: number | null;
  lastTimestamp: number;
}

export class SmartBatchingCommandManager {
  private commandManager: CommandManager;
  private currentBatch: CompositeCommand;
  private batchTimer: number | null = null;
  private options: SmartBatchingOptions;
  private batchState: BatchState;

  constructor(options: Partial<SmartBatchingOptions> = {}) {
    this.commandManager = new CommandManager();
    this.currentBatch = new CompositeCommand();
    this.options = {
      batchTimeout: 700,
      maxBatchSize: 50,
      maxPositionJump: 10,
      ...options
    };
    this.batchState = {
      lastCommandType: null,
      lastPosition: null,
      lastTimestamp: Date.now()
    };
  }

  executeCommand(command: Command, commandType: CommandType, position: number): void {
    // Check if we should finalize the current batch
    if (this.shouldFinalizeBatch(commandType, position)) {
      this.finalizeBatch();
    }

    // Execute the command immediately for responsiveness
    command.execute();
    
    // Add to current batch
    this.currentBatch.addCommand(command);
    
    // Update batch state
    this.batchState.lastCommandType = commandType;
    this.batchState.lastPosition = position;
    this.batchState.lastTimestamp = Date.now();
    
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
    return !this.currentBatch.isEmpty() || this.commandManager.canUndo();
  }

  canRedo(): boolean {
    return this.commandManager.canRedo();
  }

  finalizeBatch(): void {
    if (!this.currentBatch.isEmpty()) {
      const executedBatch = new CompositeCommand(this.currentBatch.getCommands(), true);
      this.commandManager.executeCommand(executedBatch);
      this.currentBatch = new CompositeCommand();
    }
    
    this.clearBatchTimer();
    this.resetBatchState();
  }

  clear(): void {
    this.currentBatch = new CompositeCommand();
    this.clearBatchTimer();
    this.commandManager.clear();
    this.resetBatchState();
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

  private shouldFinalizeBatch(commandType: CommandType, position: number): boolean {
    // Always finalize if no current batch
    if (this.currentBatch.isEmpty()) {
      return false;
    }

    // Finalize if command type changed
    if (this.batchState.lastCommandType !== commandType) {
      return true;
    }

    // Finalize if this is a format or markdown command (they should be separate)
    if (commandType === CommandType.FORMAT || commandType === CommandType.MARKDOWN) {
      return true;
    }

    // For text commands, check position continuity
    if (this.batchState.lastPosition !== null) {
      const positionDiff = Math.abs(position - this.batchState.lastPosition);
      
      if (commandType === CommandType.INSERT) {
        // For inserts, expect positions to be reasonably close and moving forward
        // A significant jump (like from 5 to 0) should break the batch
        if (positionDiff > 2) { // More strict for inserts - allow small corrections only
          return true;
        }
      } else if (commandType === CommandType.DELETE) {
        // For deletes, expect backspace pattern (decreasing positions) or forward delete
        // Allow for reasonable deletion patterns
        if (positionDiff > this.options.maxPositionJump) {
          return true;
        }
      }
    }

    return false;
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

  private resetBatchState(): void {
    this.batchState = {
      lastCommandType: null,
      lastPosition: null,
      lastTimestamp: Date.now()
    };
  }
}