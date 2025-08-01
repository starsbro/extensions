# Background Script Architecture

The background script has been refactored into a modular architecture for better maintainability and organization.

## File Structure

```
background/
├── installation-handler.js  # Extension installation and updates
├── message-handler.js       # Message routing and delegation
├── settings-manager.js      # Settings storage operations
├── storage-manager.js       # Analysis data management
└── api-tester.js           # API key validation

background.js               # Main orchestrator (imports all modules)
background-original.js      # Original monolithic file (backup)
```

## Module Responsibilities

### `installation-handler.js`

- Handles first-time installation
- Sets up default settings
- Opens welcome page
- Manages extension updates and migrations

### `message-handler.js`

- Routes incoming messages to appropriate handlers
- Manages message response patterns (sync vs async)
- Centralizes all message action handling
- Imports and delegates to other managers

### `settings-manager.js`

- Settings storage and retrieval
- Default settings management
- Settings validation and error handling
- Chrome storage sync operations

### `storage-manager.js`

- Analysis data cleanup and management
- Tab-specific data clearing
- URL analysis functionality
- Privacy-related URL detection

### `api-tester.js`

- API key validation for different providers
- Gemini API testing with model fallback
- Error handling for API failures
- API response validation

### `background.js` (Main)

- Orchestrates all modules
- Sets up Chrome extension listeners
- Manages lifecycle events
- Coordinates between components

## Benefits of This Architecture

**Single Responsibility**: Each module has one clear purpose
**Easier Testing**: Components can be tested in isolation
**Better Debugging**: Issues can be traced to specific modules
**Maintainability**: Changes affect only relevant modules
**Scalability**: Easy to add new message handlers or features

## Message Flow

1. **Incoming Message** → `background.js` listener
2. **Route Message** → `MessageHandler.handleMessage()`
3. **Delegate Action** → Appropriate manager (Settings, Storage, API)
4. **Send Response** → Back to caller

## Migration Notes

- The original `background.js` is preserved as `background-original.js`
- All functionality remains identical
- Uses ES6 modules with import/export
- Maintains same message API for popup and content scripts

## Usage

The refactored version handles all the same messages:

- `ping` - Health check
- `getCurrentTabId` - Tab identification
- `getSettings`/`saveSettings` - Settings management
- `testApiKey` - API validation
- `clearAllData` - Data cleanup
- `analyzeUrl` - URL analysis

No changes needed for other components - the message API is unchanged!
