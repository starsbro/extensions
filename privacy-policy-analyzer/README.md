# Privacy Policy Analyzer Chrome Extension

A powerful Chrome extension that uses AI to analyze privacy policies and highlight concerning clauses with legal suggestions.

## Features

- **🔍 Automatic Detection**: Detects privacy policies and terms of service pages automatically
- **🚨 Smart Analysis**: AI-powered analysis to identify concerning data practices
- **💡 Legal Suggestions**: Provides actionable legal advice for each identified issue
- **🎯 Visual Highlights**: Color-coded highlighting of problematic text on the page
- **⚙️ Customizable**: Configurable analysis depth and highlight preferences

## Installation

### From Source (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/starsbro/extensions.git
   cd extensions/privacy-policy-analyzer
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in the top right corner)

4. Click "Load unpacked" and select the `privacy-policy-analyzer` folder

5. The extension should now appear in your extensions list and toolbar

### From Chrome Web Store

*Coming soon - the extension will be available on the Chrome Web Store after review.*

## How to Use

### Automatic Analysis
1. Visit any privacy policy page (the extension will detect it automatically)
2. Look for the floating prompt that appears
3. Click "Analyze" to start the analysis

### Manual Analysis
1. Click the extension icon in your Chrome toolbar
2. Click "Analyze Current Page"
3. Wait for the analysis to complete
4. View results by clicking "View Analysis Results"

### Understanding Results

The extension categorizes issues by severity:
- **🔴 High Priority**: Critical privacy concerns (data sharing, indefinite retention)
- **🟡 Medium Priority**: Moderate concerns (tracking, policy changes)
- **🟢 Low Priority**: Minor issues or unclear language

Each issue includes:
- **Description**: What the problem is
- **Legal Suggestion**: Actionable advice
- **Context**: Where the issue was found in the policy

## Privacy Patterns Detected

The extension identifies common concerning patterns:

### Data Sharing
- Third-party data sharing or selling
- Broad sharing with "partners" or "affiliates"
- Vague data transfer language

### Data Retention
- Indefinite or permanent data storage
- Unclear retention periods
- No deletion guarantees

### User Rights
- Limited access to your data
- Restricted deletion rights
- No data portability options

### Security
- Vague security measures
- No encryption guarantees
- "Reasonable efforts" language

### Policy Changes
- Unilateral policy modifications
- No notice requirements
- Automatic consent assumptions

## Configuration

Access settings by:
1. Right-clicking the extension icon → "Options"
2. Or clicking "Settings" in the popup

### Available Settings

- **Auto-Analyze**: Automatically detect and prompt on privacy policy pages
- **Show Prompts**: Display floating prompts on detected pages
- **Analysis Depth**: Choose between Quick, Standard, or Deep analysis
- **Highlight Severity**: Select which issue types to highlight
- **AI Provider**: Choose analysis engine (more options coming soon)

## Technical Architecture

### Components

1. **Manifest (manifest.json)**: Extension configuration and permissions
2. **Background Script (background.js)**: Handles extension lifecycle and storage
3. **Content Script (content.js)**: Analyzes pages and manages UI
4. **Popup (popup.html/js)**: Extension toolbar interface
5. **Options Page (options.html/js)**: Settings configuration
6. **Styles (content.css)**: Visual styling for injected elements

### How Analysis Works

1. **Text Extraction**: Removes navigation, ads, and other noise
2. **Pattern Matching**: Uses regex patterns to identify concerning language
3. **Context Analysis**: Extracts surrounding text for better understanding
4. **Severity Assessment**: Categorizes issues by privacy impact
5. **Legal Mapping**: Provides relevant legal suggestions

### Storage

The extension uses Chrome's storage API:
- **Sync Storage**: User settings (synced across devices)
- **Local Storage**: Analysis results (per-tab, temporary)

## Development

### Prerequisites

- Node.js (for development tools)
- Chrome browser
- Basic knowledge of JavaScript/HTML/CSS

### File Structure

```
privacy-policy-analyzer/
├── manifest.json          # Extension manifest
├── background.js          # Background service worker
├── content.js            # Content script for page analysis
├── content.css          # Styles for injected elements
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
├── options.html         # Settings page
├── options.js           # Settings functionality
├── welcome.html         # Welcome page for new users
├── convert-icons.sh     # Icon conversion script
├── icons/               # Extension icons
│   ├── icon.svg         # Master SVG icon
│   ├── icon16.svg       # 16px SVG icon
│   ├── icon32.svg       # 32px SVG icon
│   ├── icon48.svg       # 48px SVG icon
│   ├── icon128.svg      # 128px SVG icon
│   ├── icon16.png       # 16px PNG icon (after conversion)
│   ├── icon32.png       # 32px PNG icon (after conversion)
│   ├── icon48.png       # 48px PNG icon (after conversion)
│   ├── icon128.png      # 128px PNG icon (after conversion)
│   └── README.md        # Icon documentation
└── README.md            # This file
```

### Converting Icons to PNG

The extension includes SVG icon files that need to be converted to PNG format. You have several options:

#### Option 1: Automated Script (Recommended)
```bash
# Run the conversion script
./convert-icons.sh
```

#### Option 2: Install ImageMagick
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian  
sudo apt install imagemagick

# Then run the conversion script
./convert-icons.sh
```

#### Option 3: Online Conversion
Upload the SVG files to an online converter:
- [Convertio](https://convertio.co/svg-png/)
- [CloudConvert](https://cloudconvert.com/svg-to-png)

Save the converted PNG files in the `icons/` directory with the correct names:
- `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`

### Adding New Analysis Patterns

To add new privacy concern patterns, edit the `detectCommonIssues` function in `content.js`:

```javascript
const patterns = [
  {
    id: 'unique_pattern_id',
    pattern: /regex_pattern/gi,
    severity: 'high|medium|low',
    category: 'Category Name',
    title: 'Issue Title',
    description: 'User-friendly description',
    legalSuggestion: 'Actionable legal advice'
  },
  // ... other patterns
];
```

### Testing

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Privacy Policy Analyzer extension
4. Test on privacy policy pages like:
   - Google Privacy Policy
   - Facebook Data Policy
   - Twitter Privacy Policy

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Areas for Contribution

- **New Analysis Patterns**: Help identify more privacy concerns
- **AI Integration**: Implement actual AI service integration
- **UI/UX Improvements**: Enhance the user interface
- **Localization**: Add support for multiple languages
- **Performance**: Optimize analysis speed and accuracy

## Privacy of This Extension

This extension:
- ✅ Analyzes content locally in your browser
- ✅ Does not send your data to external servers
- ✅ Only stores analysis results locally
- ✅ Syncs only your preference settings
- ❌ Does not track your browsing
- ❌ Does not collect personal information

## Legal Disclaimer

This extension provides educational information about privacy policies but does not constitute legal advice. Always consult with a qualified attorney for legal matters.

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join GitHub Discussions for questions
- **Email**: Contact us at [your-email@example.com]

## Roadmap

### Version 1.1 (Coming Soon)
- Real AI integration (Gemini, OpenAI, Claude)
- GDPR/CCPA compliance checking
- Export analysis reports
- Browser notification system

### Version 1.2 (Future)
- Multi-language support
- Terms of Service analysis
- Cookie policy analysis
- Company privacy rating system

### Version 2.0 (Future)
- Browser-wide privacy dashboard
- Cross-site privacy tracking
- Privacy trend analysis
- Integration with legal databases

---

**Made with ❤️ for privacy protection**
