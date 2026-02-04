<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <style>
          @font-face {
            font-family: 'Berkeley Mono Variable';
            src: local('Berkeley Mono Variable');
          }

          *,
          *::before,
          *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          :root {
            --color-bg: oklch(99.4% 0 0);
            --color-bg-alt: oklch(95.57% 0.003 286.35);
            --color-text: oklch(43.87% 0.005 271.3);
            --color-text-heading: oklch(14.38% 0.007 256.88);
            --color-text-muted: oklch(43.87% 0.005 271.3);
            --color-border: oklch(84.68% 0.002 197.12);
            --color-border-dark: oklch(75.03% 0.002 247.85);
            --color-accent: oklch(54.87% 0.222 260.33);
            --color-accent-bg: oklch(89.66% 0.046 260.67);
            --color-dot: oklch(92.04% 0.002 197.12);
          }

          html {
            font-family: 'Berkeley Mono Variable', ui-monospace, SFMono-Regular, Monaco, Consolas, monospace;
            font-size: 16px;
            font-weight: 100;
            line-height: 1.65;
            background-color: var(--color-bg);
            color: var(--color-text);
          }

          body {
            min-height: 100vh;
            background-image: radial-gradient(var(--color-dot) 1px, transparent 1px);
            background-size: 16px 16px;
            background-attachment: fixed;
          }

          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
          }

          .rss-header {
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--color-border);
          }

          .rss-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--color-accent-bg);
            border: 1px solid var(--color-accent);
            border-radius: 6px;
            margin-bottom: 1rem;
            font-size: 0.85rem;
            color: var(--color-accent);
          }

          .rss-badge svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
          }

          .rss-title {
            font-size: 1.75rem;
            font-weight: 600;
            color: var(--color-text-heading);
            margin-bottom: 0.5rem;
          }

          .rss-description {
            color: var(--color-text-muted);
            font-size: 1rem;
          }

          .rss-info {
            margin-top: 1rem;
            padding: 1rem;
            background: var(--color-bg-alt);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            font-size: 0.85rem;
            color: var(--color-text-muted);
          }

          .rss-info code {
            background: var(--color-bg);
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            font-size: 0.85rem;
          }

          .posts-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .post-item {
            padding: 1.5rem;
            background: var(--color-bg-alt);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            transition: all 0.2s ease;
          }

          .post-item:hover {
            border-color: var(--color-border-dark);
            box-shadow: 0 2px 8px oklch(0% 0 0 / 0.08);
          }

          .post-link {
            text-decoration: none;
            color: inherit;
          }

          .post-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--color-text-heading);
            margin-bottom: 0.5rem;
            transition: color 0.2s ease;
          }

          .post-item:hover .post-title {
            color: var(--color-accent);
          }

          .post-date {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            margin-bottom: 0.5rem;
          }

          .post-description {
            font-size: 0.85rem;
            color: var(--color-text);
            line-height: 1.5;
          }

          @media (max-width: 640px) {
            .container {
              padding: 1.5rem;
            }

            .rss-title {
              font-size: 1.5rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header class="rss-header">
            <div class="rss-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
              </svg>
              RSS Feed
            </div>
            <h1 class="rss-title"><xsl:value-of select="/rss/channel/title"/></h1>
            <p class="rss-description"><xsl:value-of select="/rss/channel/description"/></p>
            <div class="rss-info">
              <p>This is an RSS feed. Subscribe by copying the URL into your RSS reader. New posts will be delivered to your reader automatically.</p>
            </div>
          </header>

          <ul class="posts-list">
            <xsl:for-each select="/rss/channel/item">
              <li class="post-item">
                <a class="post-link">
                  <xsl:attribute name="href">
                    <xsl:value-of select="link"/>
                  </xsl:attribute>
                  <h2 class="post-title"><xsl:value-of select="title"/></h2>
                  <p class="post-date">
                    <xsl:value-of select="pubDate"/>
                  </p>
                  <p class="post-description"><xsl:value-of select="description"/></p>
                </a>
              </li>
            </xsl:for-each>
          </ul>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
