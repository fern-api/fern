# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Logging
      # Silent logger implementation that discards all log messages.
      #
      # Used as the default when no logger is provided to the SDK client.
      class NoOpLogger
        include ILogger

        # @param message [String]
        def debug(message, **_kwargs) = nil

        # @param message [String]
        def info(message, **_kwargs) = nil

        # @param message [String]
        def warn(message, **_kwargs) = nil

        # @param message [String]
        def error(message, **_kwargs) = nil
      end
    end
  end
end
