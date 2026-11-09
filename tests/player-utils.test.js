const test = require("node:test");
const assert = require("node:assert/strict");
const {
  extractVideoId,
  extractPlaylistId,
  parseTimestamp,
} = require("../player-utils");

const VIDEO_ID = "dQw4w9WgXcQ";

test("extracts a raw YouTube video ID", () => {
  assert.equal(extractVideoId(VIDEO_ID), VIDEO_ID);
});

test("extracts video IDs from supported YouTube URL formats", () => {
  assert.equal(extractVideoId(`https://www.youtube.com/watch?feature=share&v=${VIDEO_ID}`), VIDEO_ID);
  assert.equal(extractVideoId(`https://youtu.be/${VIDEO_ID}?si=abc`), VIDEO_ID);
  assert.equal(extractVideoId(`https://youtube.com/shorts/${VIDEO_ID}`), VIDEO_ID);
  assert.equal(extractVideoId(`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`), VIDEO_ID);
});

test("rejects non-YouTube hosts and malformed video IDs", () => {
  assert.equal(extractVideoId(`https://example.com/watch?v=${VIDEO_ID}`), null);
  assert.equal(extractVideoId(`https://youtube.com.evil.example/watch?v=${VIDEO_ID}`), null);
  assert.equal(extractVideoId("https://youtube.com/watch?v=short"), null);
});

test("extracts playlist IDs only from supported YouTube URLs", () => {
  assert.equal(extractPlaylistId("https://www.youtube.com/playlist?list=PLabc_123"), "PLabc_123");
  assert.equal(extractPlaylistId("https://example.com/?list=PLabc_123"), null);
});

test("parses seconds, MM:SS, and HH:MM:SS", () => {
  assert.equal(parseTimestamp("75"), 75);
  assert.equal(parseTimestamp("1:15"), 75);
  assert.equal(parseTimestamp("1:02:03"), 3723);
  assert.equal(parseTimestamp("1.5"), 1.5);
});

test("rejects malformed and out-of-range timestamps", () => {
  for (const value of ["", "1::2", "1:60", "1:2:60", "1:2:3:4", "-5", "Infinity", "abc"]) {
    assert.equal(parseTimestamp(value), null, `expected ${JSON.stringify(value)} to be rejected`);
  }
});
