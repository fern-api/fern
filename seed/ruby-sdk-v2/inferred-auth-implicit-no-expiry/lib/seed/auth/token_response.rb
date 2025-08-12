
module Seed
    module Types
        # An OAuth token response.
        class TokenResponse < Internal::Types::Model
            field :access_token, , optional: false, nullable: false
            field :refresh_token, , optional: true, nullable: false
        end
    end
end
