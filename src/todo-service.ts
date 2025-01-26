import { resolve } from "node:path";
import { Database } from "beta.db";
import inquirer from "inquirer";
import { Task } from "./task";

export class TodoService {
	private TODO_FILE = resolve(`${process.cwd()}/todo.md`);
	private database = new Database("todos.json");

	private fetchAllTodo() {
		const tasks = new Map<string, Task>();
		Object.entries(this.database.all()).map(([id, task]) =>
			tasks.set(id, Task.instance(task)),
		);
		return tasks;
	}

	addTask(title: string) {
		if (!title) {
			console.log("Por favor, forneça uma tarefa para adicionar.\n");
			return;
		}

		const task = Task.create(title);

		this.database.set(task.id, task);

		console.log("Tarefa adicionada com sucesso.\n");
	}

	async list() {
		const tasks = this.fetchAllTodo();

		if (tasks.size === 0) {
			console.log("Nenhuma tarefa encontrada.\n");
			return;
		}

		console.clear();

		const choices = Array.from(tasks.values())
			.sort((ta) => (ta.status === "done" ? 1 : -1))
			.map((task) => ({
				name: `${task.status === "done" ? "✅" : "⬜"} ${task.title}`,
				value: task.id,
			}));

		const { selectedTask } = await inquirer.prompt([
			{
				type: "list",
				name: "selectedTask",
				message:
					"Selecione uma tarefa para gerenciar (pressione Enter para escolher):",
				choices: [...choices, { name: "Sair", value: "exit" }],
			},
		]);

		if (selectedTask === "exit") {
			console.log("Feito");
			return;
		}

		const { action } = await inquirer.prompt([
			{
				type: "list",
				name: "action",
				message: "",
				choices: [
					{ name: "Concluído ✅", value: "complete" },
					{ name: "Inbox 📥", value: "inbox" },
					{ name: "Remover ❌", value: "remove" },
					{ name: "Voltar", value: "cancel" },
				],
			},
		]);

		switch (action) {
			case "complete": {
				const task = tasks.get(selectedTask);

				if (!task) break;

				task.done();

				this.database.set(task.id, task);
				this.list();

				break;
			}

			case "inbox": {
				const task = tasks.get(selectedTask);

				if (!task) break;

				task.inbox();

				this.database.set(task.id, task);
				this.list();

				break;
			}

			case "remove": {
				this.database.deleteEach(selectedTask);
				this.list();
				break;
			}
			case "cancel":
				this.list();
				break;
		}
	}

	static create() {
		return new TodoService();
	}
}
