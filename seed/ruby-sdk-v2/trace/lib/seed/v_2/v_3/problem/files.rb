# frozen_string_literal: true

module Seed
    module Types
        class Files < Internal::Types::Model
            field :files, Internal::Types::Array[Seed::V2::V3::Problem::FileInfoV2], optional: false, nullable: false

    end
end
