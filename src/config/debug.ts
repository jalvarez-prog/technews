// Debug configuration
export const DEBUG_CONFIG = {
  // Set to true to use the isolated test app
  useTestApp: false,
  
  // Set to true to enable verbose logging
  verboseLogging: true,
  
  // Set to true to disable analytics
  disableAnalytics: false
};

// Helper to check if we're in test mode
export function isTestMode(): boolean {
  // Check URL parameter
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('test') === 'true' || DEBUG_CONFIG.useTestApp;
  }
  return DEBUG_CONFIG.useTestApp;
}