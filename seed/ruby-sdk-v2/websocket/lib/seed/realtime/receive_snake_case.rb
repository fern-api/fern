
module Seed
    module Types
        class ReceiveSnakeCase < Internal::Types::Model
            field :receive_text, , optional: false, nullable: false
            field :receive_int, , optional: false, nullable: false
        end
    end
end
