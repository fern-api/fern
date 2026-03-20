# frozen_string_literal: true

module Seed
  module Internal
    module Logging
      # Silent logger implementation that discards all log messages.
      #
      # Used as the default when no logger is provided to the SDK client.
      class NoOpLogger
        include ILogger

        # @param message [String]
        def debug(_message, **_kwargs) = nil

        # @param message [String]
        def info(_message, **_kwargs) = nil

        # @param message [String]
        def warn(_message, **_kwargs) = nil

        # @param message [String]
        def error(_message, **_kwargs) = nil
      end
    end
  end
end
