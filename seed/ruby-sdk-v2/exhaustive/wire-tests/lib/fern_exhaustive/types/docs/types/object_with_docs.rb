# frozen_string_literal: true

module FernExhaustive
  module Types
    module Docs
      module Types
        class ObjectWithDocs < Internal::Types::Model
          field :string, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
