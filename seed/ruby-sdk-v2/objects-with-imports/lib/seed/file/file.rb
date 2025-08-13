
module Seed
    module Types
        class File < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :contents, String, optional: false, nullable: false
            field :info, Seed::file::FileInfo, optional: false, nullable: false
        end
    end
end
