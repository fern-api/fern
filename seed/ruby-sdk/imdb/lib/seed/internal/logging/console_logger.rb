# frozen_string_literal: true

require "logger"

module Seed
  module Internal
    module Logging
      # Logger implementation that writes to stderr using Ruby's built-in Logger.
      #
      # Uses the "fern" progname with a simple format of "LEVEL - message".
      #
      # @example Basic usage
      #   client = MyClient.new(logger: ConsoleLogger.new)
      #
      # @example With a custom log level
      #   client = MyClient.new(logger: ConsoleLogger.new(level: :warn))
      class ConsoleLogger
        include ILogger

        # @param level [Symbol] the minimum log level (:debug, :info, :warn, :error), defaults to :info
        def initialize(level: :info)
          @level = LogLevel.from(level)
          @logger = ::Logger.new($stderr, progname: "fern")
          @logger.formatter = proc do |severity, _datetime, _progname, msg|
            "#{severity} - #{msg}\n"
          end
          @logger.level = ::Logger::DEBUG
        end

        # @param message [String]
        def debug(message, **_kwargs)
          @logger.debug(message) if @level <= LogLevel::DEBUG
        end

        # @param message [String]
        def info(message, **_kwargs)
          @logger.info(message) if @level <= LogLevel::INFO
        end

        # @param message [String]
        def warn(message, **_kwargs)
          @logger.warn(message) if @level <= LogLevel::WARN
        end

        # @param message [String]
        def error(message, **_kwargs)
          @logger.error(message) if @level <= LogLevel::ERROR
        end
      end
    end
  end
end
