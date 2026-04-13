# frozen_string_literal: true

module Seed
  module Auth
    module Types
      module GetTokenRequestGrantType
        extend Seed::Internal::Types::Enum

        CLIENT_CREDENTIALS = "client_credentials"
      end
    end
  end
end
