
module Seed
    module Types
        class Event < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :name, String, optional: false, nullable: false
        end
    end
end
