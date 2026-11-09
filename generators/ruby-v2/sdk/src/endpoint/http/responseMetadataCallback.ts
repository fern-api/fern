/** Capture metadata per request, without storing mutable last-response state on the client. */
export function responseMetadataCallback(): string {
    return `if code.between?(200, 299) && request_options[:on_response]
  request_options[:on_response].call(status: code, headers: response.to_hash)
end
`;
}
