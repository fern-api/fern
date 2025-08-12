
module Seed
    module Types
        class Event < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
        end
    end
end
