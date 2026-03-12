# frozen_string_literal: true

module Seed
  module Internal
    module Logging
      # SDK logger that filters messages based on level and silent mode.
      #
      # Silent by default - no log output unless explicitly configured.
      #
      # @example Create via LogConfig
      #   config = LogConfig.new(level: :debug, silent: false)
      #   logger = Logger.from(config)
      #   logger.debug("request sent")
      #
      # @example Create directly
      #   logger = Logger.new(level: :debug, logger: ConsoleLogger.new, silent: false)
      #   logger.info("connected")
      class Logger
        # @param level [Symbol] the minimum log level (:debug, :info, :warn, :error)
        # @param logger [ILogger] the logger implementation
        # @param silent [Boolean] whether logging is silent
        def initialize(level: :info, logger: nil, silent: true)
          @level = LogLevel.from(level)
          @logger = logger || ConsoleLogger.new
          @silent = silent
        end

        # Returns a default silent logger (no output).
        # @return [Logger]
        def self.default
          @default ||= new(level: :info, logger: ConsoleLogger.new, silent: true)
        end

        # Creates a Logger from a LogConfig. If config is nil, returns the default silent logger.
        # @param config [LogConfig, Hash, nil] the logging configuration
        # @return [Logger]
        def self.from(config)
          return default if config.nil?

          if config.is_a?(LogConfig)
            new(level: config.level, logger: config.logger, silent: config.silent)
          elsif config.is_a?(Hash)
            new(
              level: config[:level] || config["level"] || :info,
              logger: config[:logger] || config["logger"],
              silent: if config.key?(:silent)
                        config[:silent]
                      else
                        (config.key?("silent") ? config["silent"] : true)
                      end
            )
          else
            default
          end
        end

        # @return [Boolean] whether debug messages should be logged
        def debug?
          should_log?(LogLevel::DEBUG)
        end

        # @return [Boolean] whether info messages should be logged
        def info?
          should_log?(LogLevel::INFO)
        end

        # @return [Boolean] whether warn messages should be logged
        def warn?
          should_log?(LogLevel::WARN)
        end

        # @return [Boolean] whether error messages should be logged
        def error?
          should_log?(LogLevel::ERROR)
        end

        # @param message [String]
        def debug(message, **)
          @logger.debug(message, **) if debug?
        end

        # @param message [String]
        def info(message, **)
          @logger.info(message, **) if info?
        end

        # @param message [String]
        def warn(message, **)
          @logger.warn(message, **) if warn?
        end

        # @param message [String]
        def error(message, **)
          @logger.error(message, **) if error?
        end

        private

        def should_log?(message_level)
          !@silent && @level <= message_level
        end
      end
    end
  end
end
