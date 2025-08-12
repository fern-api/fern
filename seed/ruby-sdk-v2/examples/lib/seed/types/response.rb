
module Seed
    module Types
        class Response < Internal::Types::Model
            field :response, , optional: false, nullable: false
            field :identifiers, , optional: false, nullable: false
        end
    end
end
