
module Seed
    module Types
        class Identifier < Internal::Types::Model
            field :type, , optional: false, nullable: false
            field :value, , optional: false, nullable: false
            field :label, , optional: false, nullable: false
        end
    end
end
