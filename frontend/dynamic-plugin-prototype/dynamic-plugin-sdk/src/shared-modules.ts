/**
 * Vendor modules shared between Console application and its dynamic plugins.
 *
 * At runtime, Console will override these modules to ensure a single version of React
 * etc. is loaded and used by the host application.
 */
export const sharedVendorModules = ['react'];
