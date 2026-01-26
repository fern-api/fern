# frozen_string_literal: true

module FernExamples
  module File
    module Service
      module Types
        class GetFileRequest < Internal::Types::Model
          field :filename, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
