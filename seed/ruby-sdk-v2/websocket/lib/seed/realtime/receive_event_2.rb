
module Seed
    module Types
        class ReceiveEvent2 < Internal::Types::Model
            field :gamma, String, optional: false, nullable: false
            field :delta, Integer, optional: false, nullable: false
            field :epsilon, Internal::Types::Boolean, optional: false, nullable: false

    end
end
