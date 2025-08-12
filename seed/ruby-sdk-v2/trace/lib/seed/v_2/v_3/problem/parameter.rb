
module Seed
    module Types
        class Parameter < Internal::Types::Model
            field :parameter_id, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
            field :variable_type, , optional: false, nullable: false
        end
    end
end
