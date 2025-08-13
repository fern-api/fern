
module Seed
    module Types
        class FileInfo < Internal::Types::Model
            field :filename, String, optional: false, nullable: false
            field :contents, String, optional: false, nullable: false

    end
end
