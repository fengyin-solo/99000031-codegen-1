/**
 * Check if a URL is alive using fetch with timeout
 * Returns: { url, status, alive, error }
 */
async function checkUrl(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeoutId);

    const alive = response.status >= 200 && response.status < 400;
    return {
      url,
      status: response.status,
      alive,
      error: null,
    };
  } catch (err) {
    clearTimeout(timeoutId);

    // If HEAD fails, try GET as some servers don't support HEAD
    if (err.name !== 'AbortError') {
      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), timeoutMs);

        const response = await fetch(url, {
          method: 'GET',
          signal: controller2.signal,
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
        });

        clearTimeout(timeoutId2);

        const alive = response.status >= 200 && response.status < 400;
        return {
          url,
          status: response.status,
          alive,
          error: null,
        };
      } catch (err2) {
        // Fall through to error handling
      }
    }

    return {
      url,
      status: null,
      alive: false,
      error: err.name === 'AbortError' ? 'Timeout' : err.message,
    };
  }
}

/**
 * Check multiple URLs one at a time
 * @param {string[]} urls
 * @param {function} onProgress - callback(current, total, result)
 */
async function checkUrls(urls, onProgress = null) {
  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const result = await checkUrl(urls[i]);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, urls.length, result);
    }
  }

  return results;
}

module.exports = { checkUrl, checkUrls };
