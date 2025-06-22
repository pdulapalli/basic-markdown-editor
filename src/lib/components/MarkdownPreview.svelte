<script lang="ts">
  import { marked } from 'marked';
  
  export let content: string = '';
  
  $: htmlContent = marked(content);
</script>

<div class="markdown-preview">
  {@html htmlContent}
</div>

<style>
  .markdown-preview {
    padding: 1rem;
    background: #fafafa;
    border: none;
    border-radius: 0;
    flex: 1;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    overflow-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
  }
  
  .markdown-preview :global(h1),
  .markdown-preview :global(h2),
  .markdown-preview :global(h3),
  .markdown-preview :global(h4),
  .markdown-preview :global(h5),
  .markdown-preview :global(h6) {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .markdown-preview :global(h1) {
    border-bottom: 2px solid #eee;
    padding-bottom: 0.3rem;
  }
  
  .markdown-preview :global(h2) {
    border-bottom: 1px solid #eee;
    padding-bottom: 0.2rem;
  }
  
  .markdown-preview :global(p) {
    margin-bottom: 1rem;
  }
  
  .markdown-preview :global(ul),
  .markdown-preview :global(ol) {
    margin-bottom: 1rem;
    padding-left: 2rem;
  }
  
  .markdown-preview :global(li) {
    margin-bottom: 0.25rem;
  }
  
  .markdown-preview :global(blockquote) {
    border-left: 4px solid #dfe2e5;
    padding-left: 1rem;
    margin: 1rem 0;
    color: #6a737d;
  }
  
  .markdown-preview :global(code) {
    background: #f6f8fa;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }
  
  .markdown-preview :global(pre) {
    background: #f6f8fa;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1rem 0;
  }
  
  .markdown-preview :global(pre code) {
    background: none;
    padding: 0;
  }
  
  .markdown-preview :global(a) {
    color: #0366d6;
    text-decoration: none;
  }
  
  .markdown-preview :global(a:hover) {
    text-decoration: underline;
  }
  
  .markdown-preview :global(table) {
    border-collapse: collapse;
    margin: 1rem 0;
    width: 100%;
  }
  
  .markdown-preview :global(th),
  .markdown-preview :global(td) {
    border: 1px solid #dfe2e5;
    padding: 0.5rem;
    text-align: left;
  }
  
  .markdown-preview :global(th) {
    background: #f6f8fa;
    font-weight: 600;
  }
</style>