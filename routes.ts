/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/error",
    "/auth/new-verification",
    "/auth/reset",
    "/auth/new-password",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/error",
    "/auth/reset",
    "/auth/new-password",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
*/
export const apiAuthPriefix = "/api/auth"

/**
 * The default route to redirect to after login
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/Dashboard"