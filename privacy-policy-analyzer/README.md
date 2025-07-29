# Privacy Policy Analyzer Chrome Extension

A sophisticated Chrome extension that combines AI-powered analysis with pattern-based detection to analyze privacy policies and highlight concerning clauses with expert legal suggestions.

## Features

- **🤖 AI-Powered Analysis**: Integrated with Google Gemini 2.0 Flash for intelligent privacy policy analysis
- **🔍 Smart Detection**: Automatically detects privacy policies and terms of service pages
- **🎯 Dual Analysis Engine**: Combines AI insights with robust pattern-based detection
- **💡 Expert Legal Suggestions**: Provides actionable legal advice for each identified issue
- **✨ Interactive Highlighting**: Advanced text highlighting with fuzzy matching and smooth scrolling
- **🏗️ Professional UI**: Icon-based branding with floating analysis panels
- **⚙️ Highly Customizable**: Configurable AI providers, analysis depth, and severity filtering
- **🔧 Modern Architecture**: ES6 modular design with dynamic loading and fallback systems

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

### Quick Start
1. **Install the extension** following the installation steps above
2. **Configure AI (Optional)**: Go to Settings to add your Gemini API key for enhanced AI analysis
3. **Visit any privacy policy page** - the extension auto-detects policy pages
4. **Analyze**: Click the extension icon and select "Analyze Page"
5. **Review Results**: Click "View Analysis Results" to see the interactive analysis panel

### Analysis Options

**Manual Analysis**
1. Click the extension icon in your Chrome toolbar
2. Click "Analyze Current Page" 
3. Wait for analysis to complete (supports both AI and pattern-based analysis)
4. View results in the floating analysis panel

**AI-Enhanced Analysis** 
1. Go to Settings (right-click extension icon → Options)
2. Add your Gemini API key under "AI Provider Configuration"
3. Choose analysis depth (Quick/Standard/Detailed)
4. Enjoy intelligent AI-powered privacy analysis with automatic fallback to pattern-based analysis

### Interactive Results Panel

The extension displays results in a professional floating panel featuring:
- **Clickable Issue Cards**: Click any issue to highlight the relevant text on the page
- **Severity-Based Filtering**: Filter by High/Medium/Low priority issues
- **Smart Text Highlighting**: Advanced fuzzy matching finds and highlights problematic clauses
- **Legal Recommendations**: Expert advice for each identified concern

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

- **AI Provider Configuration**: 
  - **Gemini API Integration**: Add your Gemini API key for AI-powered analysis
  - **Analysis Depth**: Choose Quick, Standard, or Detailed AI analysis
  - **Automatic Fallback**: Seamless fallback to pattern-based analysis if AI fails
- **Display Preferences**:
  - **Severity Filtering**: Select which issue types to highlight (High/Medium/Low)
  - **Smart Highlighting**: Toggle advanced text highlighting features
- **Privacy Controls**:
  - **Local Storage**: All analysis results stored locally in your browser
  - **API Security**: Gemini API keys stored securely in Chrome's encrypted storage

## Technical Architecture

### Modern ES6 Module System

The extension uses a sophisticated modular architecture:

1. **content-loader.js**: Bootloader that dynamically imports ES6 modules with fallback support
2. **Modular Content Scripts**:
   - `scripts/content-main.js`: Main entry point for content functionality
   - `scripts/privacy-analyzer.js`: Core analyzer with UI and highlighting (450+ lines)
   - `scripts/gemini-analyzer.js`: Gemini AI integration with robust error handling
   - `scripts/built-in-analyzer.js`: Pattern-based analysis engine
   - `scripts/text-extractor.js`: Intelligent content extraction
   - `scripts/utils.js`: Shared utilities and helper functions
3. **Background Service Workers**:
   - `background.js`: Main background script coordinator
   - `background/settings-manager.js`: Secure settings management
   - `background/api-tester.js`: API key validation
   - `background/message-handler.js`: Inter-script communication
   - `background/storage-manager.js`: Data persistence
4. **Professional UI Components**:
   - Icon-based branding with `icons/icon48.png`
   - Floating analysis panels with smart positioning
   - Interactive issue cards with click-to-highlight

### Dual Analysis Engine

**1. Gemini AI Analysis**
- Integrates with Google's Gemini 2.0 Flash API
- Intelligent privacy policy interpretation
- Advanced JSON recovery for malformed API responses
- Automatic retry logic with exponential backoff

**2. Pattern-Based Analysis** 
- Robust regex pattern matching for 15+ privacy concern categories
- Serves as reliable fallback when AI is unavailable
- Comprehensive coverage of GDPR, CCPA, and general privacy concerns

### Advanced Text Processing

The extension features sophisticated text highlighting:
- **Multi-tier Matching**: Exact → Partial → Fuzzy text matching
- **Smart Scrolling**: Smooth navigation to highlighted text
- **Context Awareness**: Intelligent text extraction avoiding navigation/ads
- **Visual Feedback**: Professional highlighting with animation effects

### Storage

The extension uses Chrome's storage API:
- **Sync Storage**: User settings (synced across devices)
- **Local Storage**: Analysis results (per-tab, temporary)

## Development

### Prerequisites

- Node.js (for development tools)
- Chrome browser
- Basic knowledge of JavaScript/HTML/CSS

### Storage & Security

- **Secure API Storage**: Gemini API keys encrypted in Chrome's secure storage
- **Local Analysis Cache**: Tab-specific results stored locally for performance
- **Privacy-First Design**: No data sent to external servers (except chosen AI provider)
- **Automatic Cleanup**: Old analysis data automatically cleaned up

## Development

### Prerequisites

- **Chrome Browser**: Latest version with Developer Mode enabled
- **Node.js**: For development tools (optional)
- **Gemini API Key**: For AI-powered analysis (optional - fallback available)
- **Text Editor**: VS Code recommended for ES6 module development

### Modern File Structure

```
privacy-policy-analyzer/
├── manifest.json                    # Extension manifest (Manifest V3)
├── background.js                    # Main background script
├── background/                      # Modular background scripts
│   ├── settings-manager.js         # Settings persistence
│   ├── api-tester.js               # API validation
│   ├── message-handler.js          # Message routing
│   ├── storage-manager.js          # Data management
│   └── installation-handler.js     # Install/update events
├── content-loader.js               # ES6 module bootloader
├── scripts/                        # Content script modules
│   ├── content-main.js             # Entry point (22 lines)
│   ├── privacy-analyzer.js         # Core analyzer (450+ lines)
│   ├── gemini-analyzer.js          # AI integration (160 lines)
│   ├── built-in-analyzer.js        # Pattern engine (95 lines)
│   ├── text-extractor.js          # Content extraction (28 lines)
│   ├── utils.js                    # Utilities (73 lines)
│   └── content-fallback.js        # Fallback script
├── content.css                     # Injected element styles
├── popup.html/js/css               # Extension popup interface
├── options.html/js/css             # Settings configuration
├── welcome.html/js/css             # Welcome page
├── icons/                          # Professional icon assets
│   ├── icon16.png, icon48.png, icon128.png
│   └── icon.svg                    # Master SVG source
├── DEVELOPMENT_GUIDE.md            # Comprehensive dev guide
└── README.md                       # This documentation
```

### Development Workflow

1. **Make Changes**: Edit any ES6 module in the `scripts/` directory
2. **Reload Extension**: Go to `chrome://extensions/` and click refresh
3. **Test**: Visit privacy policy pages and test functionality
4. **Debug**: Use Chrome DevTools with comprehensive error handling

### Adding New Features

**New Analysis Patterns**: Add to `built-in-analyzer.js`
```javascript
{
  id: 'new_pattern_id',
  pattern: /your_regex_pattern/gi,
  severity: 'high|medium|low',
  category: 'Category Name',
  title: 'Issue Title',
  description: 'User-friendly description',
  legalSuggestion: 'Actionable legal advice'
}
```

**New AI Providers**: Create new analyzer module following `gemini-analyzer.js` pattern
```javascript
// scripts/openai-analyzer.js
export class OpenAIAnalyzer {
  static async analyze(textContent, settings) {
    // Implementation here
  }
}
```

### Extension Architecture Benefits

- ✅ **Maintainable**: ES6 modules enable easy feature additions
- ✅ **Scalable**: Modular background scripts support growth  
- ✅ **Reliable**: Multiple fallback mechanisms ensure functionality
- ✅ **Professional**: Icon-based branding and polished UI
- ✅ **Intelligent**: AI integration with pattern-based backup
- ✅ **Secure**: Minimal permissions and encrypted storage

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Areas for Contribution

- **AI Integration**: Add support for OpenAI, Claude, or other AI providers
- **Analysis Patterns**: Expand the built-in pattern library
- **UI/UX Enhancements**: Improve the analysis panel and highlighting system
- **Internationalization**: Add multi-language support
- **Performance**: Optimize ES6 module loading and caching
- **Legal Expertise**: Enhance legal suggestions and recommendations

## Privacy & Security

This extension is designed with privacy as a core principle:

### What We DO:
- ✅ **Local Analysis**: Most analysis happens in your browser
- ✅ **Encrypted Storage**: API keys stored in Chrome's secure storage
- ✅ **Minimal Permissions**: Only requests essential browser permissions
- ✅ **User Control**: You choose when to use AI vs local analysis
- ✅ **Transparent Code**: Open source architecture you can review
- ✅ **Automatic Cleanup**: Analysis data cleaned up automatically

### What We DON'T Do:
- ❌ **No Tracking**: We don't track your browsing or behavior
- ❌ **No Data Collection**: No personal information collected or stored
- ❌ **No External Servers**: Only communicates with AI provider you configure
- ❌ **No Background Uploads**: No automatic data transmission
- ❌ **No Third-Party Analytics**: No tracking or analytics services

### AI Provider Privacy:
- When using Gemini AI: Policy text is sent to Google's Gemini API for analysis
- When using Local Analysis: No external communication whatsoever
- You have full control over when AI analysis is used

## Legal Disclaimer

This extension provides educational information about privacy policies but does not constitute legal advice. Always consult with a qualified attorney for legal matters.

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join GitHub Discussions for questions
- **Email**: Contact us at [your-email@example.com]

## Roadmap

### ✅ Completed (Current Version)
- ES6 modular architecture with dynamic loading
- Gemini 2.0 Flash AI integration with robust fallbacks
- Professional icon-based branding and UI
- Advanced text highlighting with fuzzy matching
- Comprehensive error handling and retry logic
- Secure API key storage and management
- Interactive floating analysis panels
- Pattern-based analysis covering 15+ privacy concern categories

### Version 1.1 (Next Release)
- Additional AI provider support (OpenAI GPT, Anthropic Claude)
- Enhanced GDPR/CCPA compliance analysis
- Export analysis reports (PDF/JSON)
- Browser notification system for concerning policies
- Performance optimizations and caching improvements

### Version 1.2 (Future)
- Multi-language interface support
- Terms of Service analysis capabilities
- Cookie policy analysis integration
- Company privacy rating and scoring system
- Batch analysis for multiple policies

### Version 2.0 (Long-term Vision)
- Cross-browser compatibility (Firefox, Safari)
- Privacy dashboard with trending analysis
- Integration with legal databases and precedents  
- Real-time policy change monitoring
- Advanced reporting and analytics features

---

## Extension Status: Production Ready 🚀

This Privacy Policy Analyzer represents a **mature, production-ready Chrome extension** featuring:

- **🏗️ Modern Architecture**: ES6 modules with sophisticated bootloader system
- **🤖 AI Integration**: Live Gemini 2.0 Flash API with intelligent fallbacks  
- **💎 Professional Quality**: Icon-based branding and polished user interface
- **🛡️ Security First**: Minimal permissions and encrypted storage
- **⚡ Performance Optimized**: Efficient algorithms with smart caching
- **🔧 Developer Friendly**: Well-documented modular codebase
- **🧪 Thoroughly Tested**: Comprehensive error handling and edge case coverage

**Ready for Chrome Web Store submission and real-world deployment.**

---

**Made with ❤️ for privacy protection and user empowerment**
