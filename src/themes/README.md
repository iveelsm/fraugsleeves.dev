# Uchu Theme

A dark syntax [shiki style theme](http://shiki.style/) based on the [uchu.style](https://uchu.style) color palette. The theme uses saturated mid-range colors from the uchu palette to provide bold, readable syntax highlighting similar to GitHub Dark.

## Color Palette

The theme is built using colors from the uchu color system, which uses OKLCH color space for perceptually uniform colors. The conversion for these colors was done through the converter at [oklch.com](https://oklch.com/).

### Base Colors

| Element     | Hex       | Description                       |
| ----------- | --------- | --------------------------------- |
| Background  | `#202225` | Deep neutral dark (uchu-yin-9)    |
| Foreground  | `#e3e5e5` | Light gray text (uchu-gray-2)     |
| White       | `#f0f0f2` | Bright white text (uchu-gray-1)   |
| Comments    | `#9b9b9d` | Muted gray, italic (uchu-gray-7)  |
| Punctuation | `#cbcdcd` | Subtle light gray (uchu-gray-4)   |

### Syntax Colors

| Element    | Hex       | Uchu Source   | Usage                                             |
| ---------- | --------- | ------------- | ------------------------------------------------- |
| Red        | `#ea3c65` | uchu-red-4    | Keywords, storage types, sizeof, import/export    |
| Purple     | `#ac83de` | uchu-purple-3 | Functions, classes, decorators, attributes        |
| Blue       | `#3984f2` | uchu-blue-4   | Constants, numbers, support constants, headings   |
| Blue Light | `#6aa2f5` | uchu-blue-3   | Strings, types, interfaces, support variables     |
| Green      | `#64d970` | uchu-green-4  | Tags (HTML/JSX), escape characters, CSS selectors |

## Token Mappings

### Keywords & Control Flow

- **Keywords** (`keyword`, `storage.type`, `storage.modifier`): Red `#ea3c65`
- **Import/Export** (`keyword.control.import`, `keyword.control.export`): Red `#ea3c65`
- **Operators**: Foreground `#e3e5e5`

### Functions & Types

- **Functions** (`entity.name.function`, `support.function`): Purple `#ac83de`
- **Classes** (`entity.name.class`, `support.class`): Purple `#ac83de`
- **Types** (`entity.name.type`, `support.type`): Light Blue `#6aa2f5`
- **Interfaces** (`entity.name.type.interface`): Light Blue `#6aa2f5`
- **Decorators** (`meta.decorator`): Purple `#ac83de`

### Data & Values

- **Strings** (`string`, `string.quoted`): Light Blue `#6aa2f5`
- **Numbers** (`constant.numeric`): Blue `#3984f2`
- **Constants** (`constant.language`, `variable.language`): Blue `#3984f2`
- **Support Constants** (`support.constant`): Blue `#3984f2`
- **Support Variables** (`support.variable`): Light Blue `#6aa2f5`
- **Object Properties** (`variable.other.property`): Foreground `#e3e5e5`

### Markup & Tags

- **HTML/JSX Tags** (`entity.name.tag`): Green `#64d970`
- **Tag Attributes** (`entity.other.attribute-name`): Purple `#ac83de`
- **Markdown Headings** (`markup.heading`): Blue `#3984f2`, bold
- **Markdown Code** (`markup.inline.raw`): Blue `#3984f2`

### Variables

- **Variables** (`variable`, `variable.other`): Foreground `#e3e5e5`
- **Parameters** (`variable.parameter`): White `#f0f0f2`

## Color Mapping

The following is the full set of color mappings for the [uchu.style](https://uchu.style). These should only be used in place where [oklch is not possible](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl).

### Yin and Yang

| name  | oklch                      | hex     |
| ----- | -------------------------- | ------- |
| yin   | oklch(14.38% 0.007 256.88) | #080a0d |
| yang  | oklch(99.4% 0 0)           | #fdfdfd |
| yin-1 | oklch(91.87% 0.003 264.54) | #e3e4e6 |
| yin-2 | oklch(84.61% 0.004 286.31) | #cccccf |
| yin-3 | oklch(76.89% 0.004 247.87) | #b2b4b6 |
| yin-4 | oklch(69.17% 0.004 247.88) | #9a9c9e |
| yin-5 | oklch(61.01% 0.005 271.34) | #828386 |
| yin-6 | oklch(52.79% 0.005 271.32) | #6a6b6e |
| yin-7 | oklch(43.87% 0.005 271.3)  | #515255 |
| yin-8 | oklch(35.02% 0.005 236.66) | #383b3d |
| yin-9 | oklch(25.11% 0.006 258.36) | #202225 |

### Grays

| name   | oklch                      | hex     |
| ------ | -------------------------- | ------- |
| gray-1 | oklch(95.57% 0.003 286.35) | #f0f0f2 |
| gray-2 | oklch(92.04% 0.002 197.12) | #e3e5e5 |
| gray-3 | oklch(88.28% 0.003 286.34) | #d8d8da |
| gray-4 | oklch(84.68% 0.002 197.12) | #cbcdcd |
| gray-5 | oklch(80.73% 0.002 247.84) | #bfc0c1 |
| gray-6 | oklch(75.03% 0.002 247.85) | #adaeaf |
| gray-7 | oklch(69.01% 0.003 286.32) | #9b9b9d |
| gray-8 | oklch(63.12% 0.004 219.55) | #878a8b |
| gray-9 | oklch(56.82% 0.004 247.89) | #757779 |

### Yellow

| name     | oklch                     | hex     |
| -------- | ------------------------- | ------- |
| yellow-1 | oklch(97.05% 0.039 91.2)  | #fff5d8 |
| yellow-2 | oklch(95% 0.07 92.39)     | #ffeeb9 |
| yellow-3 | oklch(92.76% 0.098 92.58) | #fee69a |
| yellow-4 | oklch(90.92% 0.125 92.56) | #fedf7b |
| yellow-5 | oklch(89% 0.146 91.5)     | #fed75c |
| yellow-6 | oklch(82.39% 0.133 91.5)  | #e5c255 |
| yellow-7 | oklch(75.84% 0.122 92.21) | #ccae4b |
| yellow-8 | oklch(69.14% 0.109 91.04) | #b59944 |
| yellow-9 | oklch(62.29% 0.097 91.9)  | #9c853c |

### Orange

| name     | oklch                     | hex     |
| -------- | ------------------------- | ------- |
| orange-1 | oklch(93.83% 0.037 56.93) | #ffe5d3 |
| orange-2 | oklch(88.37% 0.073 55.8)  | #ffcdab |
| orange-3 | oklch(83.56% 0.108 56.49) | #ffb783 |
| orange-4 | oklch(78.75% 0.142 54.33) | #ff9f5b |
| orange-5 | oklch(74.61% 0.171 51.56) | #ff8834 |
| orange-6 | oklch(69.33% 0.157 52.18) | #e67c2f |
| orange-7 | oklch(63.8% 0.142 52.1)   | #cd6f2c |
| orange-8 | oklch(58.28% 0.128 52.2)  | #b56227 |
| orange-9 | oklch(52.49% 0.113 51.98) | #9c5524 |

### Red

| name  | oklch                     | hex     |
| ----- | ------------------------- | ------- |
| red-1 | oklch(88.98% 0.052 3.28)  | #facdd7 |
| red-2 | oklch(78.78% 0.109 4.54)  | #f59cb1 |
| red-3 | oklch(69.86% 0.162 7.82)  | #ef6d8b |
| red-4 | oklch(62.73% 0.209 12.37) | #ea3c65 |
| red-5 | oklch(58.63% 0.231 19.6)  | #e50e3f |
| red-6 | oklch(54.41% 0.214 19.06) | #cf0c3a |
| red-7 | oklch(49.95% 0.195 18.34) | #b80c35 |
| red-8 | oklch(45.8% 0.177 17.7)   | #a30d30 |
| red-9 | oklch(41.17% 0.157 16.58) | #8c0c2b |

### Pink

| name   | oklch                      | hex     |
| ------ | -------------------------- | ------- |
| pink-1 | oklch(95.8% 0.023 354.27)  | #ffebf2 |
| pink-2 | oklch(92.14% 0.046 352.31) | #ffd9e8 |
| pink-3 | oklch(88.9% 0.066 354.39)  | #ffc9dd |
| pink-4 | oklch(85.43% 0.09 354.1)   | #ffb7d3 |
| pink-5 | oklch(82.23% 0.112 355.33) | #ffa6c8 |
| pink-6 | oklch(76.37% 0.101 355.37) | #e697b5 |
| pink-7 | oklch(70.23% 0.092 354.96) | #cd87a2 |
| pink-8 | oklch(64.11% 0.084 353.91) | #b57790 |
| pink-9 | oklch(57.68% 0.074 353.14) | #9c677d |

### Green

| name    | oklch                      | hex     |
| ------- | -------------------------- | ------- |
| green-1 | oklch(93.96% 0.05 148.74)  | #d5f5d9 |
| green-2 | oklch(88.77% 0.096 147.71) | #afecb6 |
| green-3 | oklch(83.74% 0.139 146.57) | #8ae293 |
| green-4 | oklch(79.33% 0.179 145.62) | #64d970 |
| green-5 | oklch(75.23% 0.209 144.64) | #3fcf4e |
| green-6 | oklch(70.03% 0.194 144.71) | #39bc47 |
| green-7 | oklch(64.24% 0.175 144.92) | #34a741 |
| green-8 | oklch(58.83% 0.158 145.05) | #2e943a |
| green-9 | oklch(52.77% 0.138 145.41) | #297f34 |

### Blue

| name   | oklch                      | hex     |
| ------ | -------------------------- | ------- |
| blue-1 | oklch(89.66% 0.046 260.67) | #ccdefc |
| blue-2 | oklch(80.17% 0.091 258.88) | #9bc0f9 |
| blue-3 | oklch(70.94% 0.136 258.06) | #6aa2f5 |
| blue-4 | oklch(62.39% 0.181 258.33) | #3984f2 |
| blue-5 | oklch(54.87% 0.222 260.33) | #0965ef |
| blue-6 | oklch(51.15% 0.204 260.17) | #085cd8 |
| blue-7 | oklch(47.36% 0.185 259.89) | #0853c1 |
| blue-8 | oklch(43.48% 0.17 260.2)   | #0949ac |
| blue-9 | oklch(39.53% 0.15 259.87)  | #084095 |

### Purple

| name     | oklch                      | hex     |
| -------- | -------------------------- | ------- |
| purple-1 | oklch(89.1% 0.046 305.24)  | #e2d4f4 |
| purple-2 | oklch(78.68% 0.091 305)    | #c7abe9 |
| purple-3 | oklch(68.5% 0.136 303.78)  | #ac83de |
| purple-4 | oklch(58.47% 0.181 302.06) | #915ad3 |
| purple-5 | oklch(49.39% 0.215 298.31) | #7532c8 |
| purple-6 | oklch(46.11% 0.198 298.4)  | #6a2eb5 |
| purple-7 | oklch(42.77% 0.181 298.49) | #5f2aa2 |
| purple-8 | oklch(39.46% 0.164 298.29) | #542690 |
| purple-9 | oklch(36.01% 0.145 298.35) | #49227d |

## Source

- Color palette: [uchu.style](https://uchu.style)
- Inspired by: GitHub Dark theme color assignments
