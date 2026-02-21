# Uchu Theme

A dark syntax [shiki style theme](http://shiki.style/) based on the [uchu.style](https://uchu.style) color palette. The theme uses saturated mid-range colors from the uchu palette to provide bold, readable syntax highlighting similar to GitHub Dark.

## Color Palette

The theme is built using colors from the uchu color system, which uses OKLCH color space for perceptually uniform colors. The conversion for these colors was done through the converter at [oklch.com](https://oklch.com/).

### Base Colors

| Element | Hex | Description |
|---------|-----|-------------|
| Background | `#202225` | Deep neutral dark (uchu-yin-9) |
| Foreground | `#e3e5e5` | Light gray text (uchu-gray-2) |
| Comments | `#9b9b9d` | Muted gray, italic (uchu-gray-7) |
| Punctuation | `#c8c9cb` | Subtle light gray (uchu-gray-4) |

### Syntax Colors

| Element | Hex | Uchu Source | Usage |
|---------|-----|-------------|-------|
| Red | `#e8626a` | uchu-red-4 | Keywords, storage types, import/export |
| Purple | `#a371e8` | uchu-purple-4 | Functions, classes, types, decorators, attributes |
| Blue | `#5ba3e0` | uchu-blue-4 | Constants, numbers, properties, headings |
| Blue Light | `#6aa2f5` | uchu-blue-3 | Strings, regex |
| Green | `#5ebd6a` | uchu-green-5 | Tags (HTML/JSX), escape characters, CSS selectors |

## Token Mappings

### Keywords & Control Flow
- **Keywords** (`keyword`, `storage.type`, `storage.modifier`): Red `#e8626a`
- **Import/Export** (`keyword.control.import`, `keyword.control.export`): Red `#e8626a`
- **Operators**: Foreground `#e3e5e5`

### Functions & Types
- **Functions** (`entity.name.function`, `support.function`): Purple `#a371e8`
- **Classes & Types** (`entity.name.class`, `support.type`): Purple `#a371e8`
- **Interfaces** (`entity.name.type.interface`): Purple `#a371e8`
- **Decorators** (`meta.decorator`): Purple `#a371e8`

### Data & Values
- **Strings** (`string`, `string.quoted`): Light Blue `#6aa2f5`
- **Numbers** (`constant.numeric`): Blue `#5ba3e0`
- **Constants** (`constant.language`, `variable.language`): Blue `#5ba3e0`
- **Object Properties** (`variable.other.property`): Blue `#5ba3e0`

### Markup & Tags
- **HTML/JSX Tags** (`entity.name.tag`): Green `#5ebd6a`
- **Tag Attributes** (`entity.other.attribute-name`): Purple `#a371e8`
- **Markdown Headings** (`markup.heading`): Blue `#5ba3e0`, bold
- **Markdown Code** (`markup.inline.raw`): Blue `#5ba3e0`

### Variables
- **Variables** (`variable`, `variable.other`): Foreground `#e3e5e5`
- **Parameters** (`variable.parameter`): Foreground `#e3e5e5`

## Color Mapping

The following is the full set of color mappings for the [uchu.style](https://uchu.style). These should only be used in place where [oklch is not possible](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl).


### Yin and Yang

|  name  |           oklch            |   hex   |
| -----  | -------------------------- | ------- |
| yin    | oklch(14.38% 0.007 256.88) |         |
| yang   | oklch(99.4% 0 0)           |         |
| yin-1  | oklch(91.87% 0.003 264.54) |         |
| yin-2  | oklch(84.61% 0.004 286.31) |         |
| yin-3  | oklch(76.89% 0.004 247.87) |         |
| yin-4  | oklch(69.17% 0.004 247.88) |         |
| yin-5  | oklch(61.01% 0.005 271.34) |         |
| yin-6  | oklch(52.79% 0.005 271.32) |         |
| yin-7  | oklch(43.87% 0.005 271.3)  |         |
| yin-8  | oklch(35.02% 0.005 236.66) |         |
| yin-9  | oklch(25.11% 0.006 258.36) |         |


### Grays

|  name  |           oklch            |   hex   |
| -----  | -------------------------- | ------- |
| gray-1 | oklch(95.57% 0.003 286.35) |         |
| gray-2 | oklch(92.04% 0.002 197.12) |         |
| gray-3 | oklch(88.28% 0.003 286.34) |         |
| gray-4 | oklch(84.68% 0.002 197.12) |         |
| gray-5 | oklch(80.73% 0.002 247.84) |         |
| gray-6 | oklch(75.03% 0.002 247.85) |         |
| gray-7 | oklch(69.01% 0.003 286.32) |         |
| gray-8 | oklch(63.12% 0.004 219.55) |         |
| gray-9 | oklch(56.82% 0.004 247.89) |         |

### Yellow

|   name   |           oklch           |   hex   |
| -------  | ------------------------- | ------- |
| yellow-1 | oklch(97.05% 0.039 91.2)  |         |
| yellow-2 | oklch(95% 0.07 92.39)     |         |
| yellow-3 | oklch(92.76% 0.098 92.58) |         |
| yellow-4 | oklch(90.92% 0.125 92.56) |         |
| yellow-5 | oklch(89% 0.146 91.5)     |         |
| yellow-6 | oklch(82.39% 0.133 91.5)  |         |
| yellow-7 | oklch(75.84% 0.122 92.21) |         |
| yellow-8 | oklch(69.14% 0.109 91.04) |         |
| yellow-9 | oklch(62.29% 0.097 91.9)  |         |

### Orange

|   name   |           oklch           |   hex   |
| -------- | ------------------------- | ------- |
| orange-1 | oklch(93.83% 0.037 56.93) |         |
| orange-2 | oklch(88.37% 0.073 55.8)  |         |
| orange-3 | oklch(83.56% 0.108 56.49) |         |
| orange-4 | oklch(78.75% 0.142 54.33) |         |
| orange-5 | oklch(74.61% 0.171 51.56) |         |
| orange-6 | oklch(69.33% 0.157 52.18) |         |
| orange-7 | oklch(63.8% 0.142 52.1)   |         |
| orange-8 | oklch(58.28% 0.128 52.2)  |         |
| orange-9 | oklch(52.49% 0.113 51.98) |         |

### Red

|  name |           oklch            |   hex   |
| ----- | -------------------------- | ------- |
| red-1 | oklch(88.98% 0.052 3.28)   |         |
| red-2 | oklch(78.78% 0.109 4.54)   |         |
| red-3 | oklch(69.86% 0.162 7.82)   |         |
| red-4 | oklch(62.73% 0.209 12.37)  |         |
| red-5 | oklch(58.63% 0.231 19.6)   |         |
| red-6 | oklch(54.41% 0.214 19.06)  |         |
| red-7 | oklch(49.95% 0.195 18.34)  |         |
| red-8 | oklch(45.8% 0.177 17.7)    |         |
| red-9 | oklch(41.17% 0.157 16.58)  |         |

### Pink

|  name  |           oklch            |   hex   |
| ------ | -------------------------- | ------- |
| pink-1 | oklch(95.8% 0.023 354.27)  |         |
| pink-2 | oklch(92.14% 0.046 352.31) |         |
| pink-3 | oklch(88.9% 0.066 354.39)  |         |
| pink-4 | oklch(85.43% 0.09 354.1)   |         |
| pink-5 | oklch(82.23% 0.112 355.33) |         |
| pink-6 | oklch(76.37% 0.101 355.37) |         |
| pink-7 | oklch(70.23% 0.092 354.96) |         |
| pink-8 | oklch(64.11% 0.084 353.91) |         |
| pink-9 | oklch(57.68% 0.074 353.14) |         |

### Green

|   name  |           oklch            |   hex   |
| ------- | -------------------------- | ------- |
| green-1 | oklch(93.96% 0.05 148.74)  |         |
| green-2 | oklch(88.77% 0.096 147.71) |         |
| green-3 | oklch(83.74% 0.139 146.57) |         |
| green-4 | oklch(79.33% 0.179 145.62) |         |
| green-5 | oklch(75.23% 0.209 144.64) |         |
| green-6 | oklch(70.03% 0.194 144.71) |         |
| green-7 | oklch(64.24% 0.175 144.92) |         |
| green-8 | oklch(58.83% 0.158 145.05) |         |
| green-9 | oklch(52.77% 0.138 145.41) |         |

### Blue

|  name  |           oklch            |   hex   |
| -----  | -------------------------- | ------- |
| blue-1 | oklch(89.66% 0.046 260.67) |         |
| blue-2 | oklch(80.17% 0.091 258.88) |         |
| blue-3 | oklch(70.94% 0.136 258.06) |         |
| blue-4 | oklch(62.39% 0.181 258.33) |         |
| blue-5 | oklch(54.87% 0.222 260.33) |         |
| blue-6 | oklch(51.15% 0.204 260.17) |         |
| blue-7 | oklch(47.36% 0.185 259.89) |         |
| blue-8 | oklch(43.48% 0.17 260.2)   |         |
| blue-9 | oklch(39.53% 0.15 259.87)  |         |



### Purple

|   name   |           oklch            |   hex   |
| -------- | -------------------------- | ------- |
| purple-1 | oklch(89.1% 0.046 305.24)  |         |
| purple-2 | oklch(78.68% 0.091 305)    |         |
| purple-3 | oklch(68.5% 0.136 303.78)  |         |
| purple-4 | oklch(58.47% 0.181 302.06) |         |
| purple-5 | oklch(49.39% 0.215 298.31) |         |
| purple-6 | oklch(46.11% 0.198 298.4)  |         |
| purple-7 | oklch(42.77% 0.181 298.49) |         |
| purple-8 | oklch(39.46% 0.164 298.29) |         |
| purple-9 | oklch(36.01% 0.145 298.35) |         |

## Source

- Color palette: [uchu.style](https://uchu.style)
- Inspired by: GitHub Dark theme color assignments
