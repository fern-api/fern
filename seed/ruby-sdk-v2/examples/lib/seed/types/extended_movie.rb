
module Seed
    module Types
        class ExtendedMovie < Internal::Types::Model
            field :cast, , optional: false, nullable: false
        end
    end
end
