
module Seed
    module Types
        class SendResponse < Internal::Types::Model
            field :message, String, optional: false, nullable: false
            field :status, Integer, optional: false, nullable: false
            field :success, Internal::Types::Boolean, optional: false, nullable: false
        end
    end
end
