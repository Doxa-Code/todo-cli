type TaskStatus = "inbox" | "done";
type TaskProps = {
	id: string;
	title: string;
	status: TaskStatus;
};

export class Task {
	public id: string;
	public title: string;
	public status: TaskStatus;

	constructor(props: TaskProps) {
		this.id = props.id;
		this.title = props.title;
		this.status = props.status;
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

	static create(title: string) {
		return new Task({
			id: crypto.randomUUID().toString(),
			status: "inbox",
			title,
		});
	}
}
