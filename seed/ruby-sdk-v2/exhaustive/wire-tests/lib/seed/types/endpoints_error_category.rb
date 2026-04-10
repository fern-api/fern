# frozen_string_literal: true

module Seed
  module Types
    module EndpointsErrorCategory
      extend Seed::Internal::Types::Enum

      API_ERROR = "API_ERROR"
      AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
      INVALID_REQUEST_ERROR = "INVALID_REQUEST_ERROR"
    end
  end
end
