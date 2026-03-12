# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Logging
      # Interface for custom logger implementations.
      #
      # Implement this module's methods to provide a custom logging backend for the SDK.
      # The SDK will call the appropriate method based on the log level.
      #
      # @example
      #   class MyCustomLogger
      #     def debug(message, **kwargs) = puts("[DBG] #{message}")
      #     def info(message, **kwargs) = puts("[INF] #{message}")
      #     def warn(message, **kwargs) = puts("[WRN] #{message}")
      #     def error(message, **kwargs) = puts("[ERR] #{message}")
      #   end
      module ILogger
        # @param message [String]
        def debug(message, **kwargs)
          raise NotImplementedError
        end

        # @param message [String]
        def info(message, **kwargs)
          raise NotImplementedError
        end

        # @param message [String]
        def warn(message, **kwargs)
          raise NotImplementedError
        end

        # @param message [String]
        def error(message, **kwargs)
          raise NotImplementedError
        end
      end
    end
  end
end
