
module Seed
    module Types
        class StreamedCompletion < Internal::Types::Model
            field :delta, , optional: false, nullable: false
            field :tokens, , optional: true, nullable: false
        end
    end
end
