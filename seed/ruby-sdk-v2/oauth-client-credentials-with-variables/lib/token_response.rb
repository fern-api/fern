# frozen_string_literal: true

module Auth
    module Types
        # An OAuth token response.
        class TokenResponse < Internal::Types::Model
            field :access_token, String, optional: true, nullable: true
            field :expires_in, Integer, optional: true, nullable: true
            field :refresh_token, Array, optional: true, nullable: true
        end
    end
end
