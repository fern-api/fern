
module Seed
    module Types
        class InvalidRequestResponse < Internal::Types::Model
            field :request, , optional: false, nullable: false
            field :cause, , optional: false, nullable: false
        end
    end
end
