# frozen_string_literal: true

module FernFileUpload
  module Service
    module Types
      class MyInlineType < Internal::Types::Model
        field :bar, -> { String }, optional: false, nullable: false
      end
    end
  end
end
