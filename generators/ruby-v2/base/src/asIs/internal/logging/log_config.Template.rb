# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Logging
      # Configuration for SDK logging.
      #
      # @example Basic usage
      #   config = LogConfig.new(level: :debug, silent: false)
      #
      # @example With a custom logger
      #   config = LogConfig.new(level: :debug, logger: MyCustomLogger.new, silent: false)
      #
      # Defaults:
      #   level  - :info
      #   logger - ConsoleLogger (writes to stderr via Ruby Logger)
      #   silent - true (no output unless explicitly enabled)
      class LogConfig
        # @return [Symbol] the minimum log level (:debug, :info, :warn, :error)
        attr_reader :level

        # @return [ILogger] the logger implementation
        attr_reader :logger

        # @return [Boolean] whether logging is silent (disabled)
        attr_reader :silent

        # @param level [Symbol] the minimum log level (default: :info)
        # @param logger [ILogger] a custom logger implementation (default: ConsoleLogger)
        # @param silent [Boolean] whether logging is silent (default: true)
        def initialize(level: :info, logger: nil, silent: true)
          @level = level
          @logger = logger || ConsoleLogger.new
          @silent = silent
        end
      end
    end
  end
end
