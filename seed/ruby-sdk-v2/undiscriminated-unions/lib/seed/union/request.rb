
module Seed
    module Types
        class Request < Internal::Types::Model
            field :union, Seed::union::MetadataUnion, optional: true, nullable: false
        end
    end
end
