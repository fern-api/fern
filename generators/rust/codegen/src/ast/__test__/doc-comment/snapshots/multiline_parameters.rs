/// Get device information
///
/// # Arguments
///
/// * `name_or_id` - Device name or ID. Device names must be URI-encoded if they contain
/// non-URI-safe characters. If a device is named with another device's ID,
/// the device with the matching name will be returned.
/// * `tolerance` - Minimum interval (in seconds) that ranges must be separated by to be considered discrete.
/// Currently, the minimum meaningful value is 14s and smaller values will be clamped to this value.
