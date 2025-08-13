
module Seed
    module Types
        class UpdatePlaylistRequest < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :problems, Internal::Types::Array[String], optional: false, nullable: false

    end
end
