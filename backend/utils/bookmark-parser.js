/**
 * Parse Chrome bookmark HTML file
 * Extracts URLs, titles, and folder structure
 */
function parseBookmarks(html) {
  const bookmarks = [];

  // Match <DT><A HREF="url" ...>Title</A> patterns
  // Also capture the parent folder context
  const lines = html.split('\n');
  const folderStack = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect folder start: <DT><H3 ...>Folder Name</H3>
    const folderMatch = line.match(/<DT><H3[^>]*>(.*?)<\/H3>/i);
    if (folderMatch) {
      folderStack.push(folderMatch[1]);
      continue;
    }

    // Detect folder end: </DL><p>
    if (line.match(/<\/DL>/i)) {
      folderStack.pop();
      continue;
    }

    // Detect bookmark: <DT><A HREF="url" ...>Title</A>
    const linkMatch = line.match(/<DT><A\s+HREF="([^"]+)"[^>]*>(.*?)<\/A>/i);
    if (linkMatch) {
      const url = linkMatch[1];
      const title = linkMatch[2];

      // Only include http/https URLs
      if (url.startsWith('http://') || url.startsWith('https://')) {
        bookmarks.push({
          url: url,
          title: title,
          folder: folderStack.length > 0 ? folderStack[folderStack.length - 1] : 'Uncategorized',
          full_path: folderStack.join(' > ') || 'Root',
        });
      }
    }
  }

  return bookmarks;
}

module.exports = { parseBookmarks };
