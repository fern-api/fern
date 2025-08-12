
module Seed
    module Types
        class Script < Internal::Types::Model
            field :resource_type, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
        end
    end
end
