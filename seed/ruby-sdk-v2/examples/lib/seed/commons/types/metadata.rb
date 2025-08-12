
module Seed
    module Types
        class Metadata < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :data, , optional: true, nullable: false
            field :json_string, , optional: true, nullable: false
        end
    end
end
