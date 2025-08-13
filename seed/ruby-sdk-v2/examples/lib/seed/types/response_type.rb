
module Seed
    module Types
        class ResponseType < Internal::Types::Model
            field :type, Seed::Type, optional: false, nullable: false
        end
    end
end
