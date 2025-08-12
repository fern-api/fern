
module Seed
    module Types
        # An OAuth token response.
        class TokenResponse < Internal::Types::Model
            field :access_token, , optional: false, nullable: false
            field :expires_in, , optional: false, nullable: false
        end
    end
end
