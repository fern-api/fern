```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.test();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.admin.updateTestSubmissionStatus(
	"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	{
		{ type : "stopped" }
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.admin.sendTestSubmissionUpdate(
  "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  {
    updateTime: "2024-01-15T09:30:00Z",
  }
);
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.admin.updateWorkspaceSubmissionStatus(
	"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	{
		{ type : "stopped" }
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.admin.sendWorkspaceSubmissionUpdate(
  "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  {
    updateTime: "2024-01-15T09:30:00Z",
  }
);
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.admin.storeTracedTestCase(
  "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  "string",
  {
    result: {
      result: {
        passed: true,
      },
      stdout: "string",
    },
    traceResponses: [
      {
        submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        lineNumber: 1,
        expressionLocation: {
          start: 1,
          offset: 1,
        },
        stack: {
          numStackFrames: 1,
          topStackFrame: {
            methodName: "string",
            lineNumber: 1,
          },
        },
        stdout: "string",
      },
    ],
  }
);
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.admin.storeTracedTestCaseV2(
	"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	"string",
	{
		[
			{
				submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				lineNumber: 1,
				file: {
					filename: "string",
					directory: "string"
				},
				expressionLocation: {
					start: 1,
					offset: 1
				},
				stack: {
					numStackFrames: 1,
					topStackFrame: {
						methodName: "string",
						lineNumber: 1
					}
				},
				stdout: "string"
			}
		]
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.admin.storeTracedWorkspace(
	"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	{
		workspaceRunDetails: {
			exceptionV2: exceptionV2: { 
				type : "generic", 
				exceptionType: "string",
				exceptionMessage: "string",
				exceptionStacktrace: "string"
			},
			exception: {
				exceptionType: "string",
				exceptionMessage: "string",
				exceptionStacktrace: "string"
			},
			stdout: "string"
		},
		traceResponses: [
			{
				submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				lineNumber: 1,
				expressionLocation: {
					start: 1,
					offset: 1
				},
				stack: {
					numStackFrames: 1,
					topStackFrame: {
						methodName: "string",
						lineNumber: 1
					}
				},
				stdout: "string"
			}
		]
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.admin.storeTracedWorkspaceV2(
	"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	{
		[
			{
				submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				lineNumber: 1,
				file: {
					filename: "string",
					directory: "string"
				},
				expressionLocation: {
					start: 1,
					offset: 1
				},
				stack: {
					numStackFrames: 1,
					topStackFrame: {
						methodName: "string",
						lineNumber: 1
					}
				},
				stdout: "string"
			}
		]
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.homepage.getHomepageProblems();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.homepage.setHomepageProblems(
	{
		[
			"string"
		]
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.migration.getAttemptedMigrations({
  adminKeyHeader: "string",
});
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.createPlaylist(1, {
  datetime: "2024-01-15T09:30:00Z",
  optionalDatetime: "2024-01-15T09:30:00Z",
  name: "string",
  problems: ["string"],
});
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.getPlaylists(1, {
  limit: 1,
  otherField: "string",
  multiLineDocs: "string",
  optionalMultipleField: "string",
  multipleField: "string",
});
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.getPlaylist(1, "string");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.getPlaylist(1, "string");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.getPlaylist(1, "string");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.updatePlaylist(1, "string", {
  name: "string",
  problems: ["string"],
});
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.updatePlaylist(1, "string", {
  name: "string",
  problems: ["string"],
});
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.playlist.deletePlaylist(1, "string");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.problem.createProblem(
	{
		problemName: "string",
		problemDescription: {
				boards: [
					
				]
			},
		files: {
				"JAVA": {
					solutionFile: {
						filename: "string",
						contents: "string"
					}
				}
			},
		inputParams: [
				{
					variableType: variableType: { type : "integerType" },
					name: "string"
				}
			],
		outputType: outputType: { type : "integerType" },
		testcases: [
				{
					testCase: {
						id: "string"
					}
				}
			],
		methodName: "string"
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.problem.updateProblem(
	"string",
	{
		problemName: "string",
		problemDescription: {
				boards: [
					
				]
			},
		files: {
				"JAVA": {
					solutionFile: {
						filename: "string",
						contents: "string"
					}
				}
			},
		inputParams: [
				{
					variableType: variableType: { type : "integerType" },
					name: "string"
				}
			],
		outputType: outputType: { type : "integerType" },
		testcases: [
				{
					testCase: {
						id: "string"
					}
				}
			],
		methodName: "string"
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.problem.deleteProblem("string");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });        
await client.problem.getDefaultStarterFiles(
	{
		inputParams: [
			{
				variableType: variableType: { type : "integerType" },
				name: "string"
			}
		],
		outputType: outputType: { type : "integerType" },
		methodName: "string"
	}
)
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
undefined;
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.submission.getExecutionSession("string");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.submission.stopExecutionSession("string");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.submission.getExecutionSessionsState();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.sysprop.setNumWarmInstances(1);
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.sysprop.getNumWarmInstances();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.problem.getLightweightProblems();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.problem.getProblems();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.problem.getLatestProblem("string");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.problem.getProblemVersion("string", 1);
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.v3.problem.getLightweightProblems();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.v3.problem.getProblems();
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.v3.problem.getLatestProblem("string");
 
```                        


```typescript
import { SeedTraceClient } from "@fern/trace";

const client = new SeedTraceClient({ token: "YOUR_TOKEN" });
await client.v2.v3.problem.getProblemVersion("string", 1);
 
```                        


