
module Seed
    module Types
        class Node < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :label, String, optional: true, nullable: false
            field :metadata, Seed::commons::metadata::Metadata, optional: true, nullable: false

    end
end
