
module Seed
    module Types
        class SingleFilterSearchRequest < Internal::Types::Model
            field :field, , optional: true, nullable: false
            field :operator, , optional: true, nullable: false
            field :value, , optional: true, nullable: false
        end
    end
end
