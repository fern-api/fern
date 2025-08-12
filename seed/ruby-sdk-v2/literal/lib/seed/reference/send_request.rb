
module Seed
    module Types
        class SendRequest < Internal::Types::Model
            field :prompt, , optional: false, nullable: false
            field :query, , optional: false, nullable: false
            field :stream, , optional: false, nullable: false
            field :ending, , optional: false, nullable: false
            field :context, , optional: false, nullable: false
            field :maybe_context, , optional: true, nullable: false
            field :container_object, , optional: false, nullable: false
        end
    end
end
