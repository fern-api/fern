# frozen_string_literal: true

module FernTrace
  module V2
    module V3
      module Problem
        module Types
          class Files < Internal::Types::Model
            field :files, -> { Internal::Types::Array[FernTrace::V2::V3::Problem::Types::FileInfoV2] }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
