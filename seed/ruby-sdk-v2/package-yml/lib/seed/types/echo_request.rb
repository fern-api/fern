
module Seed
    module Types
        class EchoRequest < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :size, , optional: false, nullable: false
        end
    end
end
