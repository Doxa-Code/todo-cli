type TaskStatus = "inbox" | "done";
type TaskProps = {
	id: string;
	title: string;
	status: TaskStatus;
	priority: 1 | 2 | 3 | 4;
};

export class Task {
	public id: string;
	public title: string;
	public status: TaskStatus;
	public priority: 1 | 2 | 3 | 4;

	constructor(props: TaskProps) {
		this.id = props.id;
		this.title = props.title;
		this.status = props.status;
		this.priority = props.priority;
	}

	static instance(props: TaskProps) {
		return new Task(props);
	}

	done() {
		this.status = "done";
	}

	inbox() {
		this.status = "inbox";
	}

	static create(title: string, priority: 1 | 2 | 3 | 4) {
		return new Task({
			id: crypto.randomUUID().toString(),
			status: "inbox",
			title,
			priority,
		});
	}
}
