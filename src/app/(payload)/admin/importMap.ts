/**
 * Payload normally generates this map during `payload generate:importmap`.
 * Keeping an explicit empty map makes the W1 route deterministic until the
 * first dependency install and generation step are complete.
 */
export const importMap = {}
