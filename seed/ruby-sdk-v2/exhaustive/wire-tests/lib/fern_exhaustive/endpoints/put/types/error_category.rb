# frozen_string_literal: true

module FernExhaustive
  module Endpoints
    module Put
      module Types
        module ErrorCategory
          extend FernExhaustive::Internal::Types::Enum

          API_ERROR = "API_ERROR"
          AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
          INVALID_REQUEST_ERROR = "INVALID_REQUEST_ERROR"
        end
      end
    end
  end
end
