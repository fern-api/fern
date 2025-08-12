
module Seed
    module Types
        class NamedMetadata < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :value, , optional: false, nullable: false
        end
    end
end
