# frozen_string_literal: true

module Seed
  module FolderD
    module Service
      module Types
        class Response < Internal::Types::Model
          field :foo, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
