import {
	CloudWatchLogsClient,
	DescribeLogStreamsCommand,
	GetLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const client = new CloudWatchLogsClient();

const logGroupName = "/aws/lambda/persist-objects";

const describeLogStreamsCommand = new DescribeLogStreamsCommand({
	logGroupName,
	orderBy: "LastEventTime",
});

const { logStreams } = await client.send(describeLogStreamsCommand);

for (const logStream of logStreams ?? []) {
	const getLogEventsCommand = new GetLogEventsCommand({
		logGroupName,
		logStreamName: logStream.logStreamName,
		startFromHead: true,
	});

	const { events } = await client.send(getLogEventsCommand);

	events?.forEach((event) => {
		console.log(`${event.timestamp}\t${event.message}`);
	});
}
