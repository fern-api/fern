# frozen_string_literal: true

require_relative "../../../../seed"

module Seed
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
