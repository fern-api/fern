
module Seed
    module Types
        class StuntDouble < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :actor_or_actress_id, String, optional: false, nullable: false
        end
    end
end
