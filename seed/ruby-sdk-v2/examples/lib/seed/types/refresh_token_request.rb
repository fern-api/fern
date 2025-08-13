
module Seed
    module Types
        class RefreshTokenRequest < Internal::Types::Model
            field :ttl, Integer, optional: false, nullable: false
        end
    end
end
