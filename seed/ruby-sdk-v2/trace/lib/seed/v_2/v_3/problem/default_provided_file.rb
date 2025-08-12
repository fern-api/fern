
module Seed
    module Types
        class DefaultProvidedFile < Internal::Types::Model
            field :file, , optional: false, nullable: false
            field :related_types, , optional: false, nullable: false
        end
    end
end
