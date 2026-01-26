# frozen_string_literal: true

module FernAudiences
  module Foo
    module Types
      class ImportingType < Internal::Types::Model
        field :imported, -> { String }, optional: false, nullable: false
      end
    end
  end
end
