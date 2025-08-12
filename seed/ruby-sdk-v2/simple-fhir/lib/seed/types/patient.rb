
module Seed
    module Types
        class Patient < Internal::Types::Model
            field :resource_type, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
            field :scripts, , optional: false, nullable: false
        end
    end
end
