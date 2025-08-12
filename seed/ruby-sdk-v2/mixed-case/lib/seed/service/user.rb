
module Seed
    module Types
        class User < Internal::Types::Model
            field :user_name, , optional: false, nullable: false
            field :metadata_tags, , optional: false, nullable: false
            field :extra_properties, , optional: false, nullable: false
        end
    end
end
