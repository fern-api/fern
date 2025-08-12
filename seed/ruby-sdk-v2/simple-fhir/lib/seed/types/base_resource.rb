
module Seed
    module Types
        class BaseResource < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :related_resources, , optional: false, nullable: false
            field :memo, , optional: false, nullable: false
        end
    end
end
