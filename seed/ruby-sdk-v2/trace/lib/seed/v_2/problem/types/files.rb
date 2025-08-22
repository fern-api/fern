# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class Files < Internal::Types::Model
          field :files, lambda {
            Internal::Types::Array[Seed::V2::Problem::Types::FileInfoV2]
          }, optional: false, nullable: false
        end
      end
    end
  end
end
