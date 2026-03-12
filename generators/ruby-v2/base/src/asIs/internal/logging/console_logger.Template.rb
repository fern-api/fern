# frozen_string_literal: true

require "logger"

module <%= gem_namespace %>
  module Internal
    module Logging
      # Default logger implementation that writes to stderr using Ruby's built-in Logger.
      #
      # Uses the "fern" progname with a simple format of "LEVEL - message".
      class ConsoleLogger
        include ILogger

        def initialize
          @logger = ::Logger.new($stderr, progname: "fern")
          @logger.formatter = proc do |severity, _datetime, _progname, msg|
            "#{severity} - #{msg}\n"
          end
          @logger.level = ::Logger::DEBUG
        end

        # @param message [String]
        def debug(message, **_kwargs)
          @logger.debug(message)
        end

        # @param message [String]
        def info(message, **_kwargs)
          @logger.info(message)
        end

        # @param message [String]
        def warn(message, **_kwargs)
          @logger.warn(message)
        end

        # @param message [String]
        def error(message, **_kwargs)
          @logger.error(message)
        end
      end
    end
  end
end
