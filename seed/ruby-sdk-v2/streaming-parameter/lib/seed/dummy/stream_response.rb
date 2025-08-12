
module Seed
    module Types
        class StreamResponse < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :name, String, optional: true, nullable: false
        end
    end
end
