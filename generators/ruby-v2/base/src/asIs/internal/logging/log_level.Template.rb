# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Logging
      # Log levels for SDK logging configuration.
      # Silent by default - no log output unless explicitly configured.
      module LogLevel
        DEBUG = 1
        INFO = 2
        WARN = 3
        ERROR = 4

        LEVEL_MAP = {
          debug: DEBUG,
          info: INFO,
          warn: WARN,
          error: ERROR
        }.freeze

        # Parse a log level from a string or symbol (case-insensitive).
        # @param level [String, Symbol] the level (debug, info, warn, error)
        # @return [Integer] the corresponding log level value
        # @raise [ArgumentError] if the string does not match any level
        def self.from(level)
          key = level.to_s.downcase.to_sym
          LEVEL_MAP.fetch(key) { raise ArgumentError, "Unknown log level: #{level}" }
        end
      end
    end
  end
end
