//! A global header whose flag name collides with a per-operation header
//! parameter must reach BOTH the built-in and the custom-command paths.
//!
//! Colliding globals are registered per-leaf rather than `global(true)`
//! (`register_global_header_on_nonconflicting_leaves`), while the
//! custom-command path resolves globals from the ROOT `ArgMatches`
//! (`build_binding_entry`). Before the env/default fallback the header was
//! stamped on spec-derived requests and silently dropped on custom ones.
use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::error::CliError;
use fern_cli_sdk::openapi::{AppContext, OpenApiBinding};

/// `X-Source` is declared as a global header AND as a header parameter on
/// `things.other`, which forces the per-leaf registration path.
const SPEC: &str = r#"
openapi: 3.0.0
info: { title: Probe API, version: "1.0" }
x-fern-global-headers:
  - header: X-Source
    optional: true
    default: cli
paths:
  /things:
    get:
      operationId: things_list
      tags: [things]
      responses:
        "200": { description: ok }
  /other:
    get:
      operationId: things_other
      tags: [things]
      parameters:
        - name: X-Source
          in: header
          schema: { type: string }
      responses:
        "200": { description: ok }
"#;

fn handle(_m: &clap::ArgMatches, ctx: &AppContext) -> Result<(), CliError> {
    let method = ctx.find_method("things", "list")?;
    ctx.invoke(method, None, None, None).map(|_| ())
}

/// Run `args` against a mock server and return the `X-Source` header seen on
/// each received request.
fn x_source_headers(args: &[&str]) -> Vec<String> {
    let rt = tokio::runtime::Runtime::new().expect("runtime");
    let server: &'static wiremock::MockServer = rt.block_on(async {
        let server = wiremock::MockServer::start().await;
        wiremock::Mock::given(wiremock::matchers::method("GET"))
            .respond_with(
                wiremock::ResponseTemplate::new(200)
                    .set_body_json(serde_json::json!({"ok": true})),
            )
            .mount(&server)
            .await;
        Box::leak(Box::new(server))
    });

    let uri = server.uri();
    let app = CliApp::new("probe-cli")
        .binding(OpenApiBinding::new().spec(SPEC))
        .command(clap::Command::new("probe"), OpenApiBinding::handler(handle));

    let mut argv: Vec<&str> = vec!["probe-cli", "--base-url", &uri];
    argv.extend_from_slice(args);
    let mut out: Vec<u8> = Vec::new();
    let exit = app.try_run_from_with_output(argv, &mut out);
    assert_eq!(exit, 0, "run failed: {}", String::from_utf8_lossy(&out));

    rt.block_on(server.received_requests())
        .expect("recorded requests")
        .iter()
        .map(|request| {
            request
                .headers
                .get("x-source")
                .map(|value| value.to_str().expect("utf-8 header").to_string())
                .unwrap_or_else(|| "<MISSING>".to_string())
        })
        .collect()
}

#[test]
fn colliding_global_header_reaches_builtin_command() {
    assert_eq!(x_source_headers(&["things", "list"]), vec!["cli".to_string()]);
}

#[test]
fn colliding_global_header_reaches_custom_command() {
    assert_eq!(
        x_source_headers(&["probe"]),
        vec!["cli".to_string()],
        "a colliding global header must not be dropped on the custom-command path",
    );
}
