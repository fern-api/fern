
module Seed
    module Query
        class SendLiteralsInQueryRequest
            field :prompt, String, optional: false, nullable: false
            field :optional_prompt, String, optional: true, nullable: false
            field :alias_prompt, String, optional: false, nullable: false
            field :alias_optional_prompt, String, optional: true, nullable: false
            field :query, String, optional: false, nullable: false
            field :stream, Internal::Types::Boolean, optional: false, nullable: false
            field :optional_stream, Internal::Types::Boolean, optional: true, nullable: false
            field :alias_stream, Internal::Types::Boolean, optional: false, nullable: false
            field :alias_optional_stream, Internal::Types::Boolean, optional: true, nullable: false
        end
    end
end
