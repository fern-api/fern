# frozen_string_literal: true

module Seed
  module FolderC
    module Common
      module Types
        class FolderCFoo < Internal::Types::Model
          field :bar_property, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
