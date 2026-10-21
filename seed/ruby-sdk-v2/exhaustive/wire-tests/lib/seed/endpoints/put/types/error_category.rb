# frozen_string_literal: true

require_relative "../../.."

module Seed
  module Endpoints
    module Put
      module Types
        module ErrorCategory
          extend Seed::Internal::Types::Enum

          API_ERROR = "API_ERROR"
          AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
          INVALID_REQUEST_ERROR = "INVALID_REQUEST_ERROR"
        end
      end
    end
  end
end
