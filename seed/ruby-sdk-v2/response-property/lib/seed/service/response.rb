
module Seed
    module Types
        class Response < Internal::Types::Model
            field :data, Seed::service::Movie, optional: false, nullable: false
        end
    end
end
