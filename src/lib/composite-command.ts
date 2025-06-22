import type { Command } from './commands';

export class CompositeCommand implements Command {
  private commands: Command[];
  private isAlreadyExecuted: boolean;

  constructor(commands: Command[] = [], alreadyExecuted: boolean = false) {
    this.commands = [...commands];
    this.isAlreadyExecuted = alreadyExecuted;
  }

  execute(): void {
    if (this.isAlreadyExecuted) {
      // Skip execution only on the first call, then reset flag
      this.isAlreadyExecuted = false;
      return;
    }
    
    for (const command of this.commands) {
      command.execute();
    }
  }

  undo(): void {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  getDescription(): string {
    if (this.commands.length === 0) {
      return 'Empty batch';
    }
    
    const descriptions = this.commands.map(cmd => cmd.getDescription());
    return `Batch: ${descriptions.join(', ')}`;
  }

  addCommand(command: Command): void {
    this.commands.push(command);
  }

  getCommandCount(): number {
    return this.commands.length;
  }

  isEmpty(): boolean {
    return this.commands.length === 0;
  }

  getCommands(): Command[] {
    return [...this.commands];
  }
}