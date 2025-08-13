
module Seed
    module Service
        class JustFileWithQueryParamsRequest
            field :maybe_string, String, optional: true, nullable: false
            field :integer, Integer, optional: false, nullable: false
            field :maybe_integer, Integer, optional: true, nullable: false
            field :list_of_strings, String, optional: false, nullable: false
            field :optional_list_of_strings, String, optional: true, nullable: false
        end
    end
end
