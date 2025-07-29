# Privacy Policy Analyzer Icons

This directory contains the icons for the Privacy Policy Analyzer Chrome extension.

## Icon Design

The icons feature a modern shield design with:
- **Shield Shape**: Represents privacy protection and security
- **Lock Symbol**: Indicates data security and access control  
- **Gradient Colors**: Modern purple-blue gradient (#667eea to #764ba2)
- **Privacy Dots**: Green indicator dots showing active privacy monitoring
- **Clean Background**: White circular background for clarity

## Required Sizes

Chrome extensions require icons in multiple sizes:

- **16x16px** (`icon16.png`) - Extension toolbar icon (small)
- **32x32px** (`icon32.png`) - Extension management page
- **48x48px** (`icon48.png`) - Extension management page (medium)
- **128x128px** (`icon128.png`) - Chrome Web Store and extension management (large)

## Converting SVG to PNG

### Method 1: Using the Conversion Script (Recommended)

```bash
# Run the automated conversion script
./convert-icons.sh
```

This script will automatically detect and use either ImageMagick or Inkscape to convert the SVG files to PNG.

### Method 2: Manual Conversion with ImageMagick

```bash
# Install ImageMagick
brew install imagemagick  # macOS
# sudo apt install imagemagick  # Ubuntu/Debian

# Convert each size
convert icon16.svg -resize 16x16 icon16.png
convert icon32.svg -resize 32x32 icon32.png  
convert icon48.svg -resize 48x48 icon48.png
convert icon128.svg -resize 128x128 icon128.png
```

### Method 3: Manual Conversion with Inkscape

```bash
# Install Inkscape
brew install inkscape  # macOS
# sudo apt install inkscape  # Ubuntu/Debian

# Convert each size
inkscape icon16.svg --export-filename=icon16.png --export-width=16 --export-height=16
inkscape icon32.svg --export-filename=icon32.png --export-width=32 --export-height=32
inkscape icon48.svg --export-filename=icon48.png --export-width=48 --export-height=48
inkscape icon128.svg --export-filename=icon128.png --export-width=128 --export-height=128
```

### Method 4: Online Conversion

If you don't want to install software, use an online converter:
- [Convertio](https://convertio.co/svg-png/)
- [CloudConvert](https://cloudconvert.com/svg-to-png)

Upload each SVG file and download the PNG version.

## Files in this Directory

- `icon.svg` - Master SVG icon file  
- `icon16.svg` - 16px optimized SVG
- `icon32.svg` - 32px optimized SVG
- `icon48.svg` - 48px optimized SVG
- `icon128.svg` - 128px optimized SVG
- `icon16.png` - 16px PNG (after conversion)
- `icon32.png` - 32px PNG (after conversion)
- `icon48.png` - 48px PNG (after conversion)
- `icon128.png` - 128px PNG (after conversion)

## Design Guidelines

The icons follow Chrome extension best practices:
- **High contrast** for visibility at small sizes
- **Simple design** that's recognizable at 16px
- **Consistent visual style** across all sizes
- **Professional appearance** suitable for the Chrome Web Store
- **Privacy-focused symbolism** appropriate for the extension's purpose

## Customization

To modify the icons:
1. Edit the SVG files with any vector graphics editor
2. Maintain the same dimensions and proportions
3. Re-run the conversion script to generate new PNG files
4. Test the icons at all sizes to ensure clarity
