# frozen_string_literal: true

require_relative "../../.."

module Seed
  module FolderA
    module Service
      module Types
        class Response < Internal::Types::Model
          field :foo, -> { Seed::FolderB::Common::Types::Foo }, optional: true, nullable: false
        end
      end
    end
  end
end
