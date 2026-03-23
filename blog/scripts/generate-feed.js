#!/usr/bin/env node
// Generates blog/feed.xml from blog/blog.json + blog/posts/*.md

const fs = require('fs');
const path = require('path');

const blogDir = path.resolve(__dirname, '..');
const posts = JSON.parse(fs.readFileSync(path.join(blogDir, 'blog.json'), 'utf8'));
const siteUrl = 'https://www.mjjsmith.com';

// Sort newest first
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

function escapeXml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function toRfc822(dateStr) {
    const d = new Date(dateStr + 'T00:00:00Z');
    return d.toUTCString();
}

function getPostContent(slug) {
    const mdPath = path.join(blogDir, 'posts', slug + '.md');
    if (!fs.existsSync(mdPath)) return '';
    return fs.readFileSync(mdPath, 'utf8').trim();
}

function getSummary(text) {
    const first = text.split(/\n\n/)[0].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    return first.length > 300 ? first.slice(0, 297) + '...' : first;
}

const items = posts.map(post => {
    const content = getPostContent(post.slug);
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/#${post.slug}</link>
      <guid>${siteUrl}/blog/#${post.slug}</guid>
      <pubDate>${toRfc822(post.date)}</pubDate>
      <description>${escapeXml(getSummary(content))}</description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
    </item>`;
}).join('\n');

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Michael J. Smith - Terminal Blog</title>
    <link>${siteUrl}/blog/</link>
    <description>Blog posts from mjjsmith.com</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(blogDir, 'feed.xml'), feed);
console.log('feed.xml generated with ' + posts.length + ' post(s).');
