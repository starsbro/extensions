# The Economist Group Privacy Policy Tests

This directory contains comprehensive end-to-end tests specifically designed for The Economist Group's privacy policy at https://www.economistgroup.com/privacy-policy.

## 🎯 Test Files Created

### 1. `economist-real-website-test.spec.js`

**Basic Website Analysis Testing**

- Privacy policy content detection
- Extension popup behavior validation
- Content detection accuracy across different pages
- Performance testing
- Mobile viewport testing

### 2. `economist-advanced-analysis.spec.js`

**Advanced Analysis Features**

- Specific privacy concern identification
- User rights detection (UK/GDPR, California, China)
- Data collection practice analysis
- Analysis quality and depth validation

### 3. `economist-complete-suite.spec.js`

**Complete End-to-End Testing**

- Configuration verification
- Full analysis workflow testing
- Multi-page accuracy testing
- Content-specific feature validation

### 4. `diagnostic-test.spec.js`

**Quick Diagnostic Testing**

- Configuration status check
- Popup behavior testing
- Workflow validation

## 🚀 Quick Start

### Prerequisites

1. **Configure your extension first:**

   ```bash
   # Open extension options page
   chrome-extension://fhlgakpcnflpcnenlhfmieelkigbgkkk/options.html

   # Set AI Provider to "Google Gemini API"
   # Enter your Gemini API key
   # Click "Test API Key" to verify
   # Save settings
   ```

2. **Ensure you have your API key ready:**
   - Get it from [Google AI Studio](https://aistudio.google.com/)
   - Must have Gemini 2.0 Flash access

### Run Tests

#### Option 1: Interactive Test Runner (Recommended)

```bash
./run-economist-tests.sh
```

#### Option 2: Individual Test Files

```bash
# Basic website analysis
npx playwright test tests/economist-real-website-test.spec.js --headed --timeout=120000

# Advanced analysis features
npx playwright test tests/economist-advanced-analysis.spec.js --headed --timeout=120000

# Complete end-to-end suite
npx playwright test tests/economist-complete-suite.spec.js --headed --timeout=120000

# Quick diagnostic
npx playwright test tests/diagnostic-test.spec.js --headed --timeout=120000
```

## 📋 What These Tests Cover

### Content Detection

- Privacy policy content identification
- False positive prevention (non-privacy pages)
- Content type accuracy

### Privacy Analysis

- **Data Collection Practices**

  - Personal information (name, email, address)
  - Usage data (browser, IP, pages visited)
  - Third-party data (LinkedIn, public sources)

- **Key Privacy Concerns**

  - Third-party data sharing
  - Cookie usage and tracking
  - International data transfers
  - Data retention periods
  - Marketing and profiling practices

- **User Rights Detection**
  - UK/GDPR rights (access, correct, delete, object)
  - California privacy rights (know, opt-out, delete)
  - China PIPL rights (comprehensive set)

### The Economist Specific Features

- **Subscription Services**

  - Account management
  - Billing and payment processing
  - Service notifications

- **Editorial Operations**

  - Journalism and source protection
  - Contributor data handling
  - Editorial integrity

- **Business Services**

  - EIU (Economist Intelligence Unit)
  - Corporate Network services
  - Event management
  - Educational programs

- **Global Operations**
  - International data transfers
  - Multi-jurisdiction compliance
  - Regional privacy laws

### Quality Metrics

- **Analysis Depth**

  - Word count validation (>100 words)
  - Topic coverage assessment
  - Structure analysis

- **Performance**

  - Page load time monitoring
  - Analysis completion time
  - Resource usage optimization

- **Accuracy**
  - Content detection precision
  - Privacy concern identification
  - Rights explanation completeness

## 🔧 Test Configuration

### Browser Settings

- **Extension Loading**: Automatic with persistent context
- **Viewport**: Desktop (1280x720) + Mobile (375x667) testing
- **Network**: Wait for networkidle state
- **Timeouts**: Extended to 120 seconds for AI analysis

### Expected Outcomes

#### If Properly Configured

- Privacy policy content detected ✓
- Analyze button enabled ✓
- AI analysis completes within 60 seconds ✓
- Analysis covers 5+ key privacy topics ✓
- Results include 100+ words ✓

#### ❌ If Configuration Issues

- Analyze button disabled ❌
- Status shows "Navigate to a website..." ❌
- AI Provider shows "built-in" instead of "gemini" ❌

## 🐛 Troubleshooting

### Common Issues

1. **"Analyze button is disabled"**

   ```bash
   # Check configuration
   npx playwright test tests/diagnostic-test.spec.js --headed

   # Solution: Configure API key properly
   ```

2. **"API key not working"**

   - Verify key has Gemini 2.0 Flash access
   - Check billing/quota limits
   - Generate new key if needed

3. **"Analysis times out"**

   - Check internet connection
   - Verify API key permissions
   - Try smaller timeout for testing

4. **"Extension not loading"**
   - Verify extension ID: `fhlgakpcnflpcnenlhfmieelkigbgkkk`
   - Check if extension is enabled
   - Reload extension if needed

### Debug Commands

```bash
# Check current configuration
npx playwright test tests/diagnostic-test.spec.js --headed --timeout=60000

# Test single feature
npx playwright test tests/economist-complete-suite.spec.js --headed --grep "configuration"

# View detailed output
npx playwright test tests/economist-real-website-test.spec.js --headed --reporter=line
```

## 📊 Test Results Interpretation

### Success Indicators

- **Content Detection Rate**: >90% accuracy
- **Analysis Completion**: <60 seconds
- **Topic Coverage**: >70% of key privacy areas
- **Quality Score**: >80% structural indicators found

### Performance Benchmarks

- **Page Load**: <10 seconds
- **Extension Response**: <3 seconds
- **Analysis Time**: 15-45 seconds (depending on content length)
- **Result Quality**: 100+ words, 5+ topics covered

## 🎯 Next Steps

1. **Run Configuration Check**:

   ```bash
   ./run-economist-tests.sh
   # Select option 6
   ```

2. **If Configuration OK, Run Full Suite**:

   ```bash
   ./run-economist-tests.sh
   # Select option 1
   ```

3. **For Issues, Run Diagnostic**:
   ```bash
   ./run-economist-tests.sh
   # Select option 5
   ```

## 📝 Notes

- Tests are designed to work with The Economist Group's actual privacy policy
- Real-time content analysis requires active internet connection
- AI analysis quality depends on API key configuration
- Tests include both positive and negative test cases
- Mobile viewport testing ensures responsive design compatibility

For additional help, see `QUICK_START_GUIDE.md` and `MANUAL_TESTING_STEPS.md`.
