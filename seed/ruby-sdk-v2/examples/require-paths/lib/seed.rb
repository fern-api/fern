# frozen_string_literal: true

require "json"
require "net/http"
require "securerandom"
require "time"

require_relative "seed/internal/json/serializable"
require_relative "seed/internal/types/type"
require_relative "seed/internal/types/utils"
require_relative "seed/internal/types/union"
require_relative "seed/internal/errors/constraint_error"
require_relative "seed/internal/errors/type_error"
require_relative "seed/internal/http/base_request"
require_relative "seed/internal/json/request"
require_relative "seed/internal/http/raw_client"
require_relative "seed/internal/multipart/multipart_encoder"
require_relative "seed/internal/multipart/multipart_form_data_part"
require_relative "seed/internal/multipart/multipart_form_data"
require_relative "seed/internal/multipart/multipart_request"
require_relative "seed/internal/types/model/field"
require_relative "seed/internal/types/model"
require_relative "seed/internal/types/array"
require_relative "seed/internal/types/boolean"
require_relative "seed/internal/types/enum"
require_relative "seed/internal/types/hash"
require_relative "seed/internal/types/unknown"
require_relative "seed/errors/api_error"
require_relative "seed/errors/response_error"
require_relative "seed/errors/client_error"
require_relative "seed/errors/redirect_error"
require_relative "seed/errors/server_error"
require_relative "seed/errors/timeout_error"
require_relative "seed/internal/iterators/item_iterator"
require_relative "seed/internal/iterators/cursor_item_iterator"
require_relative "seed/internal/iterators/offset_item_iterator"
require_relative "seed/internal/iterators/cursor_page_iterator"
require_relative "seed/internal/iterators/offset_page_iterator"
require_relative "seed/errors/connection_error"
require_relative "seed/client"
require_relative "seed/file/client"
require_relative "seed/file/notification/client"
require_relative "seed/file/notification/service/client"
require_relative "seed/file/service/client"
require_relative "seed/file/service/types/get_file_request"
require_relative "seed/health/client"
require_relative "seed/health/service/client"
require_relative "seed/service/client"
require_relative "seed/service/types/get_metadata_request"
require_relative "seed/environment"

module Seed
  module Types
    autoload :BasicType, ::File.join(__dir__, "seed/types/basic_type")
    autoload :ComplexType, ::File.join(__dir__, "seed/types/complex_type")
    autoload :Type, ::File.join(__dir__, "seed/types/type")
    autoload :Identifier, ::File.join(__dir__, "seed/types/identifier")
    autoload :TypeWithSingleCharPropertyEqualToTypeStartingLetter, ::File.join(__dir__, "seed/types/type_with_single_char_property_equal_to_type_starting_letter")

    module Types
      autoload :MovieID, ::File.join(__dir__, "seed/types/types/movie_id")
      autoload :Movie, ::File.join(__dir__, "seed/types/types/movie")
      autoload :Actor, ::File.join(__dir__, "seed/types/types/actor")
      autoload :Actress, ::File.join(__dir__, "seed/types/types/actress")
      autoload :StuntDouble, ::File.join(__dir__, "seed/types/types/stunt_double")
      autoload :CastMember, ::File.join(__dir__, "seed/types/types/cast_member")
      autoload :ExtendedMovie, ::File.join(__dir__, "seed/types/types/extended_movie")
      autoload :Moment, ::File.join(__dir__, "seed/types/types/moment")
      autoload :File, ::File.join(__dir__, "seed/types/types/file")
      autoload :Directory, ::File.join(__dir__, "seed/types/types/directory")
      autoload :Tree, ::File.join(__dir__, "seed/types/types/tree")
      autoload :Node, ::File.join(__dir__, "seed/types/types/node")
      autoload :Metadata, ::File.join(__dir__, "seed/types/types/metadata")
      autoload :ExceptionInfo, ::File.join(__dir__, "seed/types/types/exception_info")
      autoload :Exception, ::File.join(__dir__, "seed/types/types/exception")
      autoload :MigrationStatus, ::File.join(__dir__, "seed/types/types/migration_status")
      autoload :Migration, ::File.join(__dir__, "seed/types/types/migration")
      autoload :Request, ::File.join(__dir__, "seed/types/types/request")
      autoload :Response, ::File.join(__dir__, "seed/types/types/response")
      autoload :ResponseType, ::File.join(__dir__, "seed/types/types/response_type")
      autoload :Test, ::File.join(__dir__, "seed/types/types/test")
      autoload :Entity, ::File.join(__dir__, "seed/types/types/entity")
      autoload :BigEntity, ::File.join(__dir__, "seed/types/types/big_entity")
      autoload :CronJob, ::File.join(__dir__, "seed/types/types/cron_job")
      autoload :RefreshTokenRequest, ::File.join(__dir__, "seed/types/types/refresh_token_request")
    end
  end

  module Commons
    module Types
      module Types
        autoload :Tag, ::File.join(__dir__, "seed/commons/types/types/tag")
        autoload :Metadata, ::File.join(__dir__, "seed/commons/types/types/metadata")
        autoload :EventInfo, ::File.join(__dir__, "seed/commons/types/types/event_info")
        autoload :Data, ::File.join(__dir__, "seed/commons/types/types/data")
      end
    end
  end

  module File
    module Service
      module Types
        autoload :Filename, ::File.join(__dir__, "seed/file/service/types/filename")
      end
    end
  end
end

# Load user-defined files if present (e.g., for Sentry integration)
# Files are loaded from lib/seed/ if they exist
["seed/custom_integration", "seed/sentry_integration"].each do |relative_path|
  absolute_path = File.join(__dir__, "#{relative_path}.rb")
  require_relative relative_path if File.exist?(absolute_path)
end
