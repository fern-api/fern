
module Seed
    module Service
        class JustFileWithQueryParamsRequest
            field :maybe_string, , optional: true, nullable: false
            field :integer, , optional: false, nullable: false
            field :maybe_integer, , optional: true, nullable: false
            field :list_of_strings, , optional: false, nullable: false
            field :optional_list_of_strings, , optional: true, nullable: false
        end
    end
end
