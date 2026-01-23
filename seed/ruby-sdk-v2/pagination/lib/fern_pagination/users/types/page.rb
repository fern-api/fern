# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class Page < Internal::Types::Model
        field :page, -> { Integer }, optional: false, nullable: false
        field :next_, -> { FernPagination::Users::Types::NextPage }, optional: true, nullable: false, api_name: "next"
        field :per_page, -> { Integer }, optional: false, nullable: false
        field :total_page, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
