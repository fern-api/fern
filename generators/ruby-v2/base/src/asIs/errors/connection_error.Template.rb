# frozen_string_literal: true

module <%= gem_namespace %>
  module Errors
    # Raised when the request fails before a response is received: the connection is refused,
    # reset or closed early, the host name cannot be resolved, or the TLS handshake fails.
    # The original exception is available as `cause`.
    class ConnectionError < ApiError
    end
  end
end
