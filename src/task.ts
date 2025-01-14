export class Task {
	constructor(readonly title: string) {}

	static create(task: string) {
		return new Task(task || "");
	}
}
