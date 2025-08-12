
module Seed
    module Types
        class SendEvent < Internal::Types::Model
            field :send_text, , optional: false, nullable: false
            field :send_param, , optional: false, nullable: false
        end
    end
end
