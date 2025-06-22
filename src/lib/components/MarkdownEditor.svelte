<script lang="ts">
  import TextEditor from './TextEditor.svelte';
  import MarkdownPreview from './MarkdownPreview.svelte';

  let textEditor: TextEditor;
  let contentStore: any;

  // Sample content to start with
  const initialContent = '';

  function handleContentChange(event: CustomEvent<string>) {
    // This event is still useful for any additional processing if needed
  }
</script>

<div class="markdown-editor">
  <div class="editor-pane">
    <h3>Edit</h3>
    <TextEditor
      bind:this={textEditor}
      bind:contentStore
      {initialContent}
      on:contentChange={handleContentChange}
    />
  </div>

  <div class="divider"></div>

  <div class="preview-pane">
    <h3>Preview</h3>
    <MarkdownPreview content={contentStore ? $contentStore : initialContent} />
  </div>
</div>

<style>
  .markdown-editor {
    display: flex;
    gap: 1rem;
    height: 600px;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }

  .editor-pane,
  .preview-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .preview-pane {
    background: #fafafa;
  }

  .editor-pane h3,
  .preview-pane h3 {
    margin: 0;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #ddd;
    font-size: 0.9rem;
    font-weight: 600;
    color: #495057;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .divider {
    width: 1px;
    background: #ddd;
    flex-shrink: 0;
  }

  .editor-pane :global(.text-editor-container) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .editor-pane :global(textarea) {
    flex: 1;
    border: none;
    border-radius: 0;
    resize: none;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    padding: 1rem;
    box-sizing: border-box;
  }

  .editor-pane :global(.toolbar) {
    border-radius: 0;
    border: none;
    border-bottom: 1px solid #ddd;
  }
</style>