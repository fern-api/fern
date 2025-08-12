
module Seed
    module Query
        class SendLiteralsInQueryRequest
            field :prompt, , optional: false, nullable: false
            field :optional_prompt, , optional: true, nullable: false
            field :alias_prompt, , optional: false, nullable: false
            field :alias_optional_prompt, , optional: true, nullable: false
            field :query, , optional: false, nullable: false
            field :stream, , optional: false, nullable: false
            field :optional_stream, , optional: true, nullable: false
            field :alias_stream, , optional: false, nullable: false
            field :alias_optional_stream, , optional: true, nullable: false
        end
    end
end
