
module Seed
    module Types
        class SendResponse < Internal::Types::Model
            field :message, , optional: false, nullable: false
            field :status, , optional: false, nullable: false
            field :success, , optional: false, nullable: false
        end
    end
end
