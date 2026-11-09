(function (root) {
  "use strict";

  const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
  const PLAYLIST_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
  const YOUTUBE_HOSTS = new Set([
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtu.be",
    "youtube-nocookie.com",
    "www.youtube-nocookie.com",
  ]);

  function parseYouTubeUrl(input) {
    if (typeof input !== "string" || !input.trim()) return null;

    const value = input.trim();
    const normalized = /^[a-z][a-z\d+.-]*:\/\//i.test(value)
      ? value
      : `https://${value}`;

    try {
      const url = new URL(normalized);
      return YOUTUBE_HOSTS.has(url.hostname.toLowerCase()) ? url : null;
    } catch {
      return null;
    }
  }

  function extractVideoId(input) {
    if (typeof input !== "string") return null;
    const value = input.trim();
    if (VIDEO_ID_PATTERN.test(value)) return value;

    const url = parseYouTubeUrl(value);
    if (!url) return null;

    let candidate = null;
    if (url.hostname.toLowerCase() === "youtu.be") {
      candidate = url.pathname.split("/").filter(Boolean)[0] || null;
    } else if (url.pathname === "/watch") {
      candidate = url.searchParams.get("v");
    } else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
      candidate = match ? match[1] : null;
    }

    return candidate && VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
  }

  function extractPlaylistId(input) {
    const url = parseYouTubeUrl(input);
    if (!url) return null;

    const candidate = url.searchParams.get("list");
    return candidate && PLAYLIST_ID_PATTERN.test(candidate) ? candidate : null;
  }

  function parseTimestamp(input) {
    if (typeof input !== "string" && typeof input !== "number") return null;
    const value = String(input).trim();
    if (!value) return null;

    if (!value.includes(":")) {
      if (!/^\d+(?:\.\d+)?$/.test(value)) return null;
      const seconds = Number(value);
      return Number.isFinite(seconds) ? seconds : null;
    }

    const parts = value.split(":");
    if ((parts.length !== 2 && parts.length !== 3) || parts.some(part => !/^\d+$/.test(part))) {
      return null;
    }

    const values = parts.map(Number);
    const seconds = values[values.length - 1];
    const minutes = values[values.length - 2];
    if (seconds >= 60 || (parts.length === 3 && minutes >= 60)) return null;

    return parts.length === 2
      ? minutes * 60 + seconds
      : values[0] * 3600 + minutes * 60 + seconds;
  }

  const api = { extractVideoId, extractPlaylistId, parseTimestamp };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) Object.assign(root, api);
})(typeof globalThis !== "undefined" ? globalThis : this);
