<script lang="ts">
  import type { EditorState } from '../editor-state';
  import { CommandType, type SmartBatchingCommandManager } from '../smart-batching';
  import { MarkdownBoldCommand, MarkdownItalicCommand } from '../markdown-commands';
  
  export let commandManager: SmartBatchingCommandManager;
  export let editorState: EditorState;
  export let textArea: HTMLTextAreaElement | undefined;
  export let canUndo: boolean;
  export let canRedo: boolean;

  function handleUndo() {
    commandManager.undo();
  }

  function handleRedo() {
    commandManager.redo();
  }

  function handleBold() {
    if (!textArea) return;
    
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    
    if (start === end) {
      // No selection, do nothing for now
      return;
    }
    
    const command = new MarkdownBoldCommand(editorState, start, end);
    commandManager.executeCommand(command, CommandType.MARKDOWN, start);
  }

  function handleItalic() {
    if (!textArea) return;
    
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    
    if (start === end) {
      // No selection, do nothing for now
      return;
    }
    
    const command = new MarkdownItalicCommand(editorState, start, end);
    commandManager.executeCommand(command, CommandType.MARKDOWN, start);
  }
</script>

<div class="toolbar">
  <div class="button-group">
    <button 
      class="toolbar-button" 
      disabled={!canUndo} 
      on:click={handleUndo}
      title="Undo (Ctrl+Z)"
    >
      ↶ Undo
    </button>
    
    <button 
      class="toolbar-button" 
      disabled={!canRedo} 
      on:click={handleRedo}
      title="Redo (Ctrl+Y)"
    >
      ↷ Redo
    </button>
  </div>

  <div class="button-group">
    <button class="toolbar-button" title="Bold (Ctrl+B)" on:click={handleBold}>
      <strong>B</strong>
    </button>
    
    <button class="toolbar-button" title="Italic (Ctrl+I)" on:click={handleItalic}>
      <em>I</em>
    </button>
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
  }

  .button-group {
    display: flex;
    gap: 0.25rem;
  }

  .toolbar-button {
    padding: 0.4rem 0.8rem;
    border: 1px solid #ccc;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
  }

  .toolbar-button:hover:not(:disabled) {
    background: #e9ecef;
    border-color: #adb5bd;
  }

  .toolbar-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f8f9fa;
  }

</style>