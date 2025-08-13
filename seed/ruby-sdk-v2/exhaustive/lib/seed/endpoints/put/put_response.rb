
module Seed
    module Types
        class PutResponse < Internal::Types::Model
            field :errors, Internal::Types::Array[Seed::endpoints::put::Error], optional: true, nullable: false

    end
end
