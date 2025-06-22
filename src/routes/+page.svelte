<script lang="ts">
  import MarkdownEditor from '../lib/components/MarkdownEditor.svelte';
</script>

<main>
  <h1>Markdown editor</h1>
  <MarkdownEditor />
</main>

<style>
  main {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    color: #333;
    text-align: center;
    margin-bottom: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
</style>
