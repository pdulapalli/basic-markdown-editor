import { marked } from 'marked';
import { expect, test } from 'vitest';

test('marked library converts basic markdown', () => {
  const input = '# Hello World\n\nThis is **bold** text.';
  const output = marked(input);
  
  expect(output).toContain('<h1>Hello World</h1>');
  expect(output).toContain('<strong>bold</strong>');
});

test('marked library handles code blocks', () => {
  const input = '```javascript\nconsole.log("hello");\n```';
  const output = marked(input);
  
  expect(output).toContain('<pre>');
  expect(output).toContain('<code');
  expect(output).toContain('console.log');
});

test('marked library handles lists', () => {
  const input = '- Item 1\n- Item 2\n\n1. First\n2. Second';
  const output = marked(input);
  
  expect(output).toContain('<ul>');
  expect(output).toContain('<ol>');
  expect(output).toContain('<li>Item 1</li>');
  expect(output).toContain('<li>First</li>');
});

test('marked library handles links', () => {
  const input = '[Svelte](https://svelte.dev)';
  const output = marked(input);
  
  expect(output).toContain('<a href="https://svelte.dev">Svelte</a>');
});

test('marked library handles blockquotes', () => {
  const input = '> This is a quote';
  const output = marked(input);
  
  expect(output).toContain('<blockquote>');
  expect(output).toContain('<p>This is a quote</p>');
});