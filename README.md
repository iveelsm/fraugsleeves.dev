![typescript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![astro](https://img.shields.io/badge/astro-%232C2052.svg?style=for-the-badge&logo=astro&logoColor=white)
[![build](https://github.com/iveelsm/fraugsleeves.dev/actions/workflows/build.yml/badge.svg)](https://github.com/iveelsm/fraugsleeves.dev/actions/workflows/build.yml?branch=main)
[![deploy](https://github.com/iveelsm/fraugsleeves.dev/actions/workflows/deploy.yml/badge.svg)](https://github.com/iveelsm/fraugsleeves.dev/actions/workflows/deploy.yml?branch=main)

# fraugsleeves.dev

Personal Blog for Mikey Sleevi

## Overview

fraugsleeves.dev is a personal blog built with [Astro](https://astro.build/), featuring technical articles, architectural guides, and wayfinders for various topics. The site is organized into blog posts and wayfinder guides, with a focus on deep technical content for experienced developers.

## Features

- Blog posts on software architecture, microservices, and programming best practices
- Wayfinder guides for deep dives into topics like Node.js
- Search functionality powered by [astro-pagefind](https://github.com/astro-community/astro-pagefind)
- Modern, component-based layouts and navigation

## Getting Started

### Development

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:4321](http://localhost:4321) to view the site locally.

### Build

To build for deployment:

```bash
npm run build
```

You can review the deployment build with:

```bash
npm run preview
```

### Testing

> [!NOTE]
> The end to end test suite requires `libavif16` on Linux to support the Desktop and Mobile Safari tests. The system will ignore tests if the requirements are not met.

You can run the unit test suite with the following command.

```bash
npm run test
```

And to exercise the javascript which runs client side, run the end to end test suite with the following.

```bash
npm run test:e2e
```
