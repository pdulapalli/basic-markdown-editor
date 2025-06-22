<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { EditorState } from '../editor-state';
  import { SmartBatchingCommandManager, CommandType } from '../smart-batching';
  import { InsertTextCommand, DeleteTextCommand } from '../text-commands';
  import Toolbar from './Toolbar.svelte';
  
  export let initialContent: string = '';
  
  const dispatch = createEventDispatcher<{ contentChange: string }>();
  
  const editorState = new EditorState();
  const commandManager = new SmartBatchingCommandManager({
    batchTimeout: 700,
    maxBatchSize: 50,
    maxPositionJump: 10
  });
  
  let textArea: HTMLTextAreaElement;
  
  // Extract the stores from the EditorState and CommandManager
  const { content: contentStore, cursorPosition: cursorStore } = editorState;
  const { canUndoStore, canRedoStore } = commandManager;
  
  // Export the content store for parent components
  export { contentStore };

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const newContent = target.value;
    const newCursorPos = target.selectionStart || 0;
    
    if (newContent.length > $contentStore.length) {
      const insertPos = newCursorPos - (newContent.length - $contentStore.length);
      const insertedText = newContent.slice(insertPos, newCursorPos);
      const command = new InsertTextCommand(editorState, insertPos, insertedText);
      commandManager.executeCommand(command, CommandType.INSERT, newCursorPos);
    } else if (newContent.length < $contentStore.length) {
      const deleteStart = newCursorPos;
      const deleteEnd = deleteStart + ($contentStore.length - newContent.length);
      const command = new DeleteTextCommand(editorState, deleteStart, deleteEnd);
      commandManager.executeCommand(command, CommandType.DELETE, deleteStart);
    }
    
    // Dispatch content change event
    dispatch('contentChange', newContent);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        commandManager.undo();
        updateTextArea();
      } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
        event.preventDefault();
        commandManager.redo();
        updateTextArea();
      }
    }
  }

  function updateTextArea() {
    if (textArea) {
      textArea.value = $contentStore;
      textArea.setSelectionRange($cursorStore, $cursorStore);
    }
  }

  function handleSelectionChange() {
    if (textArea) {
      editorState.setCursorPosition(textArea.selectionStart || 0);
    }
  }

  function handleBlur() {
    // Finalize batch when user focuses away from editor
    commandManager.finalizeBatch();
  }

  function handlePaste() {
    // Finalize current batch before paste operation
    commandManager.finalizeBatch();
  }

  onMount(() => {
    if (initialContent) {
      editorState.setContent(initialContent);
    }
    updateTextArea();
  });

  $: if (textArea && $contentStore !== textArea.value) {
    updateTextArea();
  }
</script>

<div class="text-editor-container">
  <Toolbar {commandManager} {editorState} {textArea} canUndo={$canUndoStore} canRedo={$canRedoStore} />
  
  <div class="editor-wrapper">
    <textarea
      bind:this={textArea}
      class="editor"
      placeholder="Start typing..."
      on:input={handleInput}
      on:keydown={handleKeyDown}
      on:select={handleSelectionChange}
      on:click={handleSelectionChange}
      on:blur={handleBlur}
      on:paste={handlePaste}
    ></textarea>
  </div>
</div>

<style>
  .text-editor-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: none;
    border-radius: 0;
    overflow: hidden;
    background: white;
  }

  .editor-wrapper {
    position: relative;
    flex: 1;
    display: flex;
  }

  .editor {
    width: 100%;
    height: 100%;
    padding: 1rem;
    border: none;
    outline: none;
    resize: none;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    background: #fafafa;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    box-sizing: border-box;
  }

  .editor:focus {
    background: white;
  }
</style>