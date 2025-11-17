# frozen_string_literal: true

module Seed
  module Auth
    module Types
      module GrantType
        extend Seed::Internal::Types::Enum

        AUTHORIZATION_CODE = "authorization_code"
        REFRESH_TOKEN = "refresh_token"
        CLIENT_CREDENTIALS = "client_credentials"
      end
    end
  end
end
